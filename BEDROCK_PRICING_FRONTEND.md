# Bedrock Pricing Frontend Implementation

This document describes the frontend implementation for AWS Bedrock pricing visualization and cost calculation.

## Overview

The Bedrock Pricing frontend provides a user-friendly interface to:
- View pricing for all Bedrock models available in the selected region
- Search and filter models by name, provider, or model ID
- Calculate costs based on input and output token usage
- View example costs for common token volumes (1K, 10K, 100K)
- Clear pricing cache to force refresh

## Features

### 1. Pricing Summary Dashboard
- **Region Info**: Displays the current AWS region
- **Environment**: Shows the environment (dev/staging/prod)
- **Total Models**: Count of available Bedrock models in the region
- **Last Updated**: Timestamp of when pricing was last fetched from AWS Pricing API

### 2. Cost Calculator
Interactive calculator that allows users to:
- Select a Bedrock model from dropdown
- Enter input token count
- Enter output token count
- Calculate total cost with breakdown:
  - Input cost
  - Output cost
  - Total cost

### 3. Model Pricing Table
Searchable table displaying:
- Model name and ID
- Provider (with color-coded chips)
- Input token pricing per 1K tokens
- Output token pricing per 1K tokens

**Supported Providers**:
- Anthropic (Claude models)
- Amazon (Titan models)
- Meta (Llama models)
- AI21 Labs (Jurassic models)
- Cohere
- Stability AI
- Mistral AI

### 4. Example Costs
Expandable accordion for each model showing example costs for:
- **Input Tokens**: 1K, 10K, 100K
- **Output Tokens**: 1K, 10K, 100K

### 5. Cache Management
Admin functionality to clear pricing cache and force fresh data fetch from AWS Pricing API.

## File Structure

```
awsProjectFrontend/src/
├── component/
│   ├── View/Private/BedrockPricing/
│   │   └── BedrockPricing.tsx          # Main pricing page component
│   ├── api/
│   │   └── urls.tsx                     # API endpoint definitions (updated)
│   ├── services/
│   │   └── admin.service.tsx            # Service layer methods (updated)
│   └── routes/
│       └── iff.routes.tsx               # Route definitions
├── Router.tsx                            # Main router (updated)
└── BEDROCK_PRICING_FRONTEND.md          # This file
```

## Component Details

### BedrockPricing.tsx

**Location**: `/Users/mdarshadali/PanicleTech/tcsProject/awsProjectFrontend/src/component/View/Private/BedrockPricing/BedrockPricing.tsx`

**Key Features**:
- Uses `SelectedRegionContext` to fetch pricing for the selected AWS region
- Real-time search filtering across model name, ID, and provider
- Material-UI components for consistent design
- Follows the same design patterns as Cost Dashboard (SharedPage.css)
- Responsive grid layout with 3-card stat summary

**State Management**:
```typescript
const [pricingData, setPricingData] = useState<any>(null);
const [searchText, setSearchText] = useState("");
const [filteredModels, setFilteredModels] = useState<any[]>([]);
const [selectedModel, setSelectedModel] = useState("");
const [inputTokens, setInputTokens] = useState("");
const [outputTokens, setOutputTokens] = useState("");
const [calculatedCost, setCalculatedCost] = useState<any>(null);
```

**API Integration**:
- `fetchPricingData()`: Calls `AdminService.getBedrockPricing(keyId)`
- `handleCalculateCost()`: Calls `AdminService.calculateBedrockCost(keyId, payload)`
- `handleClearCache()`: Calls `AdminService.clearBedrockPricingCache()`

## API Endpoints

### Frontend URL Configuration

**File**: `src/component/api/urls.tsx` (lines 52-54)

```typescript
cost: {
    // ... existing endpoints
    getBedrockPricing: "/aws/cost/bedrock-pricing",
    calculateBedrockCost: "/aws/cost/bedrock-calculate",
    clearBedrockPricingCache: "/aws/cost/bedrock-pricing/clear-cache",
}
```

### Service Layer Methods

**File**: `src/component/services/admin.service.tsx` (lines 304-314)

```typescript
static async getBedrockPricing(keyId: any) {
    return await makeRequest(url.cost.getBedrockPricing + "/" + keyId, RequestMethods.GET)
}

static async calculateBedrockCost(keyId: any, payload: any) {
    return await makeRequest(url.cost.calculateBedrockCost + "/" + keyId, RequestMethods.POST, payload)
}

static async clearBedrockPricingCache() {
    return await makeRequest(url.cost.clearBedrockPricingCache, RequestMethods.POST)
}
```

## Routing

### Main Route

**File**: `Router.tsx` (lines 122-130)

```typescript
<Route
    path="/bedrock-pricing"
    element={
        <PrivateRouter>
            <BedrockPricing />
        </PrivateRouter>
    }
/>
```

### Dashboard Integration

**File**: `IffDashboard.tsx` (line 33)

