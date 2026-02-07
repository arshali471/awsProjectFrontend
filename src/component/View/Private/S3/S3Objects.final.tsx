import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LoadingContext,
  SelectedRegionContext,
  SelectedAccountContext,
} from "../../../context/context";
import { AdminService } from "../../../services/admin.service";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Grid,
  Divider,
  Tabs,
  Tab,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfoIcon from "@mui/icons-material/Info";
import SecurityIcon from "@mui/icons-material/Security";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";
import SettingsIcon from "@mui/icons-material/Settings";
import StorageIcon from "@mui/icons-material/Storage";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import HistoryIcon from "@mui/icons-material/History";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import TableViewIcon from "@mui/icons-material/TableView";
import S3ObjectsTable from "../../../Table/S3Objects.table";
import TablePagination from "../../../Pagination/TablePagination";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import "../SharedPage.css";

interface BucketConfiguration {
  versioning?: any;
  encryption?: any[];
  logging?: any;
  cors?: any[];
  lifecycle?: any[];
  policy?: any;
  acl?: any;
  publicAccess?: any;
}

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
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function S3Objects() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedRegion }: any = useContext(SelectedRegionContext);
  const { selectedAccount }: any = useContext(SelectedAccountContext);
  const { loading, setLoading }: any = useContext(LoadingContext);

  const [bucketName, setBucketName] = useState<string>("");
  const [bucketRegion, setBucketRegion] = useState<string>("");
  const [objects, setObjects] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const [configuration, setConfiguration] = useState<BucketConfiguration>({});
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string>("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalBucketSize, setTotalBucketSize] = useState<number>(0);

  // Object details modal
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [objectDetailsOpen, setObjectDetailsOpen] = useState(false);

  useEffect(() => {
    const bucket = location.state?.bucket;
    if (!bucket) {
      navigate("/platform/s3");
      return;
    }
    setBucketName(bucket.bucketName || bucket.Name || "");
    setBucketRegion(bucket.location || bucket.LocationConstraint || selectedRegion?.value || "us-east-1");
  }, [location, navigate]);

  const fetchBucketObjects = async (page: number = 1, pageSize: number = 10, search: string = "") => {
    if (!selectedAccount?.value || !selectedRegion?.value || !bucketName) return;

    setLoading(true);
    setError("");

    try {
      const credsRes = await AdminService.getCredentialsByAccountAndRegion(
        selectedAccount.value,
        selectedRegion.value
      );

      if (credsRes.status === 200 && credsRes.data._id) {
        const credentialsId = credsRes.data._id;
        const objectsRes = await AdminService.getS3ObjectsPaginated(
          credentialsId,
          bucketName,
          selectedRegion.value,
          page,
          pageSize,
          search
        );

        if (objectsRes.status === 200 || objectsRes.data?.status === 200) {
          const responseData = objectsRes.data || objectsRes;
          const objectsData = responseData.data || [];
          const paginationData = responseData.pagination || {};

          setObjects(objectsData);
          setTotalCount(paginationData.totalItems || 0);
          
          // Calculate total bucket size (this is approximate based on total items)
          // In a real scenario, you'd get this from bucket metadata
          const currentPageSize = objectsData.reduce((sum: number, obj: any) => sum + (obj.Size || obj.size || 0), 0);
          const estimatedTotalSize = (currentPageSize / objectsData.length) * (paginationData.totalItems || 0);
          setTotalBucketSize(estimatedTotalSize || 0);
        } else {
          setError("Failed to fetch S3 objects");
          setObjects([]);
        }
      }
    } catch (error: any) {
      console.error("Error fetching objects:", error);
      setError("Error: " + (error?.response?.data?.message || error?.message || "Unknown error"));
      setObjects([]);
    }

    setLoading(false);
  };

  const fetchBucketConfiguration = async () => {
    if (!selectedAccount?.value || !selectedRegion?.value || !bucketName) return;

    try {
      const credsRes = await AdminService.getCredentialsByAccountAndRegion(
        selectedAccount.value,
        selectedRegion.value
      );

      if (credsRes.status === 200 && credsRes.data._id) {
        const credentialsId = credsRes.data._id;
        const configRes = await AdminService.getS3BucketConfiguration(
          credentialsId,
          bucketName,
          selectedRegion.value
        );

        if (configRes?.data?.data) {
          setConfiguration(configRes.data.data);
        } else if (configRes?.data && !configRes.data.status) {
          setConfiguration(configRes.data);
        }
      }
    } catch (error: any) {
      console.error("Error fetching configuration:", error);
    }
  };

  useEffect(() => {
    if (bucketName && selectedAccount?.value && selectedRegion?.value) {
      fetchBucketObjects(currentPage, perPage, searchText);
      fetchBucketConfiguration();
    }
  }, [bucketName, selectedAccount?.value, selectedRegion?.value]);

  useEffect(() => {
    if (bucketName && selectedAccount?.value && selectedRegion?.value) {
      fetchBucketObjects(currentPage, perPage, searchText);
    }
  }, [currentPage, perPage, searchText]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBucketObjects(currentPage, perPage, searchText);
    fetchBucketConfiguration();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatBytes = (bytes: number | string) => {
    const numBytes = typeof bytes === "string" ? parseFloat(bytes) : bytes;
    if (isNaN(numBytes) || numBytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
    if (numBytes < k) return Math.round(numBytes * 100) / 100 + " B";
    const i = Math.floor(Math.log(Math.max(numBytes, 1)) / Math.log(k));
    const value = numBytes / Math.pow(k, i);
    return (Math.round(value * 100) / 100).toFixed(2) + " " + sizes[Math.min(i, sizes.length - 1)];
  };

  const handleObjectClick = (object: any) => {
    setSelectedObject(object);
    setObjectDetailsOpen(true);
  };

  const handleCloseObjectDetails = () => {
    setObjectDetailsOpen(false);
    setSelectedObject(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getObjectUrl = (objectKey: string) => {
    return `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${objectKey}`;
  };

  const getObjectArn = (objectKey: string) => {
    return `arn:aws:s3:::${bucketName}/${objectKey}`;
  };

  const bucketArn = `arn:aws:s3:::${bucketName}`;

  const currentPageSize = objects.reduce((sum, obj) => sum + (obj.Size || obj.size || 0), 0);
  const storageClasses = new Set(objects.map((o) => o.StorageClass || o.storageClass || "STANDARD")).size;

  // Export functions
  const handleExportCSV = () => {
    const csvData = objects.map((obj, index) => ({
      'Sr No': (currentPage - 1) * perPage + index + 1,
      'Object Name': obj.Key || obj.name || '',
      'Size': formatBytes(obj.Size || obj.size || 0),
      'Storage Class': obj.StorageClass || obj.storageClass || 'STANDARD',
      'Last Modified': obj.LastModified || obj.lastModified || '',
      'ETag': obj.ETag || obj.etag || '',
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const timestamp = new Date().toISOString().split('T')[0];
    saveAs(blob, `${bucketName}_Objects_${timestamp}.csv`);
    toast.success('CSV exported successfully!');
  };

  const handleExportExcel = () => {
    const excelData = objects.map((obj, index) => ({
      'Sr No': (currentPage - 1) * perPage + index + 1,
      'Object Name': obj.Key || obj.name || '',
      'Size': formatBytes(obj.Size || obj.size || 0),
      'Storage Class': obj.StorageClass || obj.storageClass || 'STANDARD',
      'Last Modified': obj.LastModified || obj.lastModified || '',
      'ETag': obj.ETag || obj.etag || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'S3 Objects');

    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `${bucketName}_Objects_${timestamp}.xlsx`);
    toast.success('Excel exported successfully!');
  };

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', pb: 4 }}>
      {/* Compact Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0', px: 3, py: 2 }}>
        <Breadcrumbs sx={{ mb: 1 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate("/platform/s3")}
            sx={{ color: '#0073bb', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            S3
          </Link>
          <Typography color="text.primary" fontWeight={500}>{bucketName}</Typography>
        </Breadcrumbs>

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #ff9900 0%, #ff6f00 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <StorageIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="#232f3e">
                {bucketName}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="caption" color="text.secondary">
                  ARN:
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '11px' }}>
                  {bucketArn}
                </Typography>
                <IconButton size="small" onClick={() => copyToClipboard(bucketArn)} sx={{ p: 0.5 }}>
                  <ContentCopyIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            </Box>
          </Box>

          <Box display="flex" gap={1}>
            <IconButton
              onClick={() => navigate("/platform/s3")}
              size="small"
              sx={{
                border: '1px solid #d5dbdb',
                borderRadius: '8px',
                '&:hover': { bgcolor: '#f5f7fa' }
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing || loading}
              size="small"
              sx={{
                border: '1px solid #d5dbdb',
                borderRadius: '8px',
                '&:hover': { bgcolor: '#f5f7fa' }
              }}
            >
              {refreshing ? <CircularProgress size={20} /> : <RefreshIcon fontSize="small" />}
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ px: 3, pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        {/* AWS-Style Tabs */}
        <Paper elevation={0} sx={{ bgcolor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: '1px solid #e0e0e0',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '14px',
                minHeight: '48px',
                color: '#545b64',
                '&.Mui-selected': {
                  color: '#0073bb',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#0073bb',
                height: '3px',
              },
            }}
          >
            <Tab label="Objects" />
            <Tab label="Properties" />
            <Tab label="Permissions" />
            <Tab label="Metrics" />
            <Tab label="Management" />
            <Tab label="Access Points" />
            <Tab label="Replication" />
          </Tabs>

          {/* Objects Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ px: 2, pb: 2 }}>
              {/* Stats Row */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ border: '1px solid #e0e0e0', bgcolor: '#fafbfc' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Total Objects
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="#ff9900">
                        {totalCount.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ border: '1px solid #e0e0e0', bgcolor: '#fafbfc' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Total Bucket Size
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="#0073bb">
                        {formatBytes(totalBucketSize)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ border: '1px solid #e0e0e0', bgcolor: '#fafbfc' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Current Page
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {currentPage} / {Math.ceil(totalCount / perPage)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ border: '1px solid #e0e0e0', bgcolor: '#fafbfc' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Storage Classes
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="#16191f">
                        {storageClasses}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Search and Export in same row */}
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <TextField
                  placeholder="Find objects by prefix"
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setCurrentPage(1);
                  }}
                  size="small"
                  sx={{ maxWidth: '500px', flex: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#545b64' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExportCSV}
                    sx={{
                      textTransform: 'none',
                      borderColor: '#d5dbdb',
                      color: '#545b64',
                      '&:hover': {
                        borderColor: '#ff9900',
                        bgcolor: '#fff5e6',
                      }
                    }}
                  >
                    CSV
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<TableViewIcon />}
                    onClick={handleExportExcel}
                    sx={{
                      textTransform: 'none',
                      borderColor: '#d5dbdb',
                      color: '#545b64',
                      '&:hover': {
                        borderColor: '#10b981',
                        bgcolor: '#f0fdf4',
                      }
                    }}
                  >
                    Excel
                  </Button>
                </Box>
              </Box>

              {/* Table */}
              <S3ObjectsTable 
                tableData={objects} 
                loading={loading}
                currentPage={currentPage}
                pageSize={perPage}
                onObjectClick={handleObjectClick}
              />

              {/* Pagination */}
              <Box sx={{ mt: 2 }}>
                <TablePagination
                  total={totalCount}
                  currentPage={currentPage}
                  perPage={perPage}
                  handlePageChange={setCurrentPage}
                  setPerPage={(newSize: number) => {
                    setPerPage(newSize);
                    setCurrentPage(1);
                  }}
                />
              </Box>
            </Box>
          </TabPanel>

          {/* Properties Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ px: 2, pb: 2, maxWidth: '1000px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Bucket ARN */}
                <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <InfoIcon sx={{ color: '#0073bb' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Bucket ARN
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: '#f5f7fa', p: 1, borderRadius: 1, flex: 1 }}>
                        {bucketArn}
                      </Typography>
                      <IconButton size="small" onClick={() => copyToClipboard(bucketArn)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>

                {/* Bucket Versioning */}
                <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <HistoryIcon sx={{ color: '#0073bb' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Bucket Versioning
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          Status
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Keep multiple versions of objects in the same bucket
                        </Typography>
                      </Box>
                      <Chip
                        label={configuration.versioning?.Status || "Disabled"}
                        color={configuration.versioning?.Status === "Enabled" ? "success" : "default"}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>

                {/* Default Encryption */}
                <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <LockIcon sx={{ color: '#0073bb' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Default Encryption
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {configuration.encryption && Array.isArray(configuration.encryption) && configuration.encryption.length > 0 ? (
                      <Box>
                        <Chip label="Enabled" color="success" size="small" sx={{ mb: 1 }} />
                        <Box sx={{ bgcolor: '#f5f7fa', p: 2, borderRadius: 1, mt: 2 }}>
                          <pre style={{ margin: 0, fontSize: '12px', overflow: 'auto' }}>
                            {JSON.stringify(configuration.encryption, null, 2)}
                          </pre>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No encryption configuration
                      </Typography>
                    )}
                  </CardContent>
                </Card>

                {/* Server Access Logging */}
                <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <AnalyticsIcon sx={{ color: '#0073bb' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Server Access Logging
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      {configuration.logging ? "Enabled" : "Disabled"}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Static Website Hosting */}
                <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <PublicIcon sx={{ color: '#0073bb' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Static Website Hosting
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Disabled
                    </Typography>
                  </CardContent>
                </Card>

                {/* Object Lock */}
                <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <LockIcon sx={{ color: '#0073bb' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Object Lock
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Disabled - Object Lock must be enabled when you create a bucket
                    </Typography>
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <InfoIcon sx={{ color: '#0073bb' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Tags
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No tags
                    </Typography>
                  </CardContent>
                </Card>

                {/* Transfer Acceleration */}
                <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <CloudUploadIcon sx={{ color: '#0073bb' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Transfer Acceleration
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Disabled
                    </Typography>
                  </CardContent>
                </Card>

                {/* Requester Pays */}
                <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <SettingsIcon sx={{ color: '#0073bb' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Requester Pays
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Disabled
                    </Typography>
                  </CardContent>
                </Card>

                {/* Event Notifications */}
                <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <NotificationsIcon sx={{ color: '#0073bb' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Event Notifications
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No event notifications configured
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </TabPanel>

          {/* Permissions Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ px: 2, pb: 2, maxWidth: '1000px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Block Public Access */}
                <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <PublicIcon sx={{ color: '#d32f2f' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Block Public Access
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {configuration.publicAccess ? (
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Block all public access"
                            secondary={configuration.publicAccess.BlockPublicAcls ? "On" : "Off"}
                          />
                          <Chip
                            label={configuration.publicAccess.BlockPublicAcls ? "Blocked" : "Allowed"}
                            color={configuration.publicAccess.BlockPublicAcls ? "success" : "error"}
                            size="small"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Block public access granted through ACLs"
                            secondary={configuration.publicAccess.BlockPublicPolicy ? "On" : "Off"}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Block public access granted through policies"
                            secondary={configuration.publicAccess.IgnorePublicAcls ? "On" : "Off"}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Block public and cross-account access"
                            secondary={configuration.publicAccess.RestrictPublicBuckets ? "On" : "Off"}
                          />
                        </ListItem>
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No public access block configuration
                      </Typography>
                    )}
                  </CardContent>
                </Card>

                {/* Bucket Policy */}
                <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <SecurityIcon sx={{ color: '#0073bb' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Bucket Policy
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ bgcolor: '#1e1e1e', p: 2, borderRadius: 1, maxHeight: '400px', overflow: 'auto' }}>
                      <pre style={{ margin: 0, color: '#d4d4d4', fontSize: '12px' }}>
                        {typeof configuration.policy === 'object'
                          ? JSON.stringify(configuration.policy, null, 2)
                          : configuration.policy || JSON.stringify({ Version: "2012-10-17", Statement: [] }, null, 2)}
                      </pre>
                    </Box>
                  </CardContent>
                </Card>

                {/* Access Control List (ACL) */}
                <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <LockIcon sx={{ color: '#0073bb' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Access Control List (ACL)
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {configuration.acl ? (
                      <Box sx={{ bgcolor: '#f5f7fa', p: 2, borderRadius: 1 }}>
                        <pre style={{ margin: 0, fontSize: '12px', overflow: 'auto' }}>
                          {JSON.stringify(configuration.acl, null, 2)}
                        </pre>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No ACL configuration
                      </Typography>
                    )}
                  </CardContent>
                </Card>

                {/* CORS Configuration */}
                <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <PublicIcon sx={{ color: '#0073bb' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Cross-Origin Resource Sharing (CORS)
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {configuration.cors && configuration.cors.length > 0 ? (
                      configuration.cors.map((rule: any, idx: number) => (
                        <Box key={idx} sx={{ mb: 2, p: 2, bgcolor: '#f5f7fa', borderRadius: 1 }}>
                          <Typography variant="body2" fontWeight={500}>
                            Rule {idx + 1}
                          </Typography>
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            <strong>Allowed Origins:</strong> {rule.AllowedOrigins?.join(", ") || "N/A"}
                          </Typography>
                          <Typography variant="caption" display="block">
                            <strong>Allowed Methods:</strong> {rule.AllowedMethods?.join(", ") || "N/A"}
                          </Typography>
                          <Typography variant="caption" display="block">
                            <strong>Allowed Headers:</strong> {rule.AllowedHeaders?.join(", ") || "N/A"}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No CORS rules configured
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </TabPanel>

          {/* Metrics Tab */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ px: 2, pb: 2, maxWidth: '1000px' }}>
              <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <MonitorHeartIcon sx={{ color: '#0073bb' }} />
                    <Typography variant="h6" fontWeight={600}>
                      CloudWatch Metrics
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Metrics are not available in this view. Visit CloudWatch for detailed metrics.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>

          {/* Management Tab */}
          <TabPanel value={tabValue} index={4}>
            <Box sx={{ px: 2, pb: 2, maxWidth: '1000px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Lifecycle Rules */}
                <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <HistoryIcon sx={{ color: '#0073bb' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Lifecycle Rules
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {configuration.lifecycle && configuration.lifecycle.length > 0 ? (
                      configuration.lifecycle.map((rule: any, idx: number) => (
                        <Accordion key={idx}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>{rule.ID || `Rule ${idx + 1}`}</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box sx={{ bgcolor: '#f5f7fa', p: 2, borderRadius: 1 }}>
                              <pre style={{ margin: 0, fontSize: '12px' }}>
                                {JSON.stringify(rule, null, 2)}
                              </pre>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No lifecycle rules configured
                      </Typography>
                    )}
                  </CardContent>
                </Card>

                {/* Replication Rules */}
                <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <CloudUploadIcon sx={{ color: '#0073bb' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Replication Rules
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No replication rules configured
                    </Typography>
                  </CardContent>
                </Card>

                {/* Inventory Configurations */}
                <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <AnalyticsIcon sx={{ color: '#0073bb' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Inventory Configurations
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No inventory configurations
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </TabPanel>

          {/* Access Points Tab */}
          <TabPanel value={tabValue} index={5}>
            <Box sx={{ px: 2, pb: 2, maxWidth: '1000px' }}>
              <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Access Points
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No access points configured
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>

          {/* Replication Tab */}
          <TabPanel value={tabValue} index={6}>
            <Box sx={{ px: 2, pb: 2, maxWidth: '1000px' }}>
              <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Replication
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Replication is not configured. To replicate objects to a destination bucket, create a replication rule.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>
        </Paper>
      </Box>

      {/* Object Details Dialog */}
      <Dialog
        open={objectDetailsOpen}
        onClose={handleCloseObjectDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Object Details</Typography>
            <IconButton onClick={handleCloseObjectDetails} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedObject && (
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 600, width: '30%' }}>
                    Object Name
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {selectedObject.Key || selectedObject.name}
                      </Typography>
                      <IconButton size="small" onClick={() => copyToClipboard(selectedObject.Key || selectedObject.name)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 600 }}>
                    Object ARN
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {getObjectArn(selectedObject.Key || selectedObject.name)}
                      </Typography>
                      <IconButton size="small" onClick={() => copyToClipboard(getObjectArn(selectedObject.Key || selectedObject.name))}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 600 }}>
                    Object URL
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', color: '#0073bb' }}>
                        {getObjectUrl(selectedObject.Key || selectedObject.name)}
                      </Typography>
                      <IconButton size="small" onClick={() => copyToClipboard(getObjectUrl(selectedObject.Key || selectedObject.name))}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 600 }}>
                    Size
                  </TableCell>
                  <TableCell>{formatBytes(selectedObject.Size || selectedObject.size || 0)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 600 }}>
                    Storage Class
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={selectedObject.StorageClass || selectedObject.storageClass || 'STANDARD'} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 600 }}>
                    Last Modified
                  </TableCell>
                  <TableCell>{selectedObject.LastModified || selectedObject.lastModified || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ fontWeight: 600 }}>
                    ETag
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {selectedObject.ETag || selectedObject.etag || 'N/A'}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseObjectDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
