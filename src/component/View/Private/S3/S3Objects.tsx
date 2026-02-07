import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoadingContext, SelectedRegionContext, SelectedAccountContext } from "../../../context/context";
import { AdminService } from "../../../services/admin.service";
import { Box, Typography, IconButton, CircularProgress, Breadcrumbs, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, TextField, InputAdornment, Card, CardContent, Grid, Divider, Accordion, AccordionSummary, AccordionDetails, Tabs, Tab, Button } from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";
import RefreshIcon from "@mui/icons-material/Refresh";
import FolderIcon from "@mui/icons-material/Folder";
import DescriptionIcon from "@mui/icons-material/Description";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SecurityIcon from "@mui/icons-material/Security";
import InfoIcon from "@mui/icons-material/Info";
import "../SharedPage.css";

interface S3Object {
  name: string;
  size: number;
  lastModified: Date;
  storageClass: string;
  etag: string;
  isFolder?: boolean;
}

interface BucketConfiguration {
  versioning?: string;
  encryption?: string;
  logging?: any;
  cors?: any[];
  lifecycle?: any[];
  policy?: string;
  acl?: string;
  publicAccess?: boolean;
}

export default function S3Objects() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedRegion }: any = useContext(SelectedRegionContext);
  const { selectedAccount }: any = useContext(SelectedAccountContext);

  const [bucketName, setBucketName] = useState<string>("");
  const [objects, setObjects] = useState<S3Object[]>([]);
  const [filteredObjects, setFilteredObjects] = useState<S3Object[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLocalLoading] = useState(false);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [configuration, setConfiguration] = useState<BucketConfiguration>({});
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string>("");
  const [itemsPerPage] = useState(100);
  const [displayedItems, setDisplayedItems] = useState(100);

  // Extract bucket name from state
  useEffect(() => {
    const bucket = location.state?.bucket;
    if (!bucket) {
      navigate("/platform/s3");
      return;
    }
    setBucketName(bucket.bucketName || bucket.Name || "");
    fetchBucketData(bucket.bucketName || bucket.Name || "");
  }, [location, navigate]);

  const fetchBucketData = async (bucket: string) => {
    if (!selectedAccount?.value || !selectedRegion?.value) {
      setError("Account or region not selected");
      return;
    }

    setLocalLoading(true);
    setError("");

    try {
      const credsRes = await AdminService.getCredentialsByAccountAndRegion(
        selectedAccount.value,
        selectedRegion.value
      );

      if (credsRes.status === 200 && credsRes.data._id) {
        const credentialsId = credsRes.data._id;

        // Fetch S3 objects - NO FALLBACK
        try {
          console.log("Fetching S3 objects from:", credentialsId, bucket, selectedRegion.value);
          const objectsRes = await AdminService.getS3Objects(
            credentialsId,
            bucket,
            selectedRegion.value
          );
          console.log("S3 Objects Response:", objectsRes);
          
          // Handle response - could be wrapped in data.data or just data
          let objectsData = [];
          
          if (Array.isArray(objectsRes)) {
            // Direct array response
            objectsData = objectsRes;
          } else if (objectsRes?.data && Array.isArray(objectsRes.data)) {
            // Wrapped once: response.data is array
            objectsData = objectsRes.data;
          } else if (objectsRes?.data?.data && Array.isArray(objectsRes.data.data)) {
            // Wrapped twice: response.data.data is array (axios wrapper)
            objectsData = objectsRes.data.data;
          } else if (objectsRes?.data?.status === 200 && Array.isArray(objectsRes?.data?.data)) {
            // Backend response: { status, message, data: [...] }
            objectsData = objectsRes.data.data;
          }

          if (objectsData && objectsData.length > 0) {
            const fetchedObjects = objectsData.map((obj: any) => ({
              name: obj.Key || obj.key || "",
              size: obj.Size || obj.size || 0,
              lastModified: new Date(obj.LastModified || obj.lastModified || new Date()),
              storageClass: obj.StorageClass || obj.storageClass || "STANDARD",
              etag: obj.ETag || obj.etag || "",
              isFolder: false,
            }));
            setObjects(fetchedObjects);
            setFilteredObjects(fetchedObjects);
            setDisplayedItems(itemsPerPage);
            setTotalSize(fetchedObjects.reduce((sum: number, obj: S3Object) => sum + obj.size, 0));
            console.log("Successfully loaded", fetchedObjects.length, "objects");
          } else if (Array.isArray(objectsData) && objectsData.length === 0) {
            setError("Bucket is empty - no objects found");
            setObjects([]);
            setFilteredObjects([]);
          } else {
            setError("Unexpected response format from server: " + JSON.stringify(objectsRes));
            setObjects([]);
            setFilteredObjects([]);
          }
        } catch (objectsError: any) {
          console.error("Error fetching S3 objects:", objectsError);
          setError("Failed to fetch S3 objects: " + (objectsError?.response?.data?.error || objectsError?.response?.data?.message || objectsError?.message || JSON.stringify(objectsError)));
          setObjects([]);
          setFilteredObjects([]);
        }

        // Fetch bucket configuration - NO FALLBACK
        try {
          console.log("Fetching bucket configuration...");
          const configRes = await AdminService.getS3BucketConfiguration(
            credentialsId,
            bucket,
            selectedRegion.value
          );
          console.log("Configuration Response:", configRes);
          
          // Handle response - could be wrapped in data.data or just data
          let configData = null;
          
          if (configRes?.data && typeof configRes.data === 'object' && !Array.isArray(configRes.data)) {
            // Check if it's the backend response format
            if (configRes.data.status === 200 && configRes.data.data) {
              // Backend response: { status, message, data: {...} }
              configData = configRes.data.data;
            } else if (!configRes.data.status) {
              // Just wrapped once by axios
              configData = configRes.data;
            }
          }
          
          if (configData) {
            setConfiguration(configData);
            console.log("Configuration loaded successfully");
          } else if (configRes) {
            console.log("Configuration response format:", configRes);
            setConfiguration({});
          } else {
            console.log("No configuration data received");
            setConfiguration({});
          }
        } catch (configError: any) {
          console.error("Error fetching bucket configuration:", configError);
          setConfiguration({});
        }
      } else {
        setError("Failed to get credentials");
      }
    } catch (error: any) {
      console.error("Error in fetchBucketData:", error);
      setError("Error: " + (error?.message || error));
    }

    setLocalLoading(false);
  };

  useEffect(() => {
    if (searchText) {
      const filtered = objects.filter((obj: S3Object) => {
        return obj.name.toLowerCase().includes(searchText.toLowerCase());
      });
      setFilteredObjects(filtered);
    } else {
      setFilteredObjects(objects);
    }
  }, [searchText, objects]);

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

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      fetchBucketData(bucketName);
      setRefreshing(false);
    }, 1000);
  };

  const getStorageClassColor = (storageClass: string) => {
    switch (storageClass) {
      case "STANDARD":
        return "primary";
      case "STANDARD_IA":
        return "warning";
      case "GLACIER":
        return "info";
      case "DEEP_ARCHIVE":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <div className="page-wrapper">
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs>
          <Link component="button" variant="body2" onClick={() => navigate("/platform/s3")} sx={{ cursor: "pointer", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
            S3 Buckets
          </Link>
          <Typography color="textPrimary">{bucketName}</Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => navigate("/platform/s3")} sx={{ background: "linear-gradient(135deg, #ff9900 0%, #ffc266 100%)", color: "white", width: 48, height: 48, "&:hover": { background: "linear-gradient(135deg, #e68900 0%, #ffb84d 100%)" } }}>
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ width: 56, height: 56, background: "linear-gradient(135deg, #ff9900 0%, #ffc266 100%)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: "0 4px 16px rgba(255, 153, 0, 0.3)" }}>
              <FolderIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#232f3e", letterSpacing: "-0.5px" }}>
                {bucketName}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6c757d", mt: 0.5 }}>
                {loading ? "Loading..." : "Browse and manage bucket objects and configurations"}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleRefresh} disabled={refreshing || loading} sx={{ background: "linear-gradient(135deg, #ff9900 0%, #ffc266 100%)", color: "white", width: 48, height: 48, "&:hover": { background: "linear-gradient(135deg, #e68900 0%, #ffb84d 100%)", transform: "rotate(180deg)" }, transition: "all 0.3s ease", "&.Mui-disabled": { background: "linear-gradient(135deg, #ff9900 0%, #ffc266 100%)", color: "white", opacity: 0.7 } }}>
            {refreshing || loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : <RefreshIcon />}
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: "#ffebee", border: "1px solid #ef5350", borderRadius: "8px" }}>
          <Typography sx={{ color: "#c62828", fontWeight: 600, mb: 1 }}>⚠️ Error Loading Data</Typography>
          <Typography sx={{ color: "#d32f2f", fontSize: "14px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {error}
          </Typography>
        </Box>
      )}

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Objects" />
          <Tab label="Configuration" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Objects
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#ff9900" }}>
                      {objects.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: "linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)" }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Size
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
                      {new Set(objects.map((o) => o.storageClass)).size}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField fullWidth placeholder="Search objects..." value={searchText} onChange={(e) => setSearchText(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#ff9900" }} /></InputAdornment> }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", backgroundColor: "#f5f5f5", "& fieldset": { borderColor: "#e0e0e0" }, "&:hover fieldset": { borderColor: "#ff9900" } } }} />
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#232f3e" }}>Object Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#232f3e" }} align="right">Size</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#232f3e" }}>Storage Class</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#232f3e" }}>Last Modified</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#232f3e" }}>ETag</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredObjects.length > 0 ? (
                  filteredObjects.slice(0, displayedItems).map((obj, idx) => (
                    <TableRow key={idx} sx={{ "&:hover": { backgroundColor: "#f9f9f9" }, cursor: "pointer" }}>
                      <TableCell sx={{ fontFamily: "monospace", fontSize: "0.85rem", wordBreak: "break-all" }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {obj.isFolder ? <FolderIcon sx={{ color: "#ff9900" }} /> : <DescriptionIcon sx={{ color: "#0073bb" }} />}
                          {obj.name}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatBytes(obj.size)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={obj.storageClass} size="small" color={getStorageClassColor(obj.storageClass) as any} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {obj.lastModified.toLocaleDateString()} {obj.lastModified.toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {obj.etag}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      {loading ? (
                        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                          <CircularProgress size={40} />
                          <Typography color="textSecondary">Loading objects...</Typography>
                        </Box>
                      ) : (
                        <Typography color="textSecondary">No objects found</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, p: 2, background: "#f5f5f5", borderRadius: "8px" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="textSecondary">
                Showing {Math.min(displayedItems, filteredObjects.length)} of {filteredObjects.length} objects{searchText && ` (filtered from "${searchText}")`}
              </Typography>
              {displayedItems < filteredObjects.length && (
                <Button
                  onClick={() => setDisplayedItems(prev => prev + itemsPerPage)}
                  variant="contained"
                  sx={{ backgroundColor: "#ff9900", color: "white", "&:hover": { backgroundColor: "#e68a00" } }}
                >
                  Load More ({filteredObjects.length - displayedItems} remaining)
                </Button>
              )}
            </Box>
          </Box>
        </>
      )}

      {tabValue === 1 && (
        <Box>
          {loading ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={5}>
              <CircularProgress size={50} />
              <Typography sx={{ mt: 2, color: "#666" }}>Loading configuration...</Typography>
            </Box>
          ) : Object.keys(configuration).length === 0 ? (
            <Box sx={{ p: 3, backgroundColor: "#fff3cd", border: "1px solid #ffc107", borderRadius: "8px", textAlign: "center" }}>
              <Typography sx={{ color: "#856404", fontWeight: 600 }}>ℹ️ No Configuration Data</Typography>
              <Typography sx={{ color: "#856404", fontSize: "14px", mt: 1 }}>
                Configuration data could not be retrieved. Check error messages above.
              </Typography>
            </Box>
          ) : (
          <Grid container spacing={3}>
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
                        label={configuration.versioning?.Status ? `${configuration.versioning.Status}` : "Disabled"} 
                        color="primary" 
                        size="small" 
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Encryption
                      </Typography>
                      <Chip 
                        label={Array.isArray(configuration.encryption) && configuration.encryption.length > 0 ? "Enabled" : "Disabled"} 
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
                        label={configuration.publicAccess?.BlockPublicAcls ? "Blocked" : "Allowed"} 
                        color={configuration.publicAccess?.BlockPublicAcls ? "success" : "error"} 
                        size="small" 
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

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
                  <Box sx={{ background: "#1e1e1e", p: 2, borderRadius: 1, border: "1px solid #444", fontFamily: "monospace", fontSize: "0.85rem", maxHeight: "400px", overflowY: "auto", lineHeight: "1.5" }}>
                    <Typography variant="body2" sx={{ color: "#d4d4d4", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {typeof configuration.policy === 'object' 
                        ? JSON.stringify(configuration.policy, null, 2) 
                        : (configuration.policy || JSON.stringify({ Version: "2012-10-17", Statement: [] }, null, 2))}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} mb={2}>
                    Encryption Configuration
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  {configuration.encryption && Array.isArray(configuration.encryption) && configuration.encryption.length > 0 ? (
                    <Box sx={{ background: "#1e1e1e", p: 2, borderRadius: 1, border: "1px solid #444", fontFamily: "monospace", fontSize: "0.85rem", maxHeight: "300px", overflowY: "auto" }}>
                      <Typography variant="body2" sx={{ color: "#d4d4d4", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {JSON.stringify(configuration.encryption, null, 2)}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography color="textSecondary">No encryption configuration</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} mb={2}>
                    ACL Details
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  {configuration.acl ? (
                    <Box sx={{ background: "#1e1e1e", p: 2, borderRadius: 1, border: "1px solid #444", fontFamily: "monospace", fontSize: "0.85rem", maxHeight: "300px", overflowY: "auto" }}>
                      <Typography variant="body2" sx={{ color: "#d4d4d4", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {JSON.stringify(configuration.acl, null, 2)}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography color="textSecondary">No ACL configuration</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} mb={2}>
                    Public Access Block
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  {configuration.publicAccess ? (
                    <Box sx={{ background: "#1e1e1e", p: 2, borderRadius: 1, border: "1px solid #444", fontFamily: "monospace", fontSize: "0.85rem", maxHeight: "300px", overflowY: "auto" }}>
                      <Typography variant="body2" sx={{ color: "#d4d4d4", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {JSON.stringify(configuration.publicAccess, null, 2)}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography color="textSecondary">No public access block configuration</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} mb={2}>
                    CORS Configuration
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  {configuration.cors && configuration.cors.length > 0 ? (
                    configuration.cors.map((rule: any, idx: number) => (
                      <Box key={idx} sx={{ mb: 2, p: 2, background: "#f5f5f5", borderRadius: 1 }}>
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
                          <Typography variant="body2">{JSON.stringify(rule)}</Typography>
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
