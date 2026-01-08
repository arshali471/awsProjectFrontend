// @ts-nocheck
import { useContext, useEffect, useState } from "react";
import { LoadingContext, SelectedRegionContext } from "../../../context/context";
import { AdminService } from "../../../services/admin.service";
import toast from "react-hot-toast";
import AsyncSelect from 'react-select/async';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Paper,
    TextField,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    InputAdornment,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "../SharedPage.css";

export default function BedrockPricing() {
    const { selectedRegion, setSelectedRegion }: any = useContext(SelectedRegionContext);
    const { loading, setLoading }: any = useContext(LoadingContext);

    const [pricingData, setPricingData] = useState<any>(null);
    const [searchText, setSearchText] = useState("");
    const [filteredModels, setFilteredModels] = useState<any[]>([]);
    const [keysData, setKeysData] = useState<any>([]);

    // Cost Calculator State
    const [selectedModel, setSelectedModel] = useState("");
    const [inputTokens, setInputTokens] = useState("");
    const [outputTokens, setOutputTokens] = useState("");
    const [calculatedCost, setCalculatedCost] = useState<any>(null);

    // Fetch AWS keys for region selection
    const getAllAwsKeys = async () => {
        try {
            const res = await AdminService.getAllAwsKey();
            if (res.status === 200) {
                const mappedKeys = res.data.map((data: any) => ({
                    label: `${data.region} - ${data.enviroment}`,
                    value: data._id
                }));
                setKeysData(mappedKeys);

                // Auto-select first key if none selected
                if (!selectedRegion && mappedKeys.length > 0) {
                    setSelectedRegion(mappedKeys[0]);
                }
            }
        } catch (err) {
            toast.error("Failed to load AWS regions");
        }
    };

    const filterKeys = (inputValue: string) => {
        return keysData.filter((i: any) =>
            i.label.toLowerCase().includes(inputValue.toLowerCase())
        );
    };

    const loadOptions = (
        inputValue: string,
        callback: (options: any[]) => void
    ) => {
        setTimeout(() => {
            callback(filterKeys(inputValue));
        }, 300);
    };

    // Fetch AWS keys on mount
    useEffect(() => {
        getAllAwsKeys();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchPricingData = async () => {
        if (!selectedRegion?.value) {
            return;
        }

        setLoading(true);

        try {
            // Fetch all inference models pricing from Pricing API
            const response = await AdminService.getBedrockPricingSummary(selectedRegion.value);

            if (response.status === 200 && response.data?.data) {
                const data = response.data.data;
                setPricingData(data);
                setFilteredModels(data.models || []);
                toast.success(`Loaded ${data.modelCount || 0} inference models`);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to fetch Bedrock pricing");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (selectedRegion?.value) {
            fetchPricingData();
        } else {
            // Reset data when no region selected
            setPricingData(null);
            setFilteredModels([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRegion?.value]);

    // Filter models based on search text
    useEffect(() => {
        if (!pricingData?.models) return;

        const filtered = pricingData.models.filter((model: any) => {
            const searchLower = searchText.toLowerCase();
            return (
                model.modelName.toLowerCase().includes(searchLower) ||
                model.modelId.toLowerCase().includes(searchLower) ||
                model.provider.toLowerCase().includes(searchLower)
            );
        });
        setFilteredModels(filtered);
    }, [searchText, pricingData]);

    const handleCalculateCost = async () => {
        if (!selectedModel || !inputTokens || !outputTokens) {
            toast.error("Please fill all calculator fields");
            return;
        }

        try {
            const response = await AdminService.calculateBedrockCost(selectedRegion.value, {
                modelId: selectedModel,
                inputTokens: parseInt(inputTokens),
                outputTokens: parseInt(outputTokens),
            });

            if (response.status === 200) {
                setCalculatedCost(response.data.data);
                toast.success("Cost calculated successfully");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to calculate cost");
        }
    };

    const handleClearCache = async () => {
        try {
            const response = await AdminService.clearBedrockPricingCache();
            if (response.status === 200) {
                toast.success("Cache cleared successfully");
                fetchPricingData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to clear cache");
        }
    };

    const getProviderColor = (provider: string) => {
        const colors: any = {
            "Anthropic": "#191919",
            "Amazon": "#FF9900",
            "Meta": "#0668E1",
            "AI21 Labs": "#6B4FBB",
            "Cohere": "#39594D",
            "Stability AI": "#7C3AED",
            "Mistral AI": "#F2A444",
        };
        return colors[provider] || "#0073bb";
    };

    return (
        <div className="page-wrapper">
            {/* Page Header */}
            <Box sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" gap={2} justifyContent="space-between" flexWrap="wrap">
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: '0 4px 16px rgba(0, 115, 187, 0.3)',
                            }}
                        >
                            <PriceCheckIcon sx={{ fontSize: 32 }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                Bedrock Inference Models Pricing
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 0.5 }}>
                                All available inference models with pricing (Per 1000 tokens)
                            </Typography>
                        </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={{ minWidth: 250, maxWidth: 300 }}>
                            <AsyncSelect
                                value={selectedRegion}
                                placeholder="Select AWS Region..."
                                cacheOptions
                                loadOptions={loadOptions}
                                defaultOptions={keysData}
                                isClearable={false}
                                onChange={(e: any) => {
                                    setSelectedRegion(e);
                                    setPricingData(null);
                                    setFilteredModels([]);
                                    setCalculatedCost(null);
                                }}
                                menuPortalTarget={document.body}
                                styles={{
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                    control: (base) => ({
                                        ...base,
                                        minHeight: '40px',
                                        borderRadius: '12px',
                                        backgroundColor: 'var(--bg-primary)',
                                        borderColor: 'rgba(0, 115, 187, 0.3)',
                                        '&:hover': {
                                            borderColor: 'rgba(0, 115, 187, 0.5)',
                                        }
                                    }),
                                    container: (base) => ({ ...base, width: '100%' }),
                                }}
                            />
                        </Box>

                        {selectedRegion?.value && (
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={handleClearCache}
                                sx={{
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--text-primary)',
                                    '&:hover': {
                                        borderColor: '#0073bb',
                                        backgroundColor: 'rgba(0, 115, 187, 0.1)',
                                    }
                                }}
                            >
                                Clear Cache
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* No Region Selected Message */}
            {!selectedRegion?.value && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        bgcolor: 'var(--bg-secondary)',
                        borderRadius: 2,
                        border: '1px solid var(--border-color)'
                    }}
                >
                    <Box sx={{ mb: 2 }}>
                        <PriceCheckIcon sx={{ fontSize: 64, color: 'var(--text-secondary)', opacity: 0.5 }} />
                    </Box>
                    <Typography variant="h5" sx={{ mb: 1, color: 'var(--text-primary)' }}>
                        No Region Selected
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'var(--text-secondary)', mb: 3 }}>
                        Please select an AWS region from the dropdown above to view Bedrock inference model pricing.
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                        The pricing information will be fetched from AWS Pricing API for all available inference models in the selected region.
                    </Typography>
                </Paper>
            )}

            {/* Summary Stats Cards */}
            {selectedRegion?.value && pricingData && (<>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card className="stat-card-elegant" elevation={0}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box>
                                <Typography variant="caption" className="stat-label-elegant">
                                    Region
                                </Typography>
                                <Typography variant="h5" className="stat-value-elegant">
                                    {pricingData?.region || "N/A"}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card className="stat-card-elegant" elevation={0}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box>
                                <Typography variant="caption" className="stat-label-elegant">
                                    Total Inference Models
                                </Typography>
                                <Typography variant="h5" className="stat-value-elegant">
                                    {pricingData?.modelCount || 0}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card className="stat-card-elegant" elevation={0}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box>
                                <Typography variant="caption" className="stat-label-elegant">
                                    Last Updated
                                </Typography>
                                <Typography variant="body2" className="stat-value-elegant" sx={{ fontSize: '0.9rem !important' }}>
                                    {pricingData?.lastUpdated ? new Date(pricingData.lastUpdated).toLocaleString() : "N/A"}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Cost Calculator */}
                <Grid item xs={12} md={12} lg={4}>
                    <Paper className="chart-card" elevation={0}>
                        <Box className="chart-header">
                            <Typography variant="h6" className="chart-title">
                                <CalculateIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Cost Calculator
                            </Typography>
                            <Typography variant="caption" className="chart-subtitle">
                                Estimate costs for your token usage
                            </Typography>
                        </Box>
                        <Box sx={{ p: 2 }}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="model-select-label">Select Model</InputLabel>
                                <Select
                                    labelId="model-select-label"
                                    value={selectedModel}
                                    label="Select Model"
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 400,
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>Choose a model...</em>
                                    </MenuItem>
                                    {filteredModels.map((model: any) => (
                                        <MenuItem key={model.modelId} value={model.modelId}>
                                            {model.modelName} ({model.provider})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                type="number"
                                label="Input Tokens"
                                value={inputTokens}
                                onChange={(e) => setInputTokens(e.target.value)}
                                sx={{ mb: 2 }}
                                inputProps={{ min: 0 }}
                            />

                            <TextField
                                fullWidth
                                type="number"
                                label="Output Tokens"
                                value={outputTokens}
                                onChange={(e) => setOutputTokens(e.target.value)}
                                sx={{ mb: 2 }}
                                inputProps={{ min: 0 }}
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleCalculateCost}
                                sx={{
                                    background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                                    mb: 2
                                }}
                            >
                                Calculate Cost
                            </Button>

                            {calculatedCost && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: 'var(--bg-secondary)', borderRadius: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                        Cost Breakdown
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">Input Cost:</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            ${calculatedCost.costs.inputCost}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">Output Cost:</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            ${calculatedCost.costs.outputCost}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid var(--border-color)' }}>
                                        <Typography variant="body2" fontWeight={700}>Total Cost:</Typography>
                                        <Typography variant="body2" fontWeight={700} color="primary">
                                            ${calculatedCost.costs.totalCost}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Pricing Table */}
                <Grid item xs={12} md={12} lg={8}>
                    <Paper className="chart-card" elevation={0}>
                        <Box className="chart-header">
                            <Typography variant="h6" className="chart-title">Inference Models Pricing</Typography>
                            <Typography variant="caption" className="chart-subtitle">
                                All available models with on-demand pricing
                            </Typography>
                        </Box>

                        <Box sx={{ p: 2 }}>
                            <TextField
                                fullWidth
                                placeholder="Search models, providers..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 2 }}
                            />

                            <TableContainer sx={{ maxHeight: 500 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Model</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Provider</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Input/1K Tokens</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Output/1K Tokens</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredModels.map((model: any) => (
                                            <TableRow key={model.modelId} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {model.modelName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {model.modelId}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={model.provider}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: getProviderColor(model.provider),
                                                            color: 'white',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight={600} color="primary">
                                                        ${model.pricing?.inputPer1kTokens || "N/A"}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight={600} color="primary">
                                                        ${model.pricing?.outputPer1kTokens || "N/A"}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {filteredModels.length === 0 && (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No models found matching your search
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Detailed Pricing Breakdown */}
                <Grid item xs={12}>
                    <Paper className="chart-card" elevation={0}>
                        <Box className="chart-header">
                            <Typography variant="h6" className="chart-title">Detailed Pricing Examples</Typography>
                            <Typography variant="caption" className="chart-subtitle">
                                Cost examples for different token volumes
                            </Typography>
                        </Box>

                        <Box sx={{ p: 2 }}>
                            {filteredModels.map((model: any) => (
                                <Accordion key={model.modelId} sx={{ mb: 1 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                            <Typography fontWeight={600}>{model.modelName}</Typography>
                                            <Chip
                                                label={model.provider}
                                                size="small"
                                                sx={{
                                                    bgcolor: getProviderColor(model.provider),
                                                    color: 'white',
                                                    fontWeight: 600
                                                }}
                                            />
                                            <Typography variant="body2" sx={{ ml: 'auto', color: 'var(--text-secondary)' }}>
                                                {model.modelId}
                                            </Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {model.exampleCosts ? (
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                                        Input Token Cost Examples
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography variant="body2">1K tokens:</Typography>
                                                        <Typography variant="body2" fontWeight={600}>${model.exampleCosts._1kInputTokens}</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography variant="body2">10K tokens:</Typography>
                                                        <Typography variant="body2" fontWeight={600}>${model.exampleCosts._10kInputTokens}</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="body2">100K tokens:</Typography>
                                                        <Typography variant="body2" fontWeight={600}>${model.exampleCosts._100kInputTokens}</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                                        Output Token Cost Examples
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography variant="body2">1K tokens:</Typography>
                                                        <Typography variant="body2" fontWeight={600}>${model.exampleCosts._1kOutputTokens}</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography variant="body2">10K tokens:</Typography>
                                                        <Typography variant="body2" fontWeight={600}>${model.exampleCosts._10kOutputTokens}</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="body2">100K tokens:</Typography>
                                                        <Typography variant="body2" fontWeight={600}>${model.exampleCosts._100kOutputTokens}</Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                Pricing information not available for this model
                                            </Typography>
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            </>)}
        </div>
    );
}
