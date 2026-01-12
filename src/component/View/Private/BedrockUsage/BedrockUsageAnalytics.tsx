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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    Chip,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress
} from "@mui/material";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import RefreshIcon from "@mui/icons-material/Refresh";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupIcon from "@mui/icons-material/Group";
import ModelTrainingIcon from "@mui/icons-material/ModelTraining";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SpeedIcon from "@mui/icons-material/Speed";
import "../SharedPage.css";
import moment from "moment";

const COLORS = ['#0073bb', '#FF9900', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function BedrockUsageAnalytics() {
    const { selectedRegion, setSelectedRegion }: any = useContext(SelectedRegionContext);
    const { loading, setLoading }: any = useContext(LoadingContext);

    const [keysData, setKeysData] = useState<any>([]);
    const [days, setDays] = useState(30);
    const [tabValue, setTabValue] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    // User usage data
    const [myUsageData, setMyUsageData] = useState<any>(null);

    // Admin analytics data
    const [adminAnalytics, setAdminAnalytics] = useState<any>(null);

    const isAdmin = sessionStorage.getItem('admin') === 'true';

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

    useEffect(() => {
        getAllAwsKeys();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchMyUsage = async () => {
        setLoading(true);
        try {
            const regionParam = selectedRegion?.value ? selectedRegion.label.split(' - ')[0] : undefined;
            const res = await AdminService.getMyBedrockUsage(days, regionParam);
            if (res.status === 200 && res.data?.data) {
                setMyUsageData(res.data.data);

                // Check if there's any actual data
                if (res.data.data.summary.totalRequests > 0) {
                    toast.success("Usage data loaded successfully");
                } else {
                    toast.info("No usage data found for the selected period");
                }
            }
        } catch (error: any) {
            console.error("Error fetching usage:", error);
            toast.error(error.response?.data?.message || "Failed to fetch usage data");

            // Set empty data structure on error
            setMyUsageData({
                period: { days, startDate: '', endDate: '' },
                summary: {
                    totalInputTokens: 0,
                    totalOutputTokens: 0,
                    totalTokens: 0,
                    totalCost: 0,
                    totalRequests: 0,
                    successfulRequests: 0,
                    errorRequests: 0,
                    throttledRequests: 0,
                    avgLatency: 0
                },
                byModel: [],
                dailyUsage: []
            });
        }
        setLoading(false);
    };

    const fetchAdminAnalytics = async () => {
        setLoading(true);
        try {
            const regionParam = selectedRegion?.value ? selectedRegion.label.split(' - ')[0] : undefined;
            const res = await AdminService.getBedrockAdminAnalytics(days, regionParam);
            if (res.status === 200 && res.data?.data) {
                setAdminAnalytics(res.data.data);

                // Check if there's any actual data
                if (res.data.data.overallStats.totalRequests > 0) {
                    toast.success("Analytics loaded successfully");
                } else {
                    toast.info("No usage data found for the selected period");
                }
            }
        } catch (error: any) {
            console.error("Error fetching analytics:", error);
            toast.error(error.response?.data?.message || "Failed to fetch analytics");

            // Set empty data structure on error
            setAdminAnalytics({
                period: { days, startDate: '', endDate: '' },
                region: 'all',
                overallStats: {
                    totalUsers: 0,
                    totalInputTokens: 0,
                    totalOutputTokens: 0,
                    totalTokens: 0,
                    totalCost: 0,
                    totalRequests: 0,
                    successfulRequests: 0,
                    errorRequests: 0
                },
                topUsers: [],
                topModels: [],
                allUsers: [],
                allModels: []
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        // Fetch data with region filtering
        // Region is optional - if not selected, shows all regions
        if (isAdmin && tabValue === 1) {
            fetchAdminAnalytics();
        } else {
            fetchMyUsage();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [days, tabValue, selectedRegion]);

    const handleRefresh = () => {
        setRefreshing(true);
        if (isAdmin && tabValue === 1) {
            fetchAdminAnalytics();
        } else {
            fetchMyUsage();
        }
        setTimeout(() => setRefreshing(false), 1000);
    };

    const formatCurrency = (value: number) => {
        return `$${value.toFixed(4)}`;
    };

    const formatNumber = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(2)}M`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(2)}K`;
        }
        return value.toLocaleString();
    };

    // Render My Usage Tab
    const renderMyUsageTab = () => {
        if (!myUsageData) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                    <Typography variant="body1" color="text.secondary">
                        No usage data available for the selected period
                    </Typography>
                </Box>
            );
        }

        const { summary, byModel, dailyUsage } = myUsageData;

        return (
            <Grid container spacing={3}>
                {/* Summary Cards */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)', color: 'white' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Total Cost</Typography>
                                    <Typography variant="h4" fontWeight={700}>{formatCurrency(summary.totalCost)}</Typography>
                                </Box>
                                <AttachMoneyIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Total Requests</Typography>
                                    <Typography variant="h4" fontWeight={700}>{formatNumber(summary.totalRequests)}</Typography>
                                </Box>
                                <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Input Tokens</Typography>
                                    <Typography variant="h4" fontWeight={700}>{formatNumber(summary.totalInputTokens)}</Typography>
                                </Box>
                                <SpeedIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Output Tokens</Typography>
                                    <Typography variant="h4" fontWeight={700}>{formatNumber(summary.totalOutputTokens)}</Typography>
                                </Box>
                                <SpeedIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Daily Usage Chart */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>Daily Usage Trend</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dailyUsage}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tickFormatter={(date) => moment(date).format('MMM DD')} />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip
                                    labelFormatter={(date) => moment(date).format('MMM DD, YYYY')}
                                    formatter={(value: any, name: string) => {
                                        if (name === 'totalCost') return [formatCurrency(value), 'Cost'];
                                        return [formatNumber(value), name === 'inputTokens' ? 'Input Tokens' : name === 'outputTokens' ? 'Output Tokens' : 'Requests'];
                                    }}
                                />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="totalCost" stroke="#0073bb" strokeWidth={2} name="Cost" />
                                <Line yAxisId="right" type="monotone" dataKey="requestCount" stroke="#10b981" strokeWidth={2} name="Requests" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Request Status */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>Request Status</Typography>
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Box>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography variant="body2">Successful</Typography>
                                    <Typography variant="body2" fontWeight={600} color="success.main">
                                        {summary.successfulRequests}
                                    </Typography>
                                </Box>
                                <Box sx={{ width: '100%', height: 8, bgcolor: '#e5e7eb', borderRadius: 1 }}>
                                    <Box sx={{
                                        width: `${(summary.successfulRequests / summary.totalRequests) * 100}%`,
                                        height: '100%',
                                        bgcolor: '#10b981',
                                        borderRadius: 1
                                    }} />
                                </Box>
                            </Box>

                            <Box>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography variant="body2">Errors</Typography>
                                    <Typography variant="body2" fontWeight={600} color="error.main">
                                        {summary.errorRequests}
                                    </Typography>
                                </Box>
                                <Box sx={{ width: '100%', height: 8, bgcolor: '#e5e7eb', borderRadius: 1 }}>
                                    <Box sx={{
                                        width: `${(summary.errorRequests / summary.totalRequests) * 100}%`,
                                        height: '100%',
                                        bgcolor: '#ef4444',
                                        borderRadius: 1
                                    }} />
                                </Box>
                            </Box>

                            <Box>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography variant="body2">Throttled</Typography>
                                    <Typography variant="body2" fontWeight={600} color="warning.main">
                                        {summary.throttledRequests}
                                    </Typography>
                                </Box>
                                <Box sx={{ width: '100%', height: 8, bgcolor: '#e5e7eb', borderRadius: 1 }}>
                                    <Box sx={{
                                        width: `${(summary.throttledRequests / summary.totalRequests) * 100}%`,
                                        height: '100%',
                                        bgcolor: '#f59e0b',
                                        borderRadius: 1
                                    }} />
                                </Box>
                            </Box>

                            <Box mt={2}>
                                <Typography variant="body2" color="text.secondary">Average Latency</Typography>
                                <Typography variant="h5" fontWeight={600}>
                                    {summary.avgLatency ? `${Math.round(summary.avgLatency)}ms` : 'N/A'}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Models Table */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>Usage by Model</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Model</TableCell>
                                        <TableCell>Provider</TableCell>
                                        <TableCell align="right">Requests</TableCell>
                                        <TableCell align="right">Input Tokens</TableCell>
                                        <TableCell align="right">Output Tokens</TableCell>
                                        <TableCell align="right">Total Cost</TableCell>
                                        <TableCell align="right">Avg Latency</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {byModel.map((model: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={500}>{model.modelName}</Typography>
                                                <Typography variant="caption" color="text.secondary">{model.modelId}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={model.provider} size="small" />
                                            </TableCell>
                                            <TableCell align="right">{formatNumber(model.requestCount)}</TableCell>
                                            <TableCell align="right">{formatNumber(model.inputTokens)}</TableCell>
                                            <TableCell align="right">{formatNumber(model.outputTokens)}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(model.totalCost)}</TableCell>
                                            <TableCell align="right">{model.avgLatency ? `${model.avgLatency}ms` : 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        );
    };

    // Render Admin Analytics Tab
    const renderAdminAnalyticsTab = () => {
        if (!adminAnalytics) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                    <Typography variant="body1" color="text.secondary">
                        No analytics data available for the selected period
                    </Typography>
                </Box>
            );
        }

        const { overallStats, topUsers, topModels } = adminAnalytics;

        return (
            <Grid container spacing={3}>
                {/* Overall Stats Cards */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)', color: 'white' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Total Users</Typography>
                                    <Typography variant="h4" fontWeight={700}>{overallStats.totalUsers}</Typography>
                                </Box>
                                <GroupIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Total Cost</Typography>
                                    <Typography variant="h4" fontWeight={700}>{formatCurrency(overallStats.totalCost)}</Typography>
                                </Box>
                                <AttachMoneyIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Total Requests</Typography>
                                    <Typography variant="h4" fontWeight={700}>{formatNumber(overallStats.totalRequests)}</Typography>
                                </Box>
                                <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Total Tokens</Typography>
                                    <Typography variant="h4" fontWeight={700}>{formatNumber(overallStats.totalTokens)}</Typography>
                                </Box>
                                <SpeedIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Top Users Table */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>Top Users by Cost</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>User</TableCell>
                                        <TableCell align="right">Requests</TableCell>
                                        <TableCell align="right">Tokens</TableCell>
                                        <TableCell align="right">Cost</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {topUsers.map((user: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={500}>{user.username}</Typography>
                                                <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                                            </TableCell>
                                            <TableCell align="right">{formatNumber(user.totalRequests)}</TableCell>
                                            <TableCell align="right">{formatNumber(user.totalTokens)}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, color: '#0073bb' }}>
                                                {formatCurrency(user.totalCost)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* Top Models Table */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>Top Models by Cost</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Model</TableCell>
                                        <TableCell align="right">Requests</TableCell>
                                        <TableCell align="right">Users</TableCell>
                                        <TableCell align="right">Cost</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {topModels.map((model: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={500}>{model.modelName}</Typography>
                                                <Chip label={model.provider} size="small" sx={{ mt: 0.5 }} />
                                            </TableCell>
                                            <TableCell align="right">{formatNumber(model.totalRequests)}</TableCell>
                                            <TableCell align="right">{model.uniqueUsersCount}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, color: '#0073bb' }}>
                                                {formatCurrency(model.totalCost)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        );
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
                            <AssessmentIcon sx={{ fontSize: 32 }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                Bedrock Usage Analytics
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 0.5 }}>
                                Track your AWS Bedrock inference model usage and costs
                            </Typography>
                        </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Time Period</InputLabel>
                            <Select
                                value={days}
                                label="Time Period"
                                onChange={(e) => setDays(Number(e.target.value))}
                                sx={{ borderRadius: '10px', bgcolor: 'var(--bg-primary)' }}
                            >
                                <MenuItem value={7}>Last 7 days</MenuItem>
                                <MenuItem value={14}>Last 14 days</MenuItem>
                                <MenuItem value={30}>Last 30 days</MenuItem>
                                <MenuItem value={60}>Last 60 days</MenuItem>
                                <MenuItem value={90}>Last 90 days</MenuItem>
                            </Select>
                        </FormControl>

                        <Box sx={{ minWidth: 250, maxWidth: 300 }}>
                            <AsyncSelect
                                value={selectedRegion}
                                placeholder="Filter by Region (Optional)..."
                                cacheOptions
                                loadOptions={loadOptions}
                                defaultOptions={keysData}
                                isClearable={true}
                                onChange={(e: any) => {
                                    setSelectedRegion(e);
                                    // Trigger refresh when region changes
                                    if (isAdmin && tabValue === 1) {
                                        fetchAdminAnalytics();
                                    }
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
                                    }),
                                    container: (base) => ({ ...base, width: '100%' }),
                                }}
                            />
                        </Box>

                        <IconButton
                            onClick={handleRefresh}
                            disabled={refreshing}
                            sx={{
                                background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                                color: 'white',
                                width: 40,
                                height: 40,
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #005a9e 0%, #0073bb 100%)',
                                }
                            }}
                        >
                            {refreshing ? <CircularProgress size={24} sx={{ color: 'white' }} /> : <RefreshIcon />}
                        </IconButton>
                    </Box>
                </Box>
            </Box>


            {/* Main Content */}
            <Box>
                {isAdmin && (
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                            <Tab label="My Usage" />
                            <Tab label="Admin Analytics" />
                        </Tabs>
                    </Box>
                )}

                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {tabValue === 0 && renderMyUsageTab()}
                        {tabValue === 1 && isAdmin && renderAdminAnalyticsTab()}
                    </>
                )}
            </Box>
        </div>
    );
}
