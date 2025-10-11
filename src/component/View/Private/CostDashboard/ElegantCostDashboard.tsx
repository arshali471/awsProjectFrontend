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
  Tabs,
  Tab,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
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
import TimelineIcon from "@mui/icons-material/Timeline";
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ElegantCostDashboard() {
  const { selectedRegion }: any = useContext(SelectedRegionContext);
  const { loading, setLoading }: any = useContext(LoadingContext);

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [dateRange, setDateRange] = useState<DateRangeOption>("30");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Fetch dashboard and forecast data
  const fetchAllData = async (showLoader: boolean = true) => {
    if (!selectedRegion?.value) return;

    if (showLoader) setLoading(true);
    setRefreshing(true);
    setError(null);

    try {
      const days = parseInt(dateRange);

      // Fetch dashboard data
      const dashRes = await AdminService.getCostDashboard(selectedRegion.value, days);

      if (dashRes.status === 200 && dashRes.data.success) {
        setDashboardData(dashRes.data.data);
      }

      // Fetch forecast data separately
      try {
        const forecastRes = await AdminService.getCostForecast(selectedRegion.value);
        if (forecastRes.status === 200 && forecastRes.data.success) {
          setForecastData(forecastRes.data.data);
        }
      } catch (forecastErr) {
        console.log("Forecast data not available");
      }

      toast.success("Cost data loaded successfully");
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
      fetchAllData();
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

  // Calculate cost change
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

  const changeColor = costChange > 0 ? "#ef4444" : costChange < 0 ? "#10b981" : "#6b7280";

  // Prepare chart data
  const serviceChartData = useMemo(
    () => prepareServiceChartData(dashboardData?.serviceBreakdown || []),
    [dashboardData]
  );

  const timeSeriesData = useMemo(() => {
    if (!dashboardData?.serviceBreakdown) return [];
    return prepareTimeSeriesData(dashboardData.serviceBreakdown, 5);
  }, [dashboardData]);

  // Prepare forecast chart data
  const forecastChartData = useMemo(() => {
    if (!forecastData?.forecast) return [];
    return forecastData.forecast.map((f: any) => ({
      date: formatChartDate(f.date),
      cost: parseFloat(f.meanValue || "0"),
    }));
  }, [forecastData]);

  // Enhanced tooltip with gradient background
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            p: 2,
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(29, 78, 216, 0.95) 100%)",
            border: "none",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Typography variant="body2" fontWeight={700} color="white" mb={1}>
            {payload[0].payload.date || payload[0].name}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Box key={index} display="flex" alignItems="center" gap={1} mb={0.5}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: entry.color,
                  boxShadow: `0 0 8px ${entry.color}`,
                }}
              />
              <Typography variant="caption" color="white" fontSize="13px">
                {entry.name}: <strong>{formatCurrency(entry.value, currency)}</strong>
              </Typography>
            </Box>
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
          <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: "16px" }} />
        </Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" width="100%" height={140} sx={{ borderRadius: "16px" }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" width="100%" height={500} sx={{ borderRadius: "16px" }} />
      </div>
    );
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <div className="page-wrapper">
        <Alert
          severity="error"
          sx={{ borderRadius: "16px" }}
          action={
            <IconButton color="inherit" size="small" onClick={() => fetchAllData()}>
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
      {/* Elegant Header Section */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
          borderRadius: "24px",
          border: "1px solid rgba(59, 130, 246, 0.2)",
        }}
      >
        <Box display="flex" alignItems="center" gap={3} justifyContent="space-between" flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={3}>
            <Box
              sx={{
                width: 72,
                height: 72,
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: "0 8px 32px rgba(59, 130, 246, 0.4)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 100%)",
                },
              }}
            >
              <AttachMoneyIcon sx={{ fontSize: 40, zIndex: 1 }} />
            </Box>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-1px",
                }}
              >
                Cost Analytics
              </Typography>
              <Typography variant="body1" sx={{ color: "var(--text-secondary)", mt: 0.5, fontWeight: 500 }}>
                {period && `${period.startDate} to ${period.endDate}`}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" gap={2} alignItems="center">
            <FormControl
              size="small"
              sx={{
                minWidth: 160,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  bgcolor: "var(--bg-primary)",
                },
              }}
            >
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
              onClick={() => fetchAllData(false)}
              disabled={refreshing}
              sx={{
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                color: "white",
                width: 48,
                height: 48,
                "&:hover": {
                  background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                  transform: "rotate(180deg)",
                },
                transition: "all 0.3s ease",
              }}
            >
              {refreshing ? <CircularProgress size={24} sx={{ color: "white" }} /> : <RefreshIcon />}
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Elegant Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Cost Card - Large & Prominent */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              borderRadius: "24px",
              border: "none",
              boxShadow: "0 12px 48px rgba(59, 130, 246, 0.3)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                right: 0,
                width: "200px",
                height: "200px",
                background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                borderRadius: "50%",
                transform: "translate(30%, -30%)",
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ zIndex: 1 }}>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 600, fontSize: "14px" }}>
                    TOTAL COST
                  </Typography>
                  <Typography
                    variant="h2"
                    sx={{
                      color: "white",
                      fontWeight: 900,
                      mt: 1,
                      mb: 2,
                      fontSize: { xs: "2.5rem", md: "3.5rem" },
                      letterSpacing: "-2px",
                    }}
                  >
                    {formatCurrency(totalCost, currency)}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      icon={
                        costChange > 0 ? (
                          <TrendingUpIcon sx={{ fontSize: 16, color: "white !important" }} />
                        ) : (
                          <TrendingDownIcon sx={{ fontSize: 16, color: "white !important" }} />
                        )
                      }
                      label={`${costChange.toFixed(2)}% vs last week`}
                      sx={{
                        bgcolor: costChange > 0 ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
                        color: "white",
                        fontWeight: 700,
                        border: `1px solid ${costChange > 0 ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
                      }}
                    />
                  </Box>
                </Box>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    background: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(10px)",
                    zIndex: 1,
                  }}
                >
                  <AttachMoneyIcon sx={{ fontSize: 48, color: "white" }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Other Stats Cards */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                  borderRadius: "20px",
                  border: "none",
                  boxShadow: "0 8px 32px rgba(139, 92, 246, 0.3)",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <ShowChartIcon sx={{ fontSize: 32, color: "rgba(255,255,255,0.9)", mb: 1 }} />
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                    SERVICES
                  </Typography>
                  <Typography variant="h3" sx={{ color: "white", fontWeight: 800, mt: 1 }}>
                    {dashboardData?.serviceBreakdown?.length || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
                  borderRadius: "20px",
                  border: "none",
                  boxShadow: "0 8px 32px rgba(236, 72, 153, 0.3)",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <StorageIcon sx={{ fontSize: 32, color: "rgba(255,255,255,0.9)", mb: 1 }} />
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                    TOP SERVICE
                  </Typography>
                  <Typography variant="body2" sx={{ color: "white", fontWeight: 700, mt: 1, fontSize: "16px" }}>
                    {dashboardData?.serviceBreakdown?.[0]?.serviceName?.substring(0, 18) || "N/A"}...
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {forecastData && (
              <Grid item xs={12}>
                <Card
                  sx={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    borderRadius: "20px",
                    border: "none",
                    boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                          30-DAY FORECAST
                        </Typography>
                        <Typography variant="h4" sx={{ color: "white", fontWeight: 800, mt: 1 }}>
                          {formatCurrency(parseFloat(forecastData?.total || "0"), currency)}
                        </Typography>
                      </Box>
                      <TimelineIcon sx={{ fontSize: 40, color: "rgba(255,255,255,0.9)" }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>

      {/* Tabs for Different Views */}
      <Paper
        sx={{
          borderRadius: "24px",
          border: "1px solid var(--border-color)",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "var(--border-color)", px: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              "& .MuiTab-root": {
                fontWeight: 600,
                fontSize: "15px",
                textTransform: "none",
                minHeight: 64,
              },
              "& .Mui-selected": {
                color: "#3b82f6 !important",
              },
            }}
          >
            <Tab label="Service Breakdown" />
            <Tab label="Cost Trends" />
            {forecastData && <Tab label="Forecast" />}
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Box p={3}>
            <Typography variant="h5" fontWeight={700} color="var(--text-primary)" mb={3}>
              Service Cost Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={500}>
              <PieChart>
                <defs>
                  {serviceChartData.map((_, index) => (
                    <radialGradient key={index} id={`gradient-${index}`}>
                      <stop offset="0%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={1} />
                      <stop offset="100%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.7} />
                    </radialGradient>
                  ))}
                </defs>
                <Pie
                  data={serviceChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={160}
                  innerRadius={100}
                  paddingAngle={3}
                  label={(entry) => `${entry.percentage}%`}
                  labelLine={{
                    stroke: "var(--text-secondary)",
                    strokeWidth: 2,
                  }}
                >
                  {serviceChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#gradient-${index})`}
                      stroke="var(--bg-primary)"
                      strokeWidth={3}
                    />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={100}
                  wrapperStyle={{ paddingTop: "30px" }}
                  formatter={(value: string) => (
                    <span style={{ color: "var(--text-primary)", fontSize: "13px", fontWeight: 500 }}>
                      {value.length > 35 ? value.substring(0, 35) + "..." : value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box p={3}>
            <Typography variant="h5" fontWeight={700} color="var(--text-primary)" mb={3}>
              Daily Cost Trends
            </Typography>
            <ResponsiveContainer width="100%" height={500}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  {dashboardData?.serviceBreakdown?.slice(0, 5).map((_: any, index: number) => (
                    <linearGradient key={index} id={`areaGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS[index]} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={CHART_COLORS[index]} stopOpacity={0.1} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" strokeOpacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="var(--text-secondary)"
                  style={{ fontSize: "13px", fontWeight: 500 }}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--text-secondary)"
                  style={{ fontSize: "13px", fontWeight: 500 }}
                  tickLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  formatter={(value: string) => (
                    <span style={{ color: "var(--text-primary)", fontSize: "13px", fontWeight: 500 }}>
                      {value.length > 30 ? value.substring(0, 30) + "..." : value}
                    </span>
                  )}
                />
                {dashboardData?.serviceBreakdown?.slice(0, 5).map((service: any, index: number) => (
                  <Area
                    key={index}
                    type="monotone"
                    dataKey={service.serviceName}
                    stroke={CHART_COLORS[index]}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill={`url(#areaGradient${index})`}
                    dot={{ fill: CHART_COLORS[index], r: 5, strokeWidth: 2, stroke: "var(--bg-primary)" }}
                    activeDot={{ r: 8, strokeWidth: 3 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </TabPanel>

        {forecastData && (
          <TabPanel value={activeTab} index={2}>
            <Box p={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="var(--text-primary)">
                    30-Day Cost Forecast
                  </Typography>
                  <Typography variant="body2" color="var(--text-secondary)" mt={0.5}>
                    AI-powered prediction based on historical patterns
                  </Typography>
                </Box>
                <Chip
                  label={`Total: ${formatCurrency(parseFloat(forecastData?.total || "0"), currency)}`}
                  sx={{
                    bgcolor: "#3b82f6",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "15px",
                    px: 2,
                    py: 2.5,
                  }}
                />
              </Box>
              <ResponsiveContainer width="100%" height={500}>
                <AreaChart data={forecastChartData}>
                  <defs>
                    <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" strokeOpacity={0.3} />
                  <XAxis
                    dataKey="date"
                    stroke="var(--text-secondary)"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="var(--text-secondary)"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                    tickLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#forecastGradient)"
                    name="Projected Cost"
                    dot={{ fill: "#3b82f6", r: 6, strokeWidth: 3, stroke: "var(--bg-primary)" }}
                    activeDot={{ r: 10, strokeWidth: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </TabPanel>
        )}
      </Paper>
    </div>
  );
}
