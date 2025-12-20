# AWS Bedrock Cost Analysis Feature

## Overview

The Bedrock Cost Analysis feature combines actual usage data from AWS Cost Explorer with pricing information from the AWS Pricing API to show only Bedrock models that have been actually used, along with their associated costs and pricing rates.

## Key Features

1. **Usage-Based Display**: Shows only models with actual usage (last 30 days)
2. **Combined Data**: Merges usage metrics with pricing information
3. **Cost Breakdown**: Displays total costs, token usage, and request counts
4. **Pricing Information**: Shows per-1K token pricing for input and output
5. **Example Calculations**: Provides cost examples for common token volumes
6. **Real-time Analysis**: Fetches fresh data from both Cost Explorer and Pricing API

## Data Sources

### 1. AWS Cost Explorer
- **Purpose**: Provides actual usage data
- **Service**: Amazon Bedrock
- **Metrics**: UnblendedCost, UsageQuantity
- **Grouping**: By USAGE_TYPE dimension
- **Period**: Last 30 days (configurable)

### 2. AWS Pricing API
- **Purpose**: Provides pricing rates
- **Service**: Amazon Bedrock
- **Location**: us-east-1 (Pricing API endpoint)
- **Cache**: 24 hours
- **Data**: Input/Output token pricing per 1K tokens

## API Endpoint

### GET `/api/v1/aws/cost/bedrock-cost-analysis/:keyId?days=30`

**Purpose**: Get combined Bedrock usage and pricing data

**Request Parameters**:
- `keyId` (path): AWS Key ID from database
- `days` (query, optional): Number of days to analyze (default: 30)

**Response Format**:
```json
{
  "success": true,
  "data": {
    "region": "us-east-1",
    "environment": "production",
    "period": {
      "days": 30,
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "summary": {
      "totalModelsUsed": 5,
      "totalCost": 123.45,
      "totalInputTokens": 1500000,
      "totalOutputTokens": 750000,
      "currency": "USD"
    },
    "models": [
      {
        "modelName": "Claude 3 Sonnet",
        "modelId": "anthropic.claude-3-sonnet-20240229-v1:0",
        "provider": "Anthropic",
        "usage": {
          "inputTokens": 500000,
          "outputTokens": 250000,
          "totalRequests": 1500,
          "totalCost": 67.50,
          "currency": "USD"
        },
        "pricing": {
          "inputPer1kTokens": "0.003000",
          "outputPer1kTokens": "0.015000",
          "currency": "USD"
        },
        "exampleCosts": {
          "_1kInputTokens": "0.0030",
          "_1kOutputTokens": "0.0150",
          "_10kInputTokens": "0.0300",
          "_10kOutputTokens": "0.1500",
          "_100kInputTokens": "0.30",
          "_100kOutputTokens": "1.50"
        }
      }
    ],
    "dailyCosts": [
      {
        "date": "2024-01-01",
        "cost": 4.12
      }
    ]
  }
}
```

## Backend Implementation

### File: `tcsAwsProject/src/services/bedrockPricingService.ts`

**New Method**: `getBedrockCostAnalysis(keyId: string, days: number = 30)`

**Process**:
1. Fetch usage data from Cost Explorer via `AWSCostService.getBedrockCosts()`
2. Fetch pricing data from Pricing API via `getBedrockPricing()`
3. Match models between usage and pricing datasets
4. Combine the data into a unified response
5. Sort models by total cost (descending)

**Model Matching Logic**:
- Normalizes model names and IDs
- Matches by partial model ID
- Matches by provider name
- Falls back to usage data if pricing not found

### File: `tcsAwsProject/src/controllers/awsCostController.ts`

**New Controller**: `getBedrockCostAnalysis()`

**Responsibilities**:
- Extract `keyId` and `days` parameters
- Call service method
- Return formatted JSON response
- Handle errors with appropriate status codes

### File: `tcsAwsProject/src/router/aws.router.ts`

**New Route**:
```typescript
this.router.get("/cost/bedrock-cost-analysis/:keyId", authMiddleware(), AwsCostController.getBedrockCostAnalysis)
```

## Frontend Implementation

### File: `awsProjectFrontend/src/component/api/urls.tsx`

**New URL**:
```typescript
getBedrockCostAnalysis: "/aws/cost/bedrock-cost-analysis"
```

### File: `awsProjectFrontend/src/component/services/admin.service.tsx`

**New Service Method**:
```typescript
static async getBedrockCostAnalysis(keyId: any, days: number = 30) {
    return await makeRequest(url.cost.getBedrockCostAnalysis + "/" + keyId + "?days=" + days, RequestMethods.GET)
}
```

### File: `awsProjectFrontend/src/component/View/Private/BedrockPricing/BedrockPricing.tsx`

**Changes Made**:

1. **Updated Data Fetching** (line 108):
   - Changed from `getBedrockPricing()` to `getBedrockCostAnalysis()`
   - Now fetches combined usage and pricing data

2. **Updated Stats Cards** (lines 313-375):
   - **Card 1**: Region (unchanged)
   - **Card 2**: "Used Models" instead of "Total Models"
   - **Card 3**: "Total Cost (30 days)" instead of "Environment"
   - **Card 4**: "Period" showing number of days

