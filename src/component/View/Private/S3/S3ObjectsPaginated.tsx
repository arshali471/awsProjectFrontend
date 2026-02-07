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
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfoIcon from "@mui/icons-material/Info";
import SecurityIcon from "@mui/icons-material/Security";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import S3ObjectsTable from "../../../Table/S3Objects.table";
import TablePagination from "../../../Pagination/TablePagination";
import { Form } from "react-bootstrap";
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

export default function S3Objects() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedRegion }: any = useContext(SelectedRegionContext);
  const { selectedAccount }: any = useContext(SelectedAccountContext);
  const { loading, setLoading }: any = useContext(LoadingContext);

  const [bucketName, setBucketName] = useState<string>("");
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
  const [totalPages, setTotalPages] = useState<number>(0);

  // Extract bucket name from state
  useEffect(() => {
    const bucket = location.state?.bucket;
    if (!bucket) {
      navigate("/platform/s3");
      return;
    }
    setBucketName(bucket.bucketName || bucket.Name || "");
  }, [location, navigate]);

  // Fetch objects with pagination and search
  const fetchBucketObjects = async (page: number = 1, pageSize: number = 10, search: string = "") => {
    if (!selectedAccount?.value || !selectedRegion?.value || !bucketName) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const credsRes = await AdminService.getCredentialsByAccountAndRegion(
        selectedAccount.value,
        selectedRegion.value
      );

      if (credsRes.status === 200 && credsRes.data._id) {
        const credentialsId = credsRes.data._id;

        // Fetch S3 objects with pagination
        const objectsRes = await AdminService.getS3ObjectsPaginated(
          credentialsId,
          bucketName,
          selectedRegion.value,
          page,
          pageSize,
          search
        );

        console.log("S3 Objects Paginated Response:", objectsRes);

        if (objectsRes.status === 200 || objectsRes.data?.status === 200) {
          const responseData = objectsRes.data || objectsRes;
          const objectsData = responseData.data || [];
          const paginationData = responseData.pagination || {};

          setObjects(objectsData);
          setTotalCount(paginationData.totalItems || 0);
          setTotalPages(paginationData.totalPages || 0);
        } else {
          setError("Failed to fetch S3 objects");
          setObjects([]);
        }
      } else {
        setError("Failed to get credentials");
      }
    } catch (error: any) {
      console.error("Error fetching paginated objects:", error);
      setError("Error: " + (error?.response?.data?.message || error?.message || "Unknown error"));
      setObjects([]);
    }

    setLoading(false);
  };

  // Fetch bucket configuration
  const fetchBucketConfiguration = async () => {
    if (!selectedAccount?.value || !selectedRegion?.value || !bucketName) {
      return;
    }

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

        console.log("Configuration Response:", configRes);

        if (configRes?.data?.data) {
          setConfiguration(configRes.data.data);
        } else if (configRes?.data && !configRes.data.status) {
          setConfiguration(configRes.data);
        } else {
          setConfiguration({});
        }
      }
    } catch (error: any) {
      console.error("Error fetching bucket configuration:", error);
      setConfiguration({});
    }
  };

  // Initial load and when bucket changes
  useEffect(() => {
    if (bucketName && selectedAccount?.value && selectedRegion?.value) {
      fetchBucketObjects(currentPage, perPage, searchText);
      fetchBucketConfiguration();
    }
  }, [bucketName, selectedAccount?.value, selectedRegion?.value]);

  // When pagination or search changes
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

  // Calculate total size from current page
  const totalSize = objects.reduce((sum, obj) => sum + (obj.Size || obj.size || 0), 0);

  // Get unique storage classes
  const storageClasses = new Set(objects.map((o) => o.StorageClass || o.storageClass || "STANDARD")).size;

  return (
    <div className="page-wrapper">
      {/* Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate("/platform/s3")}
            sx={{
              cursor: "pointer",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            S3 Buckets
          </Link>
          <Typography color="textPrimary">{bucketName}</Typography>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton
              onClick={() => navigate("/platform/s3")}
              sx={{
                background: "linear-gradient(135deg, #ff9900 0%, #ffc266 100%)",
                color: "white",
                width: 48,
                height: 48,
                "&:hover": {
                  background: "linear-gradient(135deg, #e68900 0%, #ffb84d 100%)",
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box
              sx={{
                width: 56,
                height: 56,
                background: "linear-gradient(135deg, #ff9900 0%, #ffc266 100%)",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: "0 4px 16px rgba(255, 153, 0, 0.3)",
              }}
            >
              <FolderIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "#232f3e",
                  letterSpacing: "-0.5px",
                }}
              >
                {bucketName}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6c757d", mt: 0.5 }}>
                Browse and manage bucket objects and configurations
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleRefresh}
            disabled={refreshing || loading}
            sx={{
              background: "linear-gradient(135deg, #ff9900 0%, #ffc266 100%)",
              color: "white",
              width: 48,
              height: 48,
              "&:hover": {
                background: "linear-gradient(135deg, #e68900 0%, #ffb84d 100%)",
                transform: "rotate(180deg)",
              },
              transition: "all 0.3s ease",
              "&.Mui-disabled": {
                background: "linear-gradient(135deg, #ff9900 0%, #ffc266 100%)",
                color: "white",
                opacity: 0.7,
              },
            }}
          >
            {refreshing || loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              <RefreshIcon />
            )}
          </IconButton>
        </Box>
      </Box>

      {/* Error Message */}
      {error && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            backgroundColor: "#ffebee",
            border: "1px solid #ef5350",
            borderRadius: "8px",
          }}
        >
          <Typography sx={{ color: "#c62828", fontWeight: 600, mb: 1 }}>
            ⚠️ Error Loading Data
          </Typography>
          <Typography
            sx={{
              color: "#d32f2f",
              fontSize: "14px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {error}
          </Typography>
        </Box>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Objects" />
          <Tab label="Configuration" />
        </Tabs>
      </Box>

      {/* Objects Tab */}
      {tabValue === 0 && (
        <>
          {/* Stats Cards */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Objects
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#ff9900" }}>
                      {totalCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: "linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)" }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Page Size
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#ff9900" }}>
                      {formatBytes(totalSize)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Avg Size
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#ff9900" }}>
                      {formatBytes(objects.length > 0 ? totalSize / objects.length : 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)" }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Storage Classes
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#ff9900" }}>
                      {storageClasses}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Search Box */}
          <Box sx={{ mb: 3 }}>
            <Form.Group>
              <Form.Control
                style={{ width: 400 }}
                placeholder="Search objects..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </Form.Group>
          </Box>

          {/* Objects Table */}
          <S3ObjectsTable tableData={objects} loading={loading} />

          {/* Pagination */}
          <div className="bg-white py-2">
            <TablePagination
              total={totalCount}
              currentPage={currentPage}
              perPage={perPage}
              handlePageChange={setCurrentPage}
              setPerPage={(newSize: number) => {
                setPerPage(newSize);
                setCurrentPage(1); // Reset to first page when changing page size
              }}
            />
          </div>
        </>
      )}

      {/* Configuration Tab */}
      {tabValue === 1 && (
        <Box>
          {loading ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={5}
            >
              <CircularProgress size={50} />
              <Typography sx={{ mt: 2, color: "#666" }}>
                Loading configuration...
              </Typography>
            </Box>
          ) : Object.keys(configuration).length === 0 ? (
            <Box
              sx={{
                p: 3,
                backgroundColor: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <Typography sx={{ color: "#856404", fontWeight: 600 }}>
                ℹ️ No Configuration Data
              </Typography>
              <Typography sx={{ color: "#856404", fontSize: "14px", mt: 1 }}>
                Configuration data could not be retrieved.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* General Configuration */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <InfoIcon sx={{ color: "#ff9900" }} />
                      <Typography variant="h6" fontWeight={700}>
                        General Configuration
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Versioning
                        </Typography>
                        <Chip
                          label={
                            configuration.versioning?.Status
                              ? `${configuration.versioning.Status}`
                              : "Disabled"
                          }
                          color="primary"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Encryption
                        </Typography>
                        <Chip
                          label={
                            Array.isArray(configuration.encryption) &&
                            configuration.encryption.length > 0
                              ? "Enabled"
                              : "Disabled"
                          }
                          color="success"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          ACL
                        </Typography>
                        <Chip
                          label={configuration.acl?.Owner ? "Configured" : "Not Set"}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Public Access Block
                        </Typography>
                        <Chip
                          label={
                            configuration.publicAccess?.BlockPublicAcls
                              ? "Blocked"
                              : "Allowed"
                          }
                          color={
                            configuration.publicAccess?.BlockPublicAcls ? "success" : "error"
                          }
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Bucket Policy */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <SecurityIcon sx={{ color: "#ff9900" }} />
                      <Typography variant="h6" fontWeight={700}>
                        Bucket Policy
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box
                      sx={{
                        background: "#1e1e1e",
                        p: 2,
                        borderRadius: 1,
                        border: "1px solid #444",
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                        maxHeight: "400px",
                        overflowY: "auto",
                        lineHeight: "1.5",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#d4d4d4",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {typeof configuration.policy === "object"
                          ? JSON.stringify(configuration.policy, null, 2)
                          : configuration.policy ||
                            JSON.stringify({ Version: "2012-10-17", Statement: [] }, null, 2)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Encryption Configuration */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} mb={2}>
                      Encryption Configuration
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    {configuration.encryption &&
                    Array.isArray(configuration.encryption) &&
                    configuration.encryption.length > 0 ? (
                      <Box
                        sx={{
                          background: "#1e1e1e",
                          p: 2,
                          borderRadius: 1,
                          border: "1px solid #444",
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                          maxHeight: "300px",
                          overflowY: "auto",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#d4d4d4",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {JSON.stringify(configuration.encryption, null, 2)}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography color="textSecondary">No encryption configuration</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* CORS Configuration */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} mb={2}>
                      CORS Configuration
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    {configuration.cors && configuration.cors.length > 0 ? (
                      configuration.cors.map((rule: any, idx: number) => (
                        <Box
                          key={idx}
                          sx={{ mb: 2, p: 2, background: "#f5f5f5", borderRadius: 1 }}
                        >
                          <Typography variant="body2">
                            <strong>Origins:</strong> {rule.AllowedOrigins?.join(", ") || "N/A"}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography color="textSecondary">No CORS rules configured</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Lifecycle Rules */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} mb={2}>
                      Lifecycle Rules
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    {configuration.lifecycle && configuration.lifecycle.length > 0 ? (
                      configuration.lifecycle.map((rule: any, idx: number) => (
                        <Accordion key={idx}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>{rule.ID || `Rule ${idx + 1}`}</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2">{JSON.stringify(rule, null, 2)}</Typography>
                          </AccordionDetails>
                        </Accordion>
                      ))
                    ) : (
                      <Typography color="textSecondary">No lifecycle rules configured</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      )}
    </div>
  );
}
