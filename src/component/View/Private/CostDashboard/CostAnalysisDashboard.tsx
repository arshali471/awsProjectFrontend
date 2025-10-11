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
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Skeleton,
  Chip,
  Tooltip,
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
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloudIcon from "@mui/icons-material/Cloud";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import StorageIcon from "@mui/icons-material/Storage";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import "../SharedPage.css";
import "./CostDashboard.css";

import type { CostDashboardData, DateRangeOption, TableEC2Instance, TableResource } from "../../../types/cost.types";
import {
  formatCurrency,
  calculatePercentageChange,
  getChangeColor,
  formatChartDate,
  prepareServiceChartData,
  prepareTimeSeriesData,
  prepareEC2TableData,
  prepareResourceTableData,
  exportToCSV,
  CHART_COLORS,
} from "../../../utils/costFormatters";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`cost-tabpanel-${index}`}
      aria-labelledby={`cost-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CostAnalysisDashboard() {
  const { selectedRegion }: any = useContext(SelectedRegionContext);
  const { loading, setLoading }: any = useContext(LoadingContext);

  const [dashboardData, setDashboardData] = useState<CostDashboardData | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeOption>("30");
  const [activeTab, setActiveTab] = useState(0);
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

  const forecastTotal = useMemo(
    () => parseFloat(dashboardData?.forecast?.total || "0"),
    [dashboardData]
  );

  const totalEC2Cost = useMemo(
    () => parseFloat(dashboardData?.ec2Analysis?.totalEC2Cost || "0"),
    [dashboardData]
  );

  // Prepare chart data
  const serviceChartData = useMemo(
    () => prepareServiceChartData(dashboardData?.serviceBreakdown || []),
    [dashboardData]
  );

  const timeSeriesData = useMemo(
    () => prepareTimeSeriesData(dashboardData?.serviceBreakdown || [], 5),
    [dashboardData]
  );

  const forecastChartData = useMemo(() => {
    if (!dashboardData?.forecast?.forecast) return [];
    return dashboardData.forecast.forecast.map((f) => ({
      date: formatChartDate(f.date),
      cost: parseFloat(f.meanValue),
    }));
  }, [dashboardData]);

  // Prepare table data
  const ec2TableData = useMemo(
    () => prepareEC2TableData(dashboardData?.ec2Analysis?.instances || []),
    [dashboardData]
  );

  const resourceTableData = useMemo(
    () => prepareResourceTableData(dashboardData?.topResources || []),
    [dashboardData]
  );

  // Calculate cost change (mock - you can add comparison data)
  const costChange = 5.2; // This should come from comparison API
  const changeColor = getChangeColor(costChange);

  // Top service
  const topService = dashboardData?.serviceBreakdown?.[0];

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
              {entry.name}: {formatCurrency(entry.value)}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  // EC2 Table Columns
  const ec2Columns: GridColDef[] = [
    {
      field: "instanceId",
      headerName: "Instance ID",
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title="Click to copy">
          <Chip
            label={params.value}
            size="small"
            onClick={() => {
              navigator.clipboard.writeText(params.value);
              toast.success("Copied to clipboard");
            }}
            sx={{ cursor: "pointer" }}
          />
        </Tooltip>
      ),
    },
    {
      field: "totalCost",
      headerName: "Total Cost",
      width: 130,
      renderCell: (params: GridRenderCellParams<TableEC2Instance>) =>
        formatCurrency(params.value, params.row.currency),
    },
    {
      field: "totalUsageHours",
      headerName: "Usage Hours",
      width: 130,
      renderCell: (params: GridRenderCellParams) => `${params.value.toFixed(2)} hrs`,
    },
    {
      field: "costPerHour",
      headerName: "Cost/Hour",
      width: 120,
      renderCell: (params: GridRenderCellParams<TableEC2Instance>) =>
        formatCurrency(params.value, params.row.currency),
    },
    {
      field: "dailyAverage",
      headerName: "Daily Average",
      width: 140,
      renderCell: (params: GridRenderCellParams<TableEC2Instance>) =>
        formatCurrency(params.value, params.row.currency),
    },
    {
      field: "usageTypes",
      headerName: "Instance Type",
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        const type = params.value[0]?.replace("BoxUsage:", "") || "Unknown";
        return <Chip label={type} size="small" color="primary" variant="outlined" />;
      },
    },
  ];

  // Resource Table Columns
  const resourceColumns: GridColDef[] = [
    {
      field: "resourceId",
      headerName: "Resource ID",
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title="Click to copy">
          <Chip
            label={params.value}
            size="small"
            onClick={() => {
              navigator.clipboard.writeText(params.value);
              toast.success("Copied to clipboard");
            }}
            sx={{ cursor: "pointer" }}
          />
        </Tooltip>
      ),
    },
    {
      field: "resourceType",
      headerName: "Type",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} size="small" color="secondary" variant="outlined" />
      ),
    },
    {
      field: "totalCost",
      headerName: "Total Cost",
      width: 130,
      renderCell: (params: GridRenderCellParams<TableResource>) =>
        formatCurrency(params.value, params.row.currency),
    },
    {
      field: "dailyAverage",
      headerName: "Daily Average",
      width: 140,
      renderCell: (params: GridRenderCellParams<TableResource>) =>
        formatCurrency(params.value, params.row.currency),
    },
  ];

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
        <Alert severity="error" action={
          <IconButton color="inherit" size="small" onClick={() => fetchDashboardData()}>
            <RefreshIcon />
          </IconButton>
        }>
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
                Comprehensive cost insights and analytics
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
                    {formatCurrency(totalCost, dashboardData?.overview?.currency)}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                    {costChange > 0 ? (
                      <TrendingUpIcon sx={{ fontSize: 16, color: changeColor }} />
                    ) : (
                      <TrendingDownIcon sx={{ fontSize: 16, color: changeColor }} />
                    )}
                    <Typography variant="caption" sx={{ color: changeColor, fontWeight: 600 }}>
                      {costChange}% vs last period
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

        {/* Forecast Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card-elegant" elevation={0}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" className="stat-label-elegant">
                    Forecast (30 Days)
                  </Typography>
                  <Typography variant="h4" className="stat-value-elegant">
                    {formatCurrency(forecastTotal, dashboardData?.forecast?.currency)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "var(--text-secondary)", mt: 1, display: "block" }}>
                    Projected cost
                  </Typography>
                </Box>
                <Box className="stat-icon-elegant">
                  <ShowChartIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total EC2 Instances Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card-elegant" elevation={0}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" className="stat-label-elegant">
                    EC2 Instances
                  </Typography>
                  <Typography variant="h4" className="stat-value-elegant">
                    {dashboardData?.ec2Analysis?.totalInstances || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "var(--text-secondary)", mt: 1, display: "block" }}>
                    Cost: {formatCurrency(totalEC2Cost)}
                  </Typography>
                </Box>
                <Box className="stat-icon-elegant">
                  <CloudIcon />
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
                <Box>
                  <Typography variant="caption" className="stat-label-elegant stat-label-white">
                    Top Service
                  </Typography>
                  <Typography
                    variant="h6"
                    className="stat-value-elegant stat-value-white"
                    sx={{ fontSize: "1.1rem !important", lineHeight: 1.3 }}
                  >
                    {topService?.serviceName?.substring(0, 20) || "N/A"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.9)", mt: 1, display: "block" }}>
                    {formatCurrency(topService?.totalCost || 0)}
                  </Typography>
                </Box>
                <Box className="stat-icon-elegant stat-icon-white">
                  <StorageIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={serviceChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name.substring(0, 15)}: ${entry.percentage}%`}
                  labelLine={false}
                >
                  {serviceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Cost Trend Over Time */}
        <Grid item xs={12} lg={7}>
          <Paper className="chart-card" elevation={0}>
            <Box className="chart-header">
              <Typography variant="h6" className="chart-title">
                Cost Trend Over Time
              </Typography>
              <Typography variant="caption" className="chart-subtitle">
                Daily costs for top 5 services
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  {dashboardData?.serviceBreakdown?.slice(0, 5).map((service, index) => (
                    <linearGradient key={index} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS[index]} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={CHART_COLORS[index]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                {dashboardData?.serviceBreakdown?.slice(0, 5).map((service, index) => (
                  <Area
                    key={index}
                    type="monotone"
                    dataKey={service.serviceName}
                    stroke={CHART_COLORS[index]}
                    fillOpacity={1}
                    fill={`url(#color${index})`}
                    name={service.serviceName.substring(0, 30)}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabbed Content */}
      <Paper className="chart-card" elevation={0}>
        <Box sx={{ borderBottom: 1, borderColor: "var(--border-color)" }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} aria-label="cost tabs">
            <Tab label="EC2 Instance Costs" />
            <Tab label="Resource Cost Details" />
            <Tab label="Cost Forecast" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">EC2 Instance Cost Analysis</Typography>
            <IconButton
              size="small"
              onClick={() =>
                exportToCSV(
                  ec2TableData.map((row) => ({
                    instanceId: row.instanceId,
                    totalCost: row.totalCost,
                    usageHours: row.totalUsageHours,
                    costPerHour: row.costPerHour,
                    dailyAverage: row.dailyAverage,
                  })),
                  "ec2-instance-costs"
                )
              }
            >
              <FileDownloadIcon />
            </IconButton>
          </Box>
          <Box style={{ height: 500, width: "100%" }}>
            <DataGrid
              rows={ec2TableData.map((row, index) => ({ id: index, ...row }))}
              columns={ec2Columns}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              sx={{
                border: "1px solid var(--border-color)",
                "& .MuiDataGrid-cell:focus": { outline: "none" },
              }}
            />
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Resource Cost Details</Typography>
            <IconButton
              size="small"
              onClick={() =>
                exportToCSV(
                  resourceTableData.map((row) => ({
                    resourceId: row.resourceId,
                    resourceType: row.resourceType,
                    totalCost: row.totalCost,
                    dailyAverage: row.dailyAverage,
                  })),
                  "resource-costs"
                )
              }
            >
              <FileDownloadIcon />
            </IconButton>
          </Box>
          <Box style={{ height: 500, width: "100%" }}>
            <DataGrid
              rows={resourceTableData.map((row, index) => ({ id: index, ...row }))}
              columns={resourceColumns}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              sx={{
                border: "1px solid var(--border-color)",
                "& .MuiDataGrid-cell:focus": { outline: "none" },
              }}
            />
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box className="chart-header" mb={2}>
            <Typography variant="h6" className="chart-title">
              30-Day Cost Forecast
            </Typography>
            <Typography variant="caption" className="chart-subtitle">
              AI-predicted costs for the next 30 days
            </Typography>
          </Box>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={forecastChartData}>
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="cost"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorForecast)"
                name="Projected Cost ($)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <Box mt={2}>
            <Alert severity="info">
              <Typography variant="subtitle2">Forecast Summary</Typography>
              <Typography variant="body2">
                Total projected cost for next 30 days: <strong>{formatCurrency(forecastTotal)}</strong>
              </Typography>
              <Typography variant="caption">
                Based on AWS Cost Explorer forecast algorithm using historical data patterns.
              </Typography>
            </Alert>
          </Box>
        </TabPanel>
      </Paper>
    </div>
  );
}
