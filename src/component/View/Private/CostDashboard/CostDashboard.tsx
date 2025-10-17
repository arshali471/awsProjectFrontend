// @ts-nocheck
import { useContext, useEffect, useState } from "react";
import { LoadingContext, SelectedRegionContext } from "../../../context/context";
import { AdminService } from "../../../services/admin.service";
import toast from "react-hot-toast";
import { Box, Card, CardContent, Grid, Typography, Paper, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import "../SharedPage.css";
import "./CostDashboard.css";

const COLORS = ['#0073bb', '#1a8cd8', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd', '#00d2d3', '#ff9ff3', '#54a0ff'];

export default function CostDashboard() {
    const { selectedRegion }: any = useContext(SelectedRegionContext);
    const { loading, setLoading }: any = useContext(LoadingContext);

    const [dashboardData, setDashboardData] = useState<any>(null);
    const [costByService, setCostByService] = useState<any[]>([]);
    const [costByResource, setCostByResource] = useState<any[]>([]);
    const [ec2InstanceCosts, setEc2InstanceCosts] = useState<any[]>([]);
    const [forecast, setForecast] = useState<any[]>([]);
    const [comparison, setComparison] = useState<any>(null);
    const [topServices, setTopServices] = useState<any[]>([]);
    const [timeRange, setTimeRange] = useState<string>("30");

    const fetchAllCostData = async () => {
        if (!selectedRegion?.value) return;
        setLoading(true);

        try {
            // Fetch all cost endpoints in parallel
            const [dashRes, serviceRes, resourceRes, ec2Res, forecastRes, compareRes, topRes] = await Promise.all([
                AdminService.getCostDashboard(selectedRegion.value),
                AdminService.getCostByService(selectedRegion.value),
                AdminService.getCostByResource(selectedRegion.value),
                AdminService.getEC2InstanceCosts(selectedRegion.value),
                AdminService.getCostForecast(selectedRegion.value),
                AdminService.compareCosts(selectedRegion.value),
                AdminService.getTopServices(selectedRegion.value),
            ]);

            if (dashRes.status === 200) setDashboardData(dashRes.data);
            if (serviceRes.status === 200) setCostByService(serviceRes.data);
            if (resourceRes.status === 200) setCostByResource(resourceRes.data);
            if (ec2Res.status === 200) setEc2InstanceCosts(ec2Res.data);
            if (forecastRes.status === 200) setForecast(forecastRes.data);
            if (compareRes.status === 200) setComparison(compareRes.data);
            if (topRes.status === 200) setTopServices(topRes.data);

        } catch (error: any) {
            console.error("Error fetching cost data", error);
            toast.error(error.response?.data?.message || "Failed to fetch cost data");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (selectedRegion?.value) {
            fetchAllCostData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRegion?.value]);

    // Calculate summary stats
    const totalCost = dashboardData?.totalCost || 0;
    const monthlyEstimate = dashboardData?.monthlyEstimate || 0;
    const previousMonthCost = comparison?.previousMonth || 0;
    const costChange = previousMonthCost > 0 ? (((totalCost - previousMonthCost) / previousMonthCost) * 100).toFixed(2) : 0;

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <Paper sx={{ p: 1.5, bgcolor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    <Typography variant="body2" fontWeight={600}>{label}</Typography>
                    {payload.map((entry: any, index: number) => (
                        <Typography key={index} variant="caption" sx={{ color: entry.color }}>
                            {entry.name}: ${entry.value.toFixed(2)}
                        </Typography>
                    ))}
                </Paper>
            );
        }
        return null;
    };

    return (
        <div className="page-wrapper">
            {/* Page Header */}
            <Box sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" gap={2} justifyContent="space-between">
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
                            <AttachMoneyIcon sx={{ fontSize: 32 }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                Cost Dashboard
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 0.5 }}>
                                Monitor and analyze your AWS cost and usage
                            </Typography>
                        </Box>
                    </Box>

                    {/* Time Range Filter */}
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Time Range</InputLabel>
                        <Select
                            value={timeRange}
                            label="Time Range"
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <MenuItem value="7">Last 7 Days</MenuItem>
                            <MenuItem value="30">Last 30 Days</MenuItem>
                            <MenuItem value="90">Last 90 Days</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            {/* Summary Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card className="stat-card-elegant" elevation={0}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography variant="caption" className="stat-label-elegant">
                                        Current Month
                                    </Typography>
                                    <Typography variant="h4" className="stat-value-elegant">
                                        ${totalCost.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box className="stat-icon-elegant">
                                    <AttachMoneyIcon />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card className="stat-card-elegant" elevation={0}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography variant="caption" className="stat-label-elegant">
                                        Monthly Estimate
                                    </Typography>
                                    <Typography variant="h4" className="stat-value-elegant">
                                        ${monthlyEstimate.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box className="stat-icon-elegant">
                                    <AccountBalanceIcon />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card className={`stat-card-elegant ${parseFloat(costChange.toString()) > 0 ? 'stat-card-danger' : 'stat-card-success'}`} elevation={0}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography variant="caption" className="stat-label-elegant stat-label-white">
                                        Cost Change
                                    </Typography>
                                    <Typography variant="h4" className="stat-value-elegant stat-value-white">
                                        {costChange}%
                                    </Typography>
                                </Box>
                                <Box className="stat-icon-elegant stat-icon-white">
                                    <TrendingUpIcon />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card className="stat-card-elegant stat-card-warning" elevation={0}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography variant="caption" className="stat-label-elegant stat-label-white">
                                        Top Service
                                    </Typography>
                                    <Typography variant="h6" className="stat-value-elegant stat-value-white" sx={{ fontSize: '1.25rem !important' }}>
                                        {topServices[0]?.service || 'N/A'}
                                    </Typography>
                                </Box>
                                <Box className="stat-icon-elegant stat-icon-white">
                                    <WarningAmberIcon />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts Grid */}
            <Grid container spacing={3}>
                {/* Cost Forecast - Area Chart */}
                <Grid item xs={12} lg={8}>
                    <Paper className="chart-card" elevation={0}>
                        <Box className="chart-header">
                            <Typography variant="h6" className="chart-title">Cost Forecast</Typography>
                            <Typography variant="caption" className="chart-subtitle">
                                Projected costs for the next 30 days
                            </Typography>
                        </Box>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={forecast}>
                                <defs>
                                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0073bb" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#0073bb" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="date" stroke="var(--text-secondary)" />
                                <YAxis stroke="var(--text-secondary)" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area type="monotone" dataKey="cost" stroke="#0073bb" fillOpacity={1} fill="url(#colorCost)" name="Projected Cost ($)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Top Services - Pie Chart */}
                <Grid item xs={12} lg={4}>
                    <Paper className="chart-card" elevation={0}>
                        <Box className="chart-header">
                            <Typography variant="h6" className="chart-title">Top Services</Typography>
                            <Typography variant="caption" className="chart-subtitle">
                                Cost distribution by service
                            </Typography>
                        </Box>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={topServices}
                                    dataKey="cost"
                                    nameKey="service"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={(entry) => `${entry.service}: $${entry.cost.toFixed(2)}`}
                                >
                                    {topServices.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Cost by Service - Bar Chart */}
                <Grid item xs={12} lg={6}>
                    <Paper className="chart-card" elevation={0}>
                        <Box className="chart-header">
                            <Typography variant="h6" className="chart-title">Cost by Service</Typography>
                            <Typography variant="caption" className="chart-subtitle">
                                Breakdown of costs across all AWS services
                            </Typography>
                        </Box>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={costByService}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="service" stroke="var(--text-secondary)" angle={-45} textAnchor="end" height={100} />
                                <YAxis stroke="var(--text-secondary)" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="cost" fill="#0073bb" name="Cost ($)" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* EC2 Instance Costs - Line Chart */}
                <Grid item xs={12} lg={6}>
                    <Paper className="chart-card" elevation={0}>
                        <Box className="chart-header">
                            <Typography variant="h6" className="chart-title">EC2 Instance Costs</Typography>
                            <Typography variant="caption" className="chart-subtitle">
                                Daily EC2 usage costs over time
                            </Typography>
                        </Box>
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={ec2InstanceCosts}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="date" stroke="var(--text-secondary)" />
                                <YAxis stroke="var(--text-secondary)" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line type="monotone" dataKey="cost" stroke="#0073bb" strokeWidth={2} dot={{ fill: '#0073bb' }} name="EC2 Cost ($)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Cost by Resource - Bar Chart */}
                <Grid item xs={12}>
                    <Paper className="chart-card" elevation={0}>
                        <Box className="chart-header">
                            <Typography variant="h6" className="chart-title">Cost by Resource</Typography>
                            <Typography variant="caption" className="chart-subtitle">
                                Individual resource costs breakdown
                            </Typography>
                        </Box>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={costByResource}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="resource" stroke="var(--text-secondary)" angle={-45} textAnchor="end" height={120} />
                                <YAxis stroke="var(--text-secondary)" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="cost" fill="#1a8cd8" name="Cost ($)" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Cost Comparison */}
                {comparison && (
                    <Grid item xs={12} md={6}>
                        <Paper className="chart-card" elevation={0}>
                            <Box className="chart-header">
                                <Typography variant="h6" className="chart-title">Month-over-Month Comparison</Typography>
                                <Typography variant="caption" className="chart-subtitle">
                                    Current vs previous month costs
                                </Typography>
                            </Box>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={[
                                    { month: 'Previous Month', cost: comparison.previousMonth || 0 },
                                    { month: 'Current Month', cost: comparison.currentMonth || 0 }
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis dataKey="month" stroke="var(--text-secondary)" />
                                    <YAxis stroke="var(--text-secondary)" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="cost" fill="#4ecdc4" name="Cost ($)" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                )}

                {/* Summary Table */}
                <Grid item xs={12} md={comparison ? 6 : 12}>
                    <Paper className="chart-card" elevation={0}>
                        <Box className="chart-header">
                            <Typography variant="h6" className="chart-title">Cost Summary</Typography>
                            <Typography variant="caption" className="chart-subtitle">
                                Key cost metrics at a glance
                            </Typography>
                        </Box>
                        <Box sx={{ p: 2 }}>
                            <Box className="summary-row">
                                <Typography variant="body2" color="text.secondary">Current Month Total:</Typography>
                                <Typography variant="body1" fontWeight={600}>${totalCost.toFixed(2)}</Typography>
                            </Box>
                            <Box className="summary-row">
                                <Typography variant="body2" color="text.secondary">Estimated Monthly:</Typography>
                                <Typography variant="body1" fontWeight={600}>${monthlyEstimate.toFixed(2)}</Typography>
                            </Box>
                            <Box className="summary-row">
                                <Typography variant="body2" color="text.secondary">Previous Month:</Typography>
                                <Typography variant="body1" fontWeight={600}>${previousMonthCost.toFixed(2)}</Typography>
                            </Box>
                            <Box className="summary-row">
                                <Typography variant="body2" color="text.secondary">Change:</Typography>
                                <Typography variant="body1" fontWeight={600} color={parseFloat(costChange.toString()) > 0 ? 'error' : 'success'}>
                                    {costChange}% {parseFloat(costChange.toString()) > 0 ? '↑' : '↓'}
                                </Typography>
                            </Box>
                            <Box className="summary-row">
                                <Typography variant="body2" color="text.secondary">Top Service:</Typography>
                                <Typography variant="body1" fontWeight={600}>{topServices[0]?.service || 'N/A'}</Typography>
                            </Box>
                            <Box className="summary-row">
                                <Typography variant="body2" color="text.secondary">Top Service Cost:</Typography>
                                <Typography variant="body1" fontWeight={600}>${topServices[0]?.cost?.toFixed(2) || '0.00'}</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}
