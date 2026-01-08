// @ts-nocheck
import { useContext, useEffect, useState, useMemo } from "react";
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
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
import CloudIcon from "@mui/icons-material/Cloud";
import MemoryIcon from "@mui/icons-material/Memory";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import "../SharedPage.css";
import "./CostDashboard.css";

import type { DateRangeOption } from "../../../types/cost.types";
import {
  formatCurrency,
  formatChartDate,
  prepareServiceChartData,
  prepareTimeSeriesData,
  prepareEC2TableData,
  prepareResourceTableData,
  detectResourceType,
  exportToCSV,
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

export default function CompleteCostDashboard() {
  const navigate = useNavigate();
  const { selectedRegion, setSelectedRegion }: any = useContext(SelectedRegionContext);
  const { loading, setLoading }: any = useContext(LoadingContext);

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [topServicesData, setTopServicesData] = useState<any>(null);
  const [dateRange, setDateRange] = useState<DateRangeOption>("30");
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [ec2Page, setEc2Page] = useState(0);
  const [ec2RowsPerPage, setEc2RowsPerPage] = useState(10);
  const [resourcePage, setResourcePage] = useState(0);
  const [resourceRowsPerPage, setResourceRowsPerPage] = useState(10);
  const [keysData, setKeysData] = useState<any>([]);
  const [bedrockData, setBedrockData] = useState<any>(null);

  // Fetch AWS keys for account selection
  const getAllAwsKeys = async () => {
    try {
      const res = await AdminService.getAllAwsKey();
      if (res.status === 200) {
        const mappedKeys = res.data.map((data: any) => ({
          label: `${data.enviroment} (${data.region})`,
          value: data._id
        }));
        setKeysData(mappedKeys);

        // DO NOT auto-select - user must manually select region
      }
    } catch (err) {
      console.error("Error fetching AWS keys:", err);
      toast.error("Failed to load AWS accounts");
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

  // Fetch all data
  const fetchAllData = async (showLoader: boolean = true) => {
    if (!selectedRegion?.value) {
      toast.error("Please select an AWS account/region");
      return;
    }

    // Validate custom date range if selected
    if (useCustomRange) {
      if (!startDate || !endDate) {
        toast.error("Please select both start and end dates");
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        toast.error("End date must be after start date");
        return;
      }

      if (end > new Date()) {
        toast.error("End date cannot be in the future");
        return;
      }
    }

    if (showLoader) setLoading(true);
    setRefreshing(true);
    setError(null);

    try {
      let days = parseInt(dateRange);

      // Calculate days from custom date range
      if (useCustomRange && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      }

      // Fetch all data in parallel with individual error handling
      const results = await Promise.allSettled([
        AdminService.getCostDashboard(selectedRegion.value, days),
        AdminService.compareCosts(selectedRegion.value),
        AdminService.getTopServices(selectedRegion.value, 10, days),
        AdminService.getBedrockCosts(selectedRegion.value, days),
      ]);

      const [dashRes, compRes, topRes, bedrockRes] = results;

      // Handle dashboard data
      if (dashRes.status === "fulfilled") {
        console.log("DASHBOARD:", dashRes.value.data);
        if (dashRes.value.status === 200 && dashRes.value.data.success) {
          setDashboardData(dashRes.value.data.data);
        }
      } else {
        console.error("Dashboard error:", dashRes.reason);
      }

      // Handle comparison data
      if (compRes.status === "fulfilled") {
        console.log("COMPARISON:", compRes.value.data);
        if (compRes.value.status === 200 && compRes.value.data.success) {
          setComparisonData(compRes.value.data.data);
        }
      } else {
        console.error("Comparison error:", compRes.reason);
      }

      // Handle top services data
      if (topRes.status === "fulfilled") {
        console.log("TOP SERVICES:", topRes.value.data);
        if (topRes.value.status === 200 && topRes.value.data.success) {
          setTopServicesData(topRes.value.data.data);
        }
      } else {
        console.error("Top services error:", topRes.reason);
      }

      // Handle Bedrock data
      if (bedrockRes.status === "fulfilled") {
        console.log("BEDROCK:", bedrockRes.value.data);
        if (bedrockRes.value.status === 200 && bedrockRes.value.data.success) {
          setBedrockData(bedrockRes.value.data.data);
        }
      } else {
        console.error("Bedrock error:", bedrockRes.reason);
        // Bedrock might not be used - set empty data instead of failing
        setBedrockData(null);
      }

      // Check if all requests failed
      const allFailed = results.every(result => result.status === "rejected");

      if (allFailed) {
        // Get the first error for detailed display
        const firstError = results.find(r => r.status === "rejected") as PromiseRejectedResult;
        const errorResponse = firstError.reason?.response?.data;

        let errorMessage = "Failed to fetch cost data. Please check AWS IAM permissions.";
        let errorDetails = null;

        if (errorResponse) {
          errorMessage = errorResponse.message || errorMessage;
          errorDetails = errorResponse.details || null;

          // Special handling for AWS credential errors
          if (errorResponse.errorType === "UnrecognizedClientException" ||
              errorMessage.includes("security token") ||
              errorMessage.includes("invalid")) {
            errorMessage = "AWS credentials are invalid or expired. Please update your AWS access keys in Settings.";
            errorDetails = "Error: The security token included in the request is invalid.";
          }
        } else if (firstError.reason?.message) {
          errorMessage = firstError.reason.message;
        }

        setError(JSON.stringify({ message: errorMessage, details: errorDetails }));
        toast.error(errorMessage, { duration: 6000 });
      } else {
        toast.success("Cost data loaded successfully");
      }
    } catch (err: any) {
      console.error("Error fetching cost data", err);

      // Extract detailed error information
      const errorResponse = err.response?.data;
      let errorMessage = "Failed to fetch cost data. Please try again.";
      let errorDetails = null;

      if (errorResponse) {
        errorMessage = errorResponse.message || errorMessage;
        errorDetails = errorResponse.details || null;
      } else {
        errorMessage = err.message || errorMessage;
      }

      setError(JSON.stringify({ message: errorMessage, details: errorDetails }));
      toast.error(errorMessage, { duration: 6000 });
    } finally {
      if (showLoader) setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch AWS keys on component mount
  useEffect(() => {
    getAllAwsKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch data when region or date range changes
  useEffect(() => {
    if (selectedRegion?.value && !useCustomRange) {
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

  const forecastChartData = useMemo(() => {
    if (!dashboardData?.forecast?.forecast) return [];
    return dashboardData.forecast.forecast.map((f: any) => ({
      date: formatChartDate(f.date),
      cost: parseFloat(f.meanValue || "0"),
    }));
  }, [dashboardData]);

  // Prepare EC2 data - API returns instanceType, not instanceId
  const ec2TableData = useMemo(() => {
    if (!dashboardData?.ec2Analysis?.instanceTypes) return [];
    return dashboardData.ec2Analysis.instanceTypes.map((instance: any) => ({
      instanceType: instance.instanceType || "Unknown",
      totalCost: instance.totalCost || 0,
      totalUsageHours: instance.totalUsageHours || 0,
      costPerHour: instance.costPerHour || 0,
      usageTypes: instance.usageTypes || [],
      currency: instance.currency || "USD",
    }));
  }, [dashboardData]);

  const ec2ChartData = useMemo(() => {
    if (!dashboardData?.ec2Analysis?.instanceTypes) return [];
    return dashboardData.ec2Analysis.instanceTypes
      .slice(0, 10)
      .map((instance: any) => ({
        name: instance?.instanceType || "Unknown",
        cost: instance?.totalCost || 0,
        hours: instance?.totalUsageHours || 0,
      }));
  }, [dashboardData]);

  // Prepare resource data - API already provides resourceType
  const resourceTableData = useMemo(() => {
    if (!dashboardData?.topResources) return [];
    return dashboardData.topResources.map((resource: any) => ({
      resourceType: resource.resourceType || resource.usageType || "Unknown",
      usageType: resource.usageType || "",
      instanceType: resource.instanceType || "N/A",
      totalCost: resource.totalCost || 0,
      totalUsage: resource.totalUsage || 0,
      currency: resource.currency || "USD",
    }));
  }, [dashboardData]);

  const resourceTypeData = useMemo(() => {
    if (!dashboardData?.topResources) return [];
    const typeMap: any = {};
    dashboardData.topResources.forEach((resource: any) => {
      const type = resource.resourceType || resource.usageType || "Unknown";
      if (!typeMap[type]) {
        typeMap[type] = { type, cost: 0, count: 0 };
      }
      typeMap[type].cost += resource?.totalCost || 0;
      typeMap[type].count += 1;
    });
    return Object.values(typeMap);
  }, [dashboardData]);

  // Enhanced tooltip
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
            {payload[0].payload.date || payload[0].payload.name || payload[0].name}
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
                {entry.name}: <strong>{typeof entry.value === 'number' ? formatCurrency(entry.value, currency) : entry.value}</strong>
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleExportEC2 = () => {
    const data = ec2TableData.map((row: any) => ({
      instanceType: row.instanceType,
      totalCost: row.totalCost,
      usageHours: row.totalUsageHours,
      costPerHour: row.costPerHour,
      usageTypes: row.usageTypes?.join(", "),
    }));
    exportToCSV(data, "ec2-instance-costs");
  };

  const handleExportResources = () => {
    const data = resourceTableData.map((row: any) => ({
      resourceType: row.resourceType,
      usageType: row.usageType,
      instanceType: row.instanceType,
      totalCost: row.totalCost,
      totalUsage: row.totalUsage,
    }));
    exportToCSV(data, "resource-costs");
  };

  // Header component (always visible)
  const renderHeader = () => (
    <Box sx={{ mb: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box
            sx={{
              width: 56,
              height: 56,
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px rgba(59, 130, 246, 0.4)",
              }
            }}
          >
            <AttachMoneyIcon sx={{ fontSize: 32 }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#232f3e',
                letterSpacing: '-0.5px',
              }}
            >
              Complete Cost Analytics
            </Typography>
            <Typography variant="body2" sx={{ color: "#6c757d", mt: 0.5 }}>
              {selectedRegion ? `${selectedRegion.label}` : "Select an account to view costs"}
              {period && ` • ${period.startDate} to ${period.endDate}`}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          {/* AWS Account Selector */}
          <Box
            sx={{
              minWidth: 250,
              maxWidth: 300,
              "& .css-b62m3t-container": {
                borderRadius: "12px",
              },
            }}
          >
            <AsyncSelect
              value={selectedRegion}
              placeholder="Select AWS Account..."
              cacheOptions
              loadOptions={loadOptions}
              defaultOptions={keysData}
              isClearable={false}
              onChange={(e: any) => {
                setSelectedRegion(e);
                setDashboardData(null);
                setComparisonData(null);
                setTopServicesData(null);
                setError(null);
              }}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                control: (base) => ({
                  ...base,
                  minHeight: '40px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                  '&:hover': {
                    borderColor: 'rgba(59, 130, 246, 0.5)',
                  }
                }),
                container: (base) => ({ ...base, width: '100%' }),
              }}
            />
          </Box>

          {selectedRegion && (
            <>
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
                  value={useCustomRange ? "custom" : dateRange}
                  label="Date Range"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "custom") {
                      setUseCustomRange(true);
                    } else {
                      setUseCustomRange(false);
                      setDateRange(value as DateRangeOption);
                    }
                  }}
                >
                  <MenuItem value="7">Last 7 Days</MenuItem>
                  <MenuItem value="30">Last 30 Days (This Month)</MenuItem>
                  <MenuItem value="60">Last 60 Days (2 Months)</MenuItem>
                  <MenuItem value="90">Last 90 Days (3 Months)</MenuItem>
                  <MenuItem value="120">Last 120 Days (4 Months)</MenuItem>
                  <MenuItem value="180">Last 180 Days (6 Months)</MenuItem>
                  <MenuItem value="365">Last 365 Days (1 Year)</MenuItem>
                  <MenuItem value="custom">Custom Date Range</MenuItem>
                </Select>
              </FormControl>

              {useCustomRange && (
                <>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "12px",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      fontSize: "14px",
                    }}
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "12px",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      fontSize: "14px",
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => fetchAllData()}
                    sx={{
                      borderRadius: "12px",
                      textTransform: "none",
                      background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    }}
                  >
                    Apply
                  </Button>
                </>
              )}

              <Tooltip title="Refresh data">
                <IconButton
                  onClick={() => fetchAllData()}
                  disabled={refreshing}
                  sx={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    color: "white",
                    borderRadius: "12px",
                    "&:hover": {
                      background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                    },
                  }}
                >
                  <RefreshIcon className={refreshing ? "spin" : ""} />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );

  // No account selected state
  if (!selectedRegion) {
    return (
      <div className="page-wrapper">
        {renderHeader()}
        <Alert
          severity="info"
          sx={{ borderRadius: "16px" }}
        >
          <Typography variant="h6" gutterBottom>
            Select an AWS Account
          </Typography>
          <Typography variant="body2">
            Please select an AWS account from the dropdown above to view cost analytics.
          </Typography>
        </Alert>
      </div>
    );
  }

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
    let errorObj: any = { message: "An error occurred", details: null };
    try {
      if (typeof error === 'string') {
        errorObj = JSON.parse(error);
      } else if (typeof error === 'object') {
        errorObj = error;
      } else {
        errorObj = { message: String(error), details: null };
      }
    } catch (e) {
      console.error("Error parsing error object:", e);
      errorObj = { message: String(error), details: null };
    }

    return (
      <div className="page-wrapper">
        <Alert
          severity="error"
          sx={{ borderRadius: "16px", mb: 2 }}
          action={
            <IconButton color="inherit" size="small" onClick={() => fetchAllData()}>
              <RefreshIcon />
            </IconButton>
          }
        >
          <Typography variant="h6" gutterBottom>
            Error Loading Cost Data
          </Typography>
          <Typography variant="body2" sx={{ mb: errorObj.details ? 2 : 0 }}>
            {errorObj.message}
          </Typography>

          {errorObj.details && typeof errorObj.details === 'object' && (
            <Box sx={{ mt: 2 }}>
              {errorObj.details.error && typeof errorObj.details.error === 'string' && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: "#fff3cd", border: "1px solid #ffc107" }}>
                  <Typography variant="subtitle2" fontWeight={600} color="error" gutterBottom>
                    AWS Error:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.875rem", whiteSpace: "pre-wrap" }}>
                    {errorObj.details.error}
                  </Typography>
                </Paper>
              )}

              {errorObj.details.requiredPermissions && Array.isArray(errorObj.details.requiredPermissions) && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: "#e3f2fd", border: "1px solid #2196f3" }}>
                  <Typography variant="subtitle2" fontWeight={600} color="primary" gutterBottom>
                    Required IAM Permissions:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, my: 1 }}>
                    {errorObj.details.requiredPermissions.map((perm: string, idx: number) => (
                      <Typography key={idx} component="li" variant="body2" sx={{ fontFamily: "monospace" }}>
                        {String(perm)}
                      </Typography>
                    ))}
                  </Box>
                </Paper>
              )}

              {errorObj.details.solution && typeof errorObj.details.solution === 'string' && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: "#f3e5f5", border: "1px solid #9c27b0" }}>
                  <Typography variant="subtitle2" fontWeight={600} color="secondary" gutterBottom>
                    Solution:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.875rem", whiteSpace: "pre-wrap", overflowX: "auto" }}>
                    {errorObj.details.solution}
                  </Typography>
                </Paper>
              )}

              {errorObj.details.awsDocumentation && typeof errorObj.details.awsDocumentation === 'string' && (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  href={errorObj.details.awsDocumentation}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mt: 1 }}
                >
                  View AWS Documentation
                </Button>
              )}

              {errorObj.details.hint && typeof errorObj.details.hint === 'string' && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: "italic" }}>
                  💡 Hint: {errorObj.details.hint}
                </Typography>
              )}
            </Box>
          )}
        </Alert>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {renderHeader()}

      {/* Cost Comparison Insights */}
      {comparisonData && (
        <Box
          sx={{
            mb: 4,
            p: 3,
            background: comparisonData.comparison.trend === "increased"
              ? "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)"
              : comparisonData.comparison.trend === "decreased"
              ? "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)"
              : "linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(75, 85, 99, 0.05) 100%)",
            borderRadius: "20px",
            border: `1px solid ${
              comparisonData.comparison.trend === "increased"
                ? "rgba(239, 68, 68, 0.2)"
                : comparisonData.comparison.trend === "decreased"
                ? "rgba(16, 185, 129, 0.2)"
                : "rgba(107, 114, 128, 0.2)"
            }`,
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box display="flex" alignItems="center" gap={2}>
                {comparisonData.comparison.trend === "increased" ? (
                  <TrendingUpIcon sx={{ fontSize: 40, color: "#ef4444" }} />
                ) : comparisonData.comparison.trend === "decreased" ? (
                  <TrendingDownIcon sx={{ fontSize: 40, color: "#10b981" }} />
                ) : (
                  <ShowChartIcon sx={{ fontSize: 40, color: "#6b7280" }} />
                )}
                <Box>
                  <Typography variant="h6" fontWeight={700} color="var(--text-primary)">
                    Cost Comparison Analysis
                  </Typography>
                  <Typography variant="body2" color="var(--text-secondary)" mt={0.5}>
                    Your costs have <strong>{comparisonData.comparison.trend}</strong> by{" "}
                    <strong style={{ color: comparisonData.comparison.trend === "increased" ? "#ef4444" : "#10b981" }}>
                      {comparisonData.comparison.percentageChange}%
                    </strong>{" "}
                    compared to the previous period
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign={{ xs: "left", md: "right" }}>
                <Typography variant="caption" color="var(--text-secondary)" fontWeight={600}>
                  DIFFERENCE
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  color={comparisonData.comparison.trend === "increased" ? "#ef4444" : "#10b981"}
                  mt={0.5}
                >
                  {comparisonData.comparison.trend === "increased" ? "+" : ""}
                  {formatCurrency(parseFloat(comparisonData.comparison.difference), comparisonData.comparison.currency)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Cost Card */}
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

        {/* Other Stats */}
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
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  borderRadius: "20px",
                  border: "none",
                  boxShadow: "0 8px 32px rgba(245, 158, 11, 0.3)",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <CloudIcon sx={{ fontSize: 32, color: "rgba(255,255,255,0.9)", mb: 1 }} />
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                    EC2 INSTANCE TYPES
                  </Typography>
                  <Typography variant="h3" sx={{ color: "white", fontWeight: 800, mt: 1 }}>
                    {dashboardData?.ec2Analysis?.totalInstanceTypes || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {dashboardData?.forecast && !dashboardData.forecast.message && (
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
                          {formatCurrency(parseFloat(dashboardData.forecast?.total || "0"), currency)}
                        </Typography>
                      </Box>
                      <TimelineIcon sx={{ fontSize: 40, color: "rgba(255,255,255,0.9)" }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {dashboardData?.topResources && (
              <Grid item xs={12}>
                <Card
                  sx={{
                    background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
                    borderRadius: "20px",
                    border: "none",
                    boxShadow: "0 8px 32px rgba(236, 72, 153, 0.3)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                          TOP RESOURCES
                        </Typography>
                        <Typography variant="h4" sx={{ color: "white", fontWeight: 800, mt: 1 }}>
                          {dashboardData.topResources.length || 0}
                        </Typography>
                      </Box>
                      <MemoryIcon sx={{ fontSize: 40, color: "rgba(255,255,255,0.9)" }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>

      {/* Tabbed Content */}
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
            variant="scrollable"
            scrollButtons="auto"
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
            <Tab label="Overview" />
            <Tab label="Service Breakdown" />
            <Tab label="Cost Trends" />
            {topServicesData && <Tab label="Top Services" />}
            {dashboardData?.ec2Analysis && <Tab label="EC2 Analysis" />}
            {dashboardData?.topResources && <Tab label="Top Resources" />}
            {dashboardData?.forecast && !dashboardData.forecast.message && <Tab label="Forecast" />}
            <Tab label="Bedrock Models" icon={<MemoryIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab 0: Overview */}
        <TabPanel value={activeTab} index={0}>
          <Box p={3}>
            <Typography variant="h5" fontWeight={700} color="var(--text-primary)" mb={3}>
              Cost Overview & Key Insights
            </Typography>

            {/* Quick Stats Grid */}
            <Grid container spacing={3}>
              {/* Current Period Stats */}
              {comparisonData && (
                <>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, borderRadius: "16px", border: "1px solid var(--border-color)" }}>
                      <Typography variant="subtitle2" color="var(--text-secondary)" fontWeight={600} mb={2}>
                        CURRENT PERIOD ({comparisonData.currentPeriod.period.startDate} to {comparisonData.currentPeriod.period.endDate})
                      </Typography>
                      <Typography variant="h3" fontWeight={800} color="var(--text-primary)">
                        {formatCurrency(parseFloat(comparisonData.currentPeriod.totalCost), comparisonData.currentPeriod.currency)}
                      </Typography>
                      <Typography variant="body2" color="var(--text-secondary)" mt={1}>
                        {comparisonData.currentPeriod.services?.length} services active
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, borderRadius: "16px", border: "1px solid var(--border-color)" }}>
                      <Typography variant="subtitle2" color="var(--text-secondary)" fontWeight={600} mb={2}>
                        PREVIOUS PERIOD ({comparisonData.previousPeriod.period.startDate} to {comparisonData.previousPeriod.period.endDate})
                      </Typography>
                      <Typography variant="h3" fontWeight={800} color="var(--text-primary)">
                        {formatCurrency(parseFloat(comparisonData.previousPeriod.totalCost), comparisonData.previousPeriod.currency)}
                      </Typography>
                      <Typography variant="body2" color="var(--text-secondary)" mt={1}>
                        {comparisonData.previousPeriod.services?.length} services active
                      </Typography>
                    </Card>
                  </Grid>
                </>
              )}

              {/* Top 3 Services Summary */}
              {topServicesData && (
                <Grid item xs={12}>
                  <Card sx={{ p: 3, borderRadius: "16px", border: "1px solid var(--border-color)" }}>
                    <Typography variant="h6" fontWeight={700} color="var(--text-primary)" mb={3}>
                      Top 3 Cost Drivers
                    </Typography>
                    <Grid container spacing={2}>
                      {topServicesData.topServices?.slice(0, 3).map((service: any, index: number) => (
                        <Grid item xs={12} md={4} key={index}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: "12px",
                              background: `linear-gradient(135deg, ${CHART_COLORS[index]} 0%, ${CHART_COLORS[index]}dd 100%)`,
                              color: "white",
                            }}
                          >
                            <Typography variant="caption" sx={{ opacity: 0.9 }}>
                              #{index + 1}
                            </Typography>
                            <Typography variant="h6" fontWeight={700} mt={1}>
                              {service.serviceName}
                            </Typography>
                            <Typography variant="h4" fontWeight={800} mt={1}>
                              {formatCurrency(service.totalCost, service.currency)}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        </TabPanel>

        {/* Tab 1: Service Breakdown */}
        <TabPanel value={activeTab} index={1}>
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

        {/* Tab 2: Cost Trends */}
        <TabPanel value={activeTab} index={2}>
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

        {/* Tab 3: Top Services */}
        {topServicesData && (
          <TabPanel value={activeTab} index={3}>
            <Box p={3}>
              <Typography variant="h5" fontWeight={700} color="var(--text-primary)" mb={3}>
                Top Services by Cost
              </Typography>

              {/* Bar Chart */}
              <Box sx={{ height: 400, mb: 4 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topServicesData.topServices?.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis
                      dataKey="serviceName"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fill: "var(--text-primary)", fontSize: 11 }}
                    />
                    <YAxis tick={{ fill: "var(--text-primary)" }} tickFormatter={(value) => `$${value}`} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="totalCost" radius={[8, 8, 0, 0]}>
                      {topServicesData.topServices?.slice(0, 10).map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              {/* Services Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "var(--bg-secondary)" }}>
                      <TableCell sx={{ fontWeight: 700, color: "var(--text-primary)" }}>Rank</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "var(--text-primary)" }}>Service Name</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "var(--text-primary)" }}>Total Cost</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "var(--text-primary)" }}>Total Usage</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "var(--text-primary)" }}>% of Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topServicesData.topServices?.map((service: any, index: number) => {
                      const percentage = ((service.totalCost / parseFloat(topServicesData.totalCost)) * 100).toFixed(1);
                      return (
                        <TableRow key={index} sx={{ "&:hover": { bgcolor: "var(--bg-secondary)" } }}>
                          <TableCell>
                            <Chip
                              label={`#${index + 1}`}
                              size="small"
                              sx={{
                                bgcolor: CHART_COLORS[index % CHART_COLORS.length],
                                color: "white",
                                fontWeight: 700
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {service.serviceName}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: "var(--text-primary)" }}>
                            {formatCurrency(service.totalCost, service.currency)}
                          </TableCell>
                          <TableCell align="right">{service.totalUsage?.toFixed(2) || 0}</TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`${percentage}%`}
                              size="small"
                              sx={{ bgcolor: "var(--bg-secondary)", fontWeight: 600 }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </TabPanel>
        )}

        {/* Tab 4: EC2 Analysis */}
        {dashboardData?.ec2Analysis && (
          <TabPanel value={activeTab} index={topServicesData ? 4 : 3}>
            <Box p={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="var(--text-primary)">
                    EC2 Instance Analysis
                  </Typography>
                  <Typography variant="body2" color="var(--text-secondary)" mt={0.5}>
                    Total EC2 Cost: <strong>{formatCurrency(parseFloat(dashboardData.ec2Analysis.totalEC2Cost || "0"), currency)}</strong> across {dashboardData.ec2Analysis.totalInstanceTypes} instance types
                  </Typography>
                </Box>
                <IconButton
                  onClick={handleExportEC2}
                  sx={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    color: "white",
                    "&:hover": {
                      background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                    },
                  }}
                >
                  <FileDownloadIcon />
                </IconButton>
              </Box>

              {/* EC2 Cost Bar Chart */}
              <Box mb={4}>
                <Typography variant="subtitle1" fontWeight={600} color="var(--text-primary)" mb={2}>
                  Top 10 EC2 Instances by Cost
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ec2ChartData}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" strokeOpacity={0.3} />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" style={{ fontSize: "12px" }} />
                    <YAxis stroke="var(--text-secondary)" style={{ fontSize: "12px" }} tickFormatter={(value) => `$${value}`} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="cost" fill="url(#barGradient)" radius={[8, 8, 0, 0]} name="Cost" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              {/* EC2 Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "var(--bg-secondary)" }}>
                      <TableCell sx={{ fontWeight: 700, color: "var(--text-primary)" }}>Instance Type</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "var(--text-primary)" }}>Total Cost</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "var(--text-primary)" }}>Usage Hours</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "var(--text-primary)" }}>Cost/Hour</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "var(--text-primary)" }}>Daily Avg</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "var(--text-primary)" }}>Usage Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ec2TableData
                      .slice(ec2Page * ec2RowsPerPage, ec2Page * ec2RowsPerPage + ec2RowsPerPage)
                      .map((row: any, index: number) => (
                        <TableRow key={index} sx={{ "&:hover": { bgcolor: "var(--bg-secondary)" } }}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" fontFamily="monospace">
                                {row.instanceType}
                              </Typography>
                              <Tooltip title="Copy">
                                <IconButton size="small" onClick={() => handleCopy(row.instanceType)}>
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: "var(--text-primary)" }}>
                            {formatCurrency(row.totalCost, currency)}
                          </TableCell>
                          <TableCell align="right">{row.totalUsageHours?.toFixed(2) || 0}</TableCell>
                          <TableCell align="right">{formatCurrency(parseFloat(row.costPerHour || "0"), currency)}</TableCell>
                          <TableCell align="right">-</TableCell>
                          <TableCell>
                            <Chip
                              label={row.usageTypes?.[0]?.replace("BoxUsage:", "") || "Unknown"}
                              size="small"
                              sx={{ bgcolor: "#3b82f6", color: "white", fontWeight: 600 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={ec2TableData.length}
                rowsPerPage={ec2RowsPerPage}
                page={ec2Page}
                onPageChange={(_, newPage) => setEc2Page(newPage)}
                onRowsPerPageChange={(e) => {
                  setEc2RowsPerPage(parseInt(e.target.value, 10));
                  setEc2Page(0);
                }}
              />
            </Box>
          </TabPanel>
        )}

        {/* Tab 5: Top Resources */}
        {dashboardData?.topResources && (
          <TabPanel value={activeTab} index={dashboardData?.ec2Analysis && topServicesData ? 5 : dashboardData?.ec2Analysis || topServicesData ? 4 : 3}>
            <Box p={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="var(--text-primary)">
                    Top Resources by Cost
                  </Typography>
                  <Typography variant="body2" color="var(--text-secondary)" mt={0.5}>
                    {dashboardData.topResources?.length} resources tracked
                  </Typography>
                </Box>
                <IconButton
                  onClick={handleExportResources}
                  sx={{
                    background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
                    color: "white",
                    "&:hover": {
                      background: "linear-gradient(135deg, #db2777 0%, #7c3aed 100%)",
                    },
                  }}
                >
                  <FileDownloadIcon />
                </IconButton>
              </Box>

              {/* Resource Type Distribution */}
              <Box mb={4}>
                <Typography variant="subtitle1" fontWeight={600} color="var(--text-primary)" mb={2}>
                  Cost by Resource Type
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={resourceTypeData}>
                    <defs>
                      <linearGradient id="resourceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" strokeOpacity={0.3} />
                    <XAxis dataKey="type" stroke="var(--text-secondary)" style={{ fontSize: "12px" }} />
                    <YAxis stroke="var(--text-secondary)" style={{ fontSize: "12px" }} tickFormatter={(value) => `$${value}`} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="cost" fill="url(#resourceGradient)" radius={[8, 8, 0, 0]} name="Cost" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              {/* Resources Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "var(--bg-secondary)" }}>
                      <TableCell sx={{ fontWeight: 700, color: "var(--text-primary)" }}>Resource Type</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "var(--text-primary)" }}>Usage Type</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "var(--text-primary)" }}>Total Cost</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "var(--text-primary)" }}>Total Usage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resourceTableData
                      .slice(resourcePage * resourceRowsPerPage, resourcePage * resourceRowsPerPage + resourceRowsPerPage)
                      .map((row: any, index: number) => (
                        <TableRow key={index} sx={{ "&:hover": { bgcolor: "var(--bg-secondary)" } }}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" fontFamily="monospace" fontSize="12px">
                                {row.resourceType}
                              </Typography>
                              <Tooltip title="Copy">
                                <IconButton size="small" onClick={() => handleCopy(row.resourceType)}>
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.usageType || "N/A"}
                              size="small"
                              sx={{
                                bgcolor: "#ec4899",
                                color: "white",
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: "var(--text-primary)" }}>
                            {formatCurrency(row.totalCost, currency)}
                          </TableCell>
                          <TableCell align="right">{row.totalUsage?.toFixed(2) || 0}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={resourceTableData.length}
                rowsPerPage={resourceRowsPerPage}
                page={resourcePage}
                onPageChange={(_, newPage) => setResourcePage(newPage)}
                onRowsPerPageChange={(e) => {
                  setResourceRowsPerPage(parseInt(e.target.value, 10));
                  setResourcePage(0);
                }}
              />
            </Box>
          </TabPanel>
        )}

        {/* Tab 6: Forecast */}
        {dashboardData?.forecast && !dashboardData.forecast.message && (
          <TabPanel value={activeTab} index={dashboardData?.ec2Analysis && dashboardData?.topResources && topServicesData ? 6 : dashboardData?.ec2Analysis && (dashboardData?.topResources || topServicesData) ? 5 : 4}>
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
                  label={`Total: ${formatCurrency(parseFloat(dashboardData.forecast?.total || "0"), currency)}`}
                  sx={{
                    bgcolor: "#10b981",
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
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
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
                    stroke="#10b981"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#forecastGradient)"
                    name="Projected Cost"
                    dot={{ fill: "#10b981", r: 6, strokeWidth: 3, stroke: "var(--bg-primary)" }}
                    activeDot={{ r: 10, strokeWidth: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </TabPanel>
        )}

        {/* Tab: Bedrock Models Cost */}
        <TabPanel
          value={activeTab}
          index={
            3 +
            (topServicesData ? 1 : 0) +
            (dashboardData?.ec2Analysis ? 1 : 0) +
            (dashboardData?.topResources ? 1 : 0) +
            (dashboardData?.forecast && !dashboardData.forecast.message ? 1 : 0)
          }
        >
          <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="h5" fontWeight={700} color="var(--text-primary)">
                  AWS Bedrock Models Cost Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Track spending on AI/ML models powered by AWS Bedrock
                </Typography>
              </Box>
            </Box>

            {/* Info Alert when no Bedrock usage */}
            {bedrockData && bedrockData.models && bedrockData.models.length === 0 && (
              <Alert
                severity="info"
                icon={<MemoryIcon />}
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  border: '1px solid rgba(0, 115, 187, 0.2)',
                  '& .MuiAlert-icon': {
                    fontSize: 28
                  }
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  No AWS Bedrock Usage Detected
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This AWS account hasn't used any Bedrock AI models in the selected time period ({bedrockData.period?.startDate || 'N/A'} to {bedrockData.period?.endDate || 'N/A'}).
                  <br />
                  <strong>Cost data will automatically appear here once you start using AWS Bedrock services.</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Available models: Claude (Anthropic), Titan (Amazon), Llama (Meta), Stable Diffusion (Stability AI), and more.
                </Typography>
              </Alert>
            )}

            {/* Summary Cards */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={4}>
                <Card sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
                }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Total Bedrock Spending
                        </Typography>
                        <Typography variant="h4" fontWeight={700} mt={1}>
                          ${bedrockData?.totalCost || '0.00'}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }} mt={1}>
                          Current billing period
                        </Typography>
                      </Box>
                      <MemoryIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(240, 147, 251, 0.3)'
                }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Estimated Monthly Cost
                        </Typography>
                        <Typography variant="h4" fontWeight={700} mt={1}>
                          ${bedrockData?.estimatedMonthlyCost || '0.00'}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }} mt={1}>
                          Based on current usage
                        </Typography>
                      </Box>
                      <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(79, 172, 254, 0.3)'
                }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Total API Calls
                        </Typography>
                        <Typography variant="h4" fontWeight={700} mt={1}>
                          {bedrockData?.totalRequests || '0'}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }} mt={1}>
                          This period
                        </Typography>
                      </Box>
                      <ShowChartIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Models Usage Table */}
            <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
              <Box p={2} bgcolor="var(--card-background)">
                <Typography variant="h6" fontWeight={600} color="var(--text-primary)">
                  Model Usage Breakdown
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'var(--surface-color)' }}>
                      <TableCell><strong>Model Name</strong></TableCell>
                      <TableCell><strong>Provider</strong></TableCell>
                      <TableCell align="right"><strong>Input Tokens</strong></TableCell>
                      <TableCell align="right"><strong>Output Tokens</strong></TableCell>
                      <TableCell align="right"><strong>Total Requests</strong></TableCell>
                      <TableCell align="right"><strong>Cost</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bedrockData && bedrockData.models && bedrockData.models.length > 0 ? (
                      bedrockData.models.map((model: any, index: number) => (
                        <TableRow key={index} hover>
                          <TableCell>{model.modelName}</TableCell>
                          <TableCell>{model.provider}</TableCell>
                          <TableCell align="right">{model.inputTokens.toLocaleString()}</TableCell>
                          <TableCell align="right">{model.outputTokens.toLocaleString()}</TableCell>
                          <TableCell align="right">{model.totalRequests.toLocaleString()}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600} color="primary">
                              ${model.totalCost.toFixed(2)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            No model usage data available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Cost Trend Chart */}
            <Paper sx={{ borderRadius: 2, p: 3 }}>
              <Typography variant="h6" fontWeight={600} color="var(--text-primary)" mb={3}>
                Daily Bedrock Spending Trend
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={bedrockData?.dailyCosts || []}>
                  <defs>
                    <linearGradient id="bedrockGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis
                    dataKey="date"
                    stroke="var(--text-secondary)"
                    style={{ fontSize: 12 }}
                  />
                  <YAxis
                    stroke="var(--text-secondary)"
                    style={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'var(--card-background)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 8
                    }}
                    formatter={(value: any) => [`$${value}`, 'Cost']}
                  />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke="#667eea"
                    strokeWidth={2}
                    fill="url(#bedrockGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </TabPanel>
      </Paper>
    </div>
  );
}