```typescript
const apps = [
    // ... other apps
    { url: "/cost", name: "Cost", icon: CostImage, isExternal: false, isIconComponent: false },
    { url: "/bedrock-pricing", name: "Bedrock Pricing", icon: PriceCheckIcon, isExternal: false, isIconComponent: true },
    // ... more apps
];
```

## Usage

### Accessing Bedrock Pricing

1. Navigate to the main dashboard (`/dashboard`)
2. Click on the "Bedrock Pricing" card
3. Or directly navigate to `/bedrock-pricing`

### Viewing Model Pricing

1. Select a region from the top bar region selector
2. Pricing data will automatically load for all models in that region
3. Use the search box to filter models by:
   - Model name
   - Model ID
   - Provider name

### Calculating Costs

1. In the "Cost Calculator" panel:
   - Select a model from the dropdown
   - Enter the number of input tokens
   - Enter the number of output tokens
   - Click "Calculate Cost"
2. The calculator will display:
   - Input cost breakdown
   - Output cost breakdown
   - Total estimated cost

### Example Cost Scenarios

1. Scroll to the "Example Costs" section
2. Click on any model accordion to expand
3. View pre-calculated costs for common token volumes:
   - 1,000 tokens
   - 10,000 tokens
   - 100,000 tokens

### Clearing Cache

1. Click the "Clear Cache" button in the top-right corner
2. Cache will be cleared and pricing will be refreshed from AWS Pricing API
3. **Note**: Pricing cache automatically refreshes every 24 hours

## Data Format

### Get Pricing Response

```json
{
  "success": true,
  "data": {
    "region": "us-east-1",
    "environment": "production",
    "modelCount": 15,
    "models": [
      {
        "modelId": "anthropic.claude-3-sonnet-20240229-v1:0",
        "provider": "Anthropic",
        "modelName": "Claude 3 Sonnet",
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
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

### Calculate Cost Request

```json
{
  "modelId": "anthropic.claude-3-sonnet-20240229-v1:0",
  "inputTokens": 5000,
  "outputTokens": 2000
}
```

### Calculate Cost Response

```json
{
  "success": true,
  "data": {
    "modelId": "anthropic.claude-3-sonnet-20240229-v1:0",
    "inputTokens": 5000,
    "outputTokens": 2000,
    "pricing": {
      "inputPer1kTokens": "0.003000",
      "outputPer1kTokens": "0.015000",
      "currency": "USD"
    },
    "costs": {
      "inputCost": "0.015000",
      "outputCost": "0.030000",
      "totalCost": "0.045000",
      "currency": "USD"
    }
  }
}
```

## Styling

The component uses:
- **SharedPage.css**: For consistent page layout and stat cards
- **Material-UI Theme**: Integrated with dark/light mode via CSS variables
- **Custom Provider Colors**: Each AI provider has a unique color for visual distinction

### Provider Color Mapping

```typescript
const colors = {
    "Anthropic": "#191919",    // Dark gray/black
    "Amazon": "#FF9900",        // AWS orange
    "Meta": "#0668E1",          // Meta blue
    "AI21 Labs": "#6B4FBB",     // Purple
    "Cohere": "#39594D",        // Teal green
    "Stability AI": "#7C3AED",  // Violet
    "Mistral AI": "#F2A444",    // Orange yellow
};
```

## Error Handling

The component handles:
- **No Region Selected**: Won't fetch data until a region is selected
- **API Failures**: Shows error toast with message from backend
- **Missing Pricing**: Displays "N/A" for unavailable data
- **Invalid Calculator Input**: Validates all fields before calculation

## Performance Considerations

- **24-hour Cache**: Pricing data is cached on the backend for 24 hours
- **Search Filtering**: Client-side filtering for instant results
- **Lazy Loading**: Accordion items only render when expanded
- **Responsive Design**: Grid layout adapts to screen size

## Testing Checklist

- [ ] Pricing loads correctly when region is selected
- [ ] Search filters models accurately
- [ ] Cost calculator produces correct results
- [ ] Provider chips display with correct colors
- [ ] Example costs expand/collapse properly
- [ ] Clear cache refreshes data
- [ ] Dark mode styling works correctly
- [ ] Responsive layout on mobile devices
- [ ] Error messages display for API failures
- [ ] Toast notifications appear for success/error

## Future Enhancements

Potential improvements:
1. Export pricing table to CSV/Excel
2. Compare pricing across multiple regions
3. Historical pricing trends chart
4. Bulk cost calculator for multiple models
5. Cost alerts based on token usage thresholds
6. Integration with actual Bedrock usage metrics

## Related Documentation

- Backend API: See `tcsAwsProject/BEDROCK_PRICING_API.md`
- Cost Dashboard: See `awsProjectFrontend/COST_DASHBOARD_*.md`
- Shared Patterns: See `awsProjectFrontend/CLAUDE.md`

## Support

For issues or questions:
1. Check backend logs for API errors
2. Verify AWS IAM permissions for `pricing:GetProducts`
3. Confirm region has Bedrock models available
4. Check browser console for frontend errors
