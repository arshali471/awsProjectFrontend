// @ts-nocheck
import { useContext, useEffect, useState, useMemo } from "react";
import { LoadingContext, SelectedRegionContext } from "../../../context/context";
import { AdminService } from "../../../services/admin.service";
import toast from "react-hot-toast";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  CircularProgress,
  Alert,
  Skeleton,
  Chip,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import StorageIcon from "@mui/icons-material/Storage";
import "../SharedPage.css";
import "./CostDashboard.css";

import type { DateRangeOption } from "../../../types/cost.types";
import {
  formatCurrency,
  formatChartDate,
  prepareServiceChartData,
  prepareTimeSeriesData,
  CHART_COLORS,
} from "../../../utils/costFormatters";

export default function ComprehensiveCostDashboard() {
  const { selectedRegion }: any = useContext(SelectedRegionContext);
  const { loading, setLoading }: any = useContext(LoadingContext);

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dateRange, setDateRange] = useState<DateRangeOption>("30");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comprehensive dashboard data
  const fetchDashboardData = async (showLoader: boolean = true) => {
    if (!selectedRegion?.value) return;

    if (showLoader) setLoading(true);
    setRefreshing(true);
    setError(null);

    try {
      const days = parseInt(dateRange);
      const res = await AdminService.getCostDashboard(selectedRegion.value, days);

      if (res.status === 200 && res.data.success) {
        setDashboardData(res.data.data);
        toast.success("Cost data loaded successfully");
      } else {
        throw new Error(res.data.message || "Failed to fetch cost data");
      }
    } catch (err: any) {
      console.error("Error fetching cost data", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch cost data. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      if (showLoader) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedRegion?.value) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegion?.value, dateRange]);

  // Computed values
  const totalCost = useMemo(
    () => parseFloat(dashboardData?.overview?.totalCost || "0"),
    [dashboardData]
  );

  const currency = dashboardData?.overview?.currency || "USD";
  const period = dashboardData?.overview?.period;

  // Top 3 services
  const topServices = useMemo(() => {
    if (!dashboardData?.serviceBreakdown) return [];
    return dashboardData.serviceBreakdown.slice(0, 3);
  }, [dashboardData]);

  // Prepare chart data
  const serviceChartData = useMemo(
    () => prepareServiceChartData(dashboardData?.serviceBreakdown || []),
    [dashboardData]
  );

  const timeSeriesData = useMemo(() => {
    if (!dashboardData?.serviceBreakdown) return [];
    return prepareTimeSeriesData(dashboardData.serviceBreakdown, 5);
  }, [dashboardData]);

  // Calculate cost change (mock for now - compare first week vs last week)
  const costChange = useMemo(() => {
    if (!dashboardData?.serviceBreakdown || dashboardData.serviceBreakdown.length === 0) return 0;

    const firstService = dashboardData.serviceBreakdown[0];
    const dailyData = firstService.dailyBreakdown || [];

    if (dailyData.length < 7) return 0;

    const firstWeekCost = dailyData.slice(0, 7).reduce((sum: number, day: any) => sum + parseFloat(day.cost || "0"), 0);
    const lastWeekCost = dailyData.slice(-7).reduce((sum: number, day: any) => sum + parseFloat(day.cost || "0"), 0);

    if (firstWeekCost === 0) return 0;
    return ((lastWeekCost - firstWeekCost) / firstWeekCost) * 100;
  }, [dashboardData]);

  const getChangeColor = (change: number) => {
    if (change > 0) return "#ef4444";
    if (change < 0) return "#10b981";
    return "#6b7280";
  };

  const changeColor = getChangeColor(costChange);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, bgcolor: "var(--bg-primary)", border: "1px solid var(--border-color)" }}>
          <Typography variant="body2" fontWeight={600}>
            {payload[0].payload.date || payload[0].name}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography key={index} variant="caption" sx={{ color: entry.color, display: "block" }}>
              {entry.name}: {formatCurrency(entry.value, currency)}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  // Loading skeleton
  if (loading && !dashboardData) {
    return (
      <div className="page-wrapper">
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="rectangular" width="100%" height={80} />
        </Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" width="100%" height={120} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" width="100%" height={400} />
      </div>
    );
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <div className="page-wrapper">
        <Alert
          severity="error"
          action={
            <IconButton color="inherit" size="small" onClick={() => fetchDashboardData()}>
              <RefreshIcon />
            </IconButton>
          }
        >
          <Typography variant="h6">Error Loading Cost Data</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} justifyContent="space-between" flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 56,
                height: 56,
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
              }}
            >
              <AttachMoneyIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "var(--text-primary)" }}>
                AWS Cost Analysis Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: "var(--text-secondary)", mt: 0.5 }}>
                {period && `${period.startDate} to ${period.endDate}`}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" gap={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                label="Date Range"
                onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
              >
                <MenuItem value="7">Last 7 Days</MenuItem>
                <MenuItem value="30">Last 30 Days</MenuItem>
                <MenuItem value="60">Last 60 Days</MenuItem>
                <MenuItem value="90">Last 90 Days</MenuItem>
              </Select>
            </FormControl>

            <IconButton
              color="primary"
              onClick={() => fetchDashboardData(false)}
              disabled={refreshing}
              sx={{
                bgcolor: "var(--bg-secondary)",
                "&:hover": { bgcolor: "var(--bg-tertiary)" },
              }}
            >
              {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Overview Cards Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Total Cost Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card-elegant" elevation={0}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" className="stat-label-elegant">
                    Total Cost
                  </Typography>
                  <Typography variant="h4" className="stat-value-elegant">
                    {formatCurrency(totalCost, currency)}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                    {costChange > 0 ? (
                      <TrendingUpIcon sx={{ fontSize: 16, color: changeColor }} />
                    ) : costChange < 0 ? (
                      <TrendingDownIcon sx={{ fontSize: 16, color: changeColor }} />
                    ) : null}
                    <Typography variant="caption" sx={{ color: changeColor, fontWeight: 600 }}>
                      {costChange.toFixed(2)}% vs previous week
                    </Typography>
                  </Box>
                </Box>
                <Box className="stat-icon-elegant">
                  <AttachMoneyIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Service Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card-elegant stat-card-warning" elevation={0}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ width: '100%' }}>
                  <Typography variant="caption" className="stat-label-elegant stat-label-white">
                    Top Service
                  </Typography>
                  <Typography
                    variant="h6"
                    className="stat-value-elegant stat-value-white"
                    sx={{ fontSize: "1rem !important", lineHeight: 1.3, wordBreak: 'break-word' }}
                  >
                    {topServices[0]?.serviceName?.substring(0, 25) || "N/A"}
                    {topServices[0]?.serviceName?.length > 25 ? "..." : ""}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.9)", mt: 1, display: "block" }}>
                    {formatCurrency(topServices[0]?.totalCost || 0, currency)}
                  </Typography>
                </Box>
                <Box className="stat-icon-elegant stat-icon-white">
                  <StorageIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Services Count Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card-elegant" elevation={0}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" className="stat-label-elegant">
                    Total Services
                  </Typography>
                  <Typography variant="h4" className="stat-value-elegant">
                    {dashboardData?.serviceBreakdown?.length || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "var(--text-secondary)", mt: 1, display: "block" }}>
                    Active AWS services
                  </Typography>
                </Box>
                <Box className="stat-icon-elegant">
                  <ShowChartIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Period Summary Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card-elegant" elevation={0}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" className="stat-label-elegant">
                    Period
                  </Typography>
                  <Typography variant="h6" className="stat-value-elegant" sx={{ fontSize: "1.25rem !important" }}>
                    {dateRange} Days
                  </Typography>
                  <Typography variant="caption" sx={{ color: "var(--text-secondary)", mt: 1, display: "block" }}>
                    {currency} Currency
                  </Typography>
                </Box>
                <Box className="stat-icon-elegant">
                  <ShowChartIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Services Quick View */}
      <Paper className="chart-card" elevation={0} sx={{ mb: 3, p: 2.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle1" fontWeight={600} color="var(--text-primary)">
            Top 3 Cost Drivers
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {topServices.map((service: any, index: number) => (
            <Grid item xs={12} md={4} key={index}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "var(--bg-secondary)",
                  borderRadius: "12px",
                  border: "1px solid var(--border-color)",
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: CHART_COLORS[index],
                    }}
                  />
                  <Typography variant="caption" color="var(--text-secondary)">
                    #{index + 1}
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={600} color="var(--text-primary)" noWrap>
                  {service.serviceName}
                </Typography>
                <Typography variant="h5" fontWeight={700} color="var(--text-primary)" mt={1}>
                  {formatCurrency(service.totalCost, currency)}
                </Typography>
                <Typography variant="caption" color="var(--text-secondary)">
                  Usage: {service.totalUsage.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Service Breakdown Pie Chart */}
        <Grid item xs={12} lg={5}>
          <Paper className="chart-card" elevation={0}>
            <Box className="chart-header">
              <Typography variant="h6" className="chart-title">
                Service Cost Breakdown
              </Typography>
              <Typography variant="caption" className="chart-subtitle">
                Top 10 services by cost (others grouped)
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={serviceChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={(entry) => `${entry.percentage}%`}
                  labelLine={true}
                >
                  {serviceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  formatter={(value: string) => (
                    <span style={{ color: "var(--text-primary)", fontSize: "12px" }}>
                      {value.length > 30 ? value.substring(0, 30) + "..." : value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Cost Trend Over Time */}
        <Grid item xs={12} lg={7}>
          <Paper className="chart-card" elevation={0}>
            <Box className="chart-header">
              <Typography variant="h6" className="chart-title">
                Daily Cost Trend
              </Typography>
              <Typography variant="caption" className="chart-subtitle">
                Daily costs for top 5 services over time
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  {dashboardData?.serviceBreakdown?.slice(0, 5).map((_: any, index: number) => (
                    <linearGradient key={index} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS[index]} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={CHART_COLORS[index]} stopOpacity={0.1} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" style={{ fontSize: "12px" }} />
                <YAxis stroke="var(--text-secondary)" style={{ fontSize: "12px" }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: "10px" }}
                  formatter={(value: string) => (
                    <span style={{ color: "var(--text-primary)", fontSize: "11px" }}>
                      {value.length > 25 ? value.substring(0, 25) + "..." : value}
                    </span>
                  )}
                />
                {dashboardData?.serviceBreakdown?.slice(0, 5).map((service: any, index: number) => (
                  <Area
                    key={index}
                    type="monotone"
                    dataKey={service.serviceName}
                    stroke={CHART_COLORS[index]}
                    fillOpacity={1}
                    fill={`url(#color${index})`}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Service Details Table */}
      <Paper className="chart-card" elevation={0}>
        <Box className="chart-header">
          <Typography variant="h6" className="chart-title">
            Service Cost Details
          </Typography>
          <Typography variant="caption" className="chart-subtitle">
            Detailed breakdown of all AWS services
          </Typography>
        </Box>
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border-color)" }}>
                <th style={{ padding: "12px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600 }}>
                  Service Name
                </th>
                <th style={{ padding: "12px", textAlign: "right", color: "var(--text-secondary)", fontWeight: 600 }}>
                  Total Cost
                </th>
                <th style={{ padding: "12px", textAlign: "right", color: "var(--text-secondary)", fontWeight: 600 }}>
                  Total Usage
                </th>
                <th style={{ padding: "12px", textAlign: "right", color: "var(--text-secondary)", fontWeight: 600 }}>
                  Avg Daily Cost
                </th>
                <th style={{ padding: "12px", textAlign: "center", color: "var(--text-secondary)", fontWeight: 600 }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.serviceBreakdown?.map((service: any, index: number) => {
                const avgDaily = service.totalCost / (service.dailyBreakdown?.length || 1);
                return (
                  <tr
                    key={index}
                    style={{
                      borderBottom: "1px solid var(--border-color)",
                      backgroundColor: index < 3 ? "rgba(59, 130, 246, 0.05)" : "transparent",
                    }}
                  >
                    <td style={{ padding: "12px", color: "var(--text-primary)", fontWeight: index < 3 ? 600 : 400 }}>
                      {service.serviceName}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", color: "var(--text-primary)", fontWeight: 600 }}>
                      {formatCurrency(service.totalCost, currency)}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", color: "var(--text-secondary)" }}>
                      {service.totalUsage.toFixed(2)}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", color: "var(--text-secondary)" }}>
                      {formatCurrency(avgDaily, currency)}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <Chip
                        label={index < 3 ? "High Cost" : "Active"}
                        size="small"
                        color={index < 3 ? "error" : "success"}
                        variant="outlined"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      </Paper>
    </div>
  );
}
