import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SelectedRegionContext, SelectedAccountContext } from "../../../context/context";
import { AdminService } from "../../../services/admin.service";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Breadcrumbs,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Checkbox,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import GetAppIcon from "@mui/icons-material/GetApp";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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
  bucketName?: string;
  versioning?: any;
  encryption?: any;
  cors?: any[];
  lifecycle?: any[];
  policy?: any;
  acl?: any;
  publicAccess?: any;
}

export default function S3ObjectsNew() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedRegion }: any = useContext(SelectedRegionContext);
  const { selectedAccount }: any = useContext(SelectedAccountContext);

  const [bucketName, setBucketName] = useState<string>("");
  const [objects, setObjects] = useState<S3Object[]>([]);
  const [filteredObjects, setFilteredObjects] = useState<S3Object[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [configuration, setConfiguration] = useState<BucketConfiguration>({});
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string>("");
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [displayedItems, setDisplayedItems] = useState(100);
  const [itemsPerPage] = useState(100);

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

    setLoading(true);
    setError("");

    try {
      const credsRes = await AdminService.getCredentialsByAccountAndRegion(
        selectedAccount.value,
        selectedRegion.value
      );

      if (credsRes.status === 200 && credsRes.data._id) {
        const credentialsId = credsRes.data._id;

        try {
          const objectsRes = await AdminService.getS3Objects(credentialsId, bucket, selectedRegion.value);
          let objectsData = [];

          if (Array.isArray(objectsRes)) {
            objectsData = objectsRes;
          } else if (objectsRes?.data && Array.isArray(objectsRes.data)) {
            objectsData = objectsRes.data;
          } else if (objectsRes?.data?.data && Array.isArray(objectsRes.data.data)) {
            objectsData = objectsRes.data.data;
          } else if (objectsRes?.data?.status === 200 && Array.isArray(objectsRes?.data?.data)) {
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
          } else if (Array.isArray(objectsData) && objectsData.length === 0) {
            setError("Bucket is empty - no objects found");
            setObjects([]);
            setFilteredObjects([]);
          }
        } catch (objectsError: any) {
          console.error("Error fetching S3 objects:", objectsError);
          setError("Failed to fetch objects: " + (objectsError?.response?.data?.error || objectsError?.message));
          setObjects([]);
          setFilteredObjects([]);
        }

        try {
          const configRes = await AdminService.getS3BucketConfiguration(credentialsId, bucket, selectedRegion.value);
          let configData = null;

          if (configRes?.data && typeof configRes.data === 'object' && !Array.isArray(configRes.data)) {
            if (configRes.data.status === 200 && configRes.data.data) {
              configData = configRes.data.data;
            } else if (!configRes.data.status) {
              configData = configRes.data;
            }
          }

          if (configData) {
            setConfiguration(configData);
          }
        } catch (configError: any) {
          console.error("Error fetching configuration:", configError);
          setConfiguration({});
        }
      } else {
        setError("Failed to get credentials");
      }
    } catch (error: any) {
      console.error("Error in fetchBucketData:", error);
      setError("Error: " + (error?.message || error));
    }

    setLoading(false);
  };

  useEffect(() => {
    if (searchText) {
      const filtered = objects.filter((obj) => obj.name.toLowerCase().includes(searchText.toLowerCase()));
      setFilteredObjects(filtered);
    } else {
      setFilteredObjects(objects);
    }
  }, [searchText, objects]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(k));
    const value = bytes / Math.pow(k, i);
    return (Math.round(value * 100) / 100).toFixed(2) + " " + sizes[Math.min(i, sizes.length - 1)];
  };

  const getStorageClassColor = (storageClass: string) => {
    const colorMap: Record<string, string> = {
      STANDARD: "#2e7d32",
      STANDARD_IA: "#1976d2",
      GLACIER: "#0288d1",
      GLACIER_IR: "#0288d1",
      DEEP_ARCHIVE: "#7b1fa2",
    };
    return colorMap[storageClass] || "#757575";
  };

  const handleSelectAll = (event: any) => {
    if (event.target.checked) {
      setSelectedObjects(filteredObjects.map((obj) => obj.name));
    } else {
      setSelectedObjects([]);
    }
  };

  const handleSelectObject = (name: string) => {
    if (selectedObjects.includes(name)) {
      setSelectedObjects(selectedObjects.filter((obj) => obj !== name));
    } else {
      setSelectedObjects([...selectedObjects, name]);
    }
  };

  return (
    <div className="page-wrapper" style={{ padding: "24px" }}>
      <style>{`
        .aws-console-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          gap: 16px;
        }
        .aws-tabs {
          border-bottom: 1px solid #e0e0e0;
          margin-bottom: 24px;
        }
        .aws-tabs .MuiTab-root {
          text-transform: none;
          font-weight: 500;
          color: #666;
          padding: 12px 24px;
        }
        .aws-tabs .MuiTab-root.Mui-selected {
          color: #ff9900;
          border-bottom: 2px solid #ff9900;
        }
        .table-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          gap: 16px;
        }
        .search-input {
          flex: 1;
          max-width: 500px;
        }
        .aws-table {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 0;
        }
        .aws-table thead th {
          background-color: #f5f5f5;
          color: #333;
          font-weight: 600;
          padding: 12px 16px;
          border-bottom: 2px solid #e0e0e0;
        }
        .aws-table tbody td {
          padding: 12px 16px;
          border-bottom: 1px solid #e0e0e0;
        }
        .aws-table tbody tr:hover {
          background-color: #f9f9f9;
        }
      `}</style>

      {/* Header Section */}
      <Box className="aws-console-header">
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton
            onClick={() => navigate("/platform/s3")}
            sx={{ color: "#ff9900" }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Breadcrumbs>
              <Link
                component="button"
                onClick={() => navigate("/platform/s3")}
                sx={{ cursor: "pointer", color: "#0073bb", textDecoration: "none" }}
              >
                S3 Buckets
              </Link>
              <Typography color="textPrimary">{bucketName}</Typography>
            </Breadcrumbs>
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#232f3e", mt: 1 }}>
              {bucketName}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchBucketData(bucketName)}
            disabled={loading}
            sx={{ color: "#ff9900", borderColor: "#ff9900" }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{ color: "#ff9900", borderColor: "#ff9900" }}
          >
            Download
          </Button>
        </Box>
      </Box>

      {/* Error Display */}
      {error && (
        <Box sx={{ mb: 2, p: 2, backgroundColor: "#ffebee", border: "1px solid #ef5350", borderRadius: "4px" }}>
          <Typography sx={{ color: "#c62828", fontWeight: 600 }}>⚠️ {error}</Typography>
        </Box>
      )}

      {/* Tabs */}
      <Box className="aws-tabs">
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Objects" />
          <Tab label="Properties" />
          <Tab label="Permissions" />
          <Tab label="Metrics" />
        </Tabs>
      </Box>

      {/* Objects Tab */}
      {tabValue === 0 && (
        <Box>
          {loading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Stats */}
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2, mb: 3 }}>
                <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
                  <Typography color="textSecondary" variant="body2">Total Objects</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#ff9900" }}>
                    {objects.length.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
                  <Typography color="textSecondary" variant="body2">Total Size</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#ff9900" }}>
                    {formatBytes(totalSize)}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
                  <Typography color="textSecondary" variant="body2">Average Size</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#ff9900" }}>
                    {formatBytes(objects.length > 0 ? totalSize / objects.length : 0)}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
                  <Typography color="textSecondary" variant="body2">Storage Classes</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#ff9900" }}>
                    {new Set(objects.map((o) => o.storageClass)).size}
                  </Typography>
                </Box>
              </Box>

              {/* Toolbar */}
              <Box className="table-toolbar">
                <TextField
                  placeholder="Search objects..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#999" }} />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                  className="search-input"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "4px",
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                />
                <Typography variant="body2" color="textSecondary">
                  {selectedObjects.length > 0 && `${selectedObjects.length} selected`}
                </Typography>
              </Box>

              {/* Table */}
              <TableContainer className="aws-table" component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ width: "50px" }}>
                        <Checkbox
                          checked={selectedObjects.length === filteredObjects.length && filteredObjects.length > 0}
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      <TableCell>Object Name</TableCell>
                      <TableCell align="right">Size</TableCell>
                      <TableCell>Storage Class</TableCell>
                      <TableCell>Last Modified</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredObjects.length > 0 ? (
                      filteredObjects.slice(0, displayedItems).map((obj, idx) => (
                        <TableRow key={idx} sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}>
                          <TableCell>
                            <Checkbox
                              checked={selectedObjects.includes(obj.name)}
                              onChange={() => handleSelectObject(obj.name)}
                            />
                          </TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "0.9rem", wordBreak: "break-all" }}>
                            {obj.name}
                          </TableCell>
                          <TableCell align="right">{formatBytes(obj.size)}</TableCell>
                          <TableCell>
                            <Chip
                              label={obj.storageClass}
                              size="small"
                              sx={{
                                backgroundColor: getStorageClassColor(obj.storageClass),
                                color: "white",
                                fontWeight: 500,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.9rem" }}>
                            {obj.lastModified.toLocaleDateString()} {obj.lastModified.toLocaleTimeString()}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small">
                              <MoreVertIcon sx={{ fontSize: "1.2rem" }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography color="textSecondary">No objects found</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {displayedItems < filteredObjects.length && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button
                    onClick={() => setDisplayedItems((prev) => prev + itemsPerPage)}
                    variant="outlined"
                    sx={{ color: "#ff9900", borderColor: "#ff9900" }}
                  >
                    Load More ({filteredObjects.length - displayedItems} remaining)
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {/* Properties Tab */}
      {tabValue === 1 && (
        <Box>
          {loading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 3 }}>
                {/* Versioning */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Versioning</Typography>
                  <Typography color="textSecondary">
                    {configuration.versioning?.Status || "Disabled"}
                  </Typography>
                </Box>

                {/* Encryption */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Encryption</Typography>
                  <Typography color="textSecondary">
                    {Array.isArray(configuration.encryption) && configuration.encryption.length > 0
                      ? "Enabled"
                      : "Disabled"}
                  </Typography>
                </Box>

                {/* Public Access */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Public Access</Typography>
                  <Typography color="textSecondary">
                    {configuration.publicAccess?.BlockPublicAcls ? "Blocked" : "Allowed"}
                  </Typography>
                </Box>
              </Box>

              {/* Bucket Policy */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Bucket Policy</Typography>
                <Box
                  sx={{
                    backgroundColor: "#1e1e1e",
                    p: 2,
                    borderRadius: "4px",
                    fontFamily: "monospace",
                    fontSize: "0.85rem",
                    color: "#d4d4d4",
                    maxHeight: "400px",
                    overflowY: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {typeof configuration.policy === "object"
                    ? JSON.stringify(configuration.policy, null, 2)
                    : configuration.policy || "{}"}
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {/* Permissions Tab */}
      {tabValue === 2 && (
        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Permissions & Access Control</Typography>
            <Box sx={{ backgroundColor: "#f5f5f5", p: 2, borderRadius: "4px" }}>
              <Typography color="textSecondary">ACL Details:</Typography>
              <Box sx={{ mt: 2, fontFamily: "monospace", fontSize: "0.85rem" }}>
                {configuration.acl ? JSON.stringify(configuration.acl, null, 2) : "No ACL configured"}
              </Box>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Metrics Tab */}
      {tabValue === 3 && (
        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Bucket Metrics</Typography>
            <Typography color="textSecondary">Metrics feature coming soon...</Typography>
          </Paper>
        </Box>
      )}
    </div>
  );
}