3. **Enhanced Table** (lines 478-565):
   - Added "Total Cost" column (actual usage cost)
   - Added "Requests" column (total requests count)
   - Kept "Input/1K" and "Output/1K" pricing columns
   - Shows "N/A" for models without pricing data

4. **Upgraded Accordion Section** (lines 567-679):
   - Added "Actual Usage (30 days)" panel showing:
     - Input Tokens (with comma formatting)
     - Output Tokens (with comma formatting)
     - Total Requests
     - Total Cost (highlighted in primary color)
   - Kept "Input Token Cost Examples" panel
   - Kept "Output Token Cost Examples" panel
   - Shows total cost in accordion header

## UI Components

### Summary Cards
- **Region**: AWS region for the data
- **Used Models**: Count of models with actual usage
- **Total Cost (30 days)**: Sum of all model costs
- **Period**: Number of days analyzed

### Usage Table
| Column | Description |
|--------|-------------|
| Model | Model name and ID |
| Provider | AI provider with color-coded chip |
| Total Cost | Actual cost from usage data (highlighted) |
| Requests | Total number of API requests |
| Input/1K | Pricing per 1K input tokens |
| Output/1K | Pricing per 1K output tokens |

### Detailed Accordion

Each model has an expandable accordion showing:

**Actual Usage Panel**:
- Input Tokens: Total tokens sent to model
- Output Tokens: Total tokens received from model
- Total Requests: Number of API calls
- Total Cost: Sum of all costs (highlighted)

**Cost Examples Panels** (if pricing available):
- Input costs for 1K, 10K, 100K tokens
- Output costs for 1K, 10K, 100K tokens

## Data Flow

1. **User selects AWS region** via AsyncSelect dropdown
2. **Frontend calls** `AdminService.getBedrockCostAnalysis(keyId, 30)`
3. **Backend controller** receives request with keyId
4. **Service layer** performs:
   - Fetch usage from Cost Explorer (30 days)
   - Fetch pricing from Pricing API (cached 24h)
   - Match and merge datasets
   - Calculate summary statistics
5. **Response sent** back to frontend
6. **UI updates** to display:
   - Summary stats in cards
   - Table with usage and pricing
   - Detailed accordions per model

## Error Handling

### Backend
- AWS credential validation
- Cost Explorer API errors
- Pricing API errors
- Model matching failures (graceful degradation)
- Empty usage data (returns empty models array)

### Frontend
- No region selected (shows empty state message)
- API call failures (toast error notification)
- Missing pricing data (shows "N/A" in table)
- No models used (shows empty table)

## Advantages Over Previous Implementation

### Before
- Showed ALL available Bedrock models (100+ models)
- Only pricing data, no actual usage
- No way to know which models are being used
- No cost tracking or analysis

### After
- Shows ONLY models with actual usage (typically 3-10 models)
- Combined usage + pricing data
- Clear visibility into what's being used
- Real cost tracking from Cost Explorer
- Better resource management and cost optimization

## Performance Considerations

1. **Pricing Cache**: 24-hour cache reduces API calls to Pricing API
2. **Cost Explorer**: Real-time data from last 30 days (no cache)
3. **Model Matching**: O(n*m) complexity where n = usage models, m = pricing models
   - Typically n is small (3-10 used models)
   - m is moderate (20-50 pricing models per region)
4. **Frontend Filtering**: Client-side search is instant
5. **Lazy Rendering**: Accordions render content only when expanded

## Testing Checklist

- [ ] Region selector populates with AWS keys
- [ ] Cost analysis data loads when region selected
- [ ] Summary cards show correct totals
- [ ] Table displays only used models
- [ ] Total cost column shows actual usage costs
- [ ] Requests column shows correct counts
- [ ] Pricing columns show per-1K token rates
- [ ] Search filter works across all fields
- [ ] Accordions expand/collapse properly
- [ ] Actual usage section shows token counts
- [ ] Example costs section displays pricing
- [ ] Models without pricing show "N/A"
- [ ] Empty state shows when no region selected
- [ ] Error toast appears on API failures
- [ ] Dark mode styling works correctly
- [ ] Responsive layout on mobile devices

## Future Enhancements

1. **Date Range Selector**: Allow custom date ranges (7, 30, 60, 90 days)
2. **Export to CSV**: Download usage and pricing data
3. **Cost Trends**: Chart showing daily/weekly costs over time
4. **Budget Alerts**: Set thresholds and get notifications
5. **Model Comparison**: Compare costs across multiple models
6. **Region Comparison**: Compare same model costs across regions
7. **Usage Forecasting**: Predict future costs based on trends
8. **Optimization Suggestions**: Recommend cheaper model alternatives

## Related Documentation

- **Pricing API Documentation**: `tcsAwsProject/BEDROCK_PRICING_API.md`
- **Frontend Pricing Page**: `awsProjectFrontend/BEDROCK_PRICING_FRONTEND.md`
- **Cost Service**: `tcsAwsProject/AWS_COST_API_DOCUMENTATION.md`
- **Cost Dashboard**: `awsProjectFrontend/COST_DASHBOARD_*.md`

## Support

For issues or questions:
1. Check CloudWatch logs for backend errors
2. Verify IAM permissions for Cost Explorer and Pricing APIs
3. Confirm region has Bedrock models available
4. Check browser console for frontend errors
5. Verify AWS credentials are correctly configured
