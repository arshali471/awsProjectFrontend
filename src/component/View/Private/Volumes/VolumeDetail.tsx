import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoadingContext } from "../../../context/context";
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
  Divider,
  Tabs,
  Tab,
  Chip,
  Table,
  TableBody,
  TableRow,
  TableCell,
  List,
  ListItem,
  ListItemText,
  Paper,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import StorageIcon from "@mui/icons-material/Storage";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import LabelIcon from "@mui/icons-material/Label";
import InfoIcon from "@mui/icons-material/Info";
import toast from "react-hot-toast";
import "../SharedPage.css";

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

export default function VolumeDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loading, setLoading }: any = useContext(LoadingContext);

  const [volume, setVolume] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [loadingSnapshots, setLoadingSnapshots] = useState(false);

  useEffect(() => {
    const volumeData = location.state?.volume;
    if (!volumeData) {
      navigate("/platform/volumes");
      return;
    }
    
    // Check if we need to fetch full volume details
    // If volumeType is missing, we have incomplete data from BlockDeviceMapping
    const needsFullData = !volumeData.volumeType && !volumeData.VolumeType;
    
    if (needsFullData) {
      console.log("Fetching full volume details for:", volumeData.volumeId || volumeData.VolumeId);
      fetchVolumeDetails(volumeData);
    } else {
      setVolume(volumeData);
    }
  }, [location, navigate]);

  // Fetch snapshots when tab changes to snapshots tab
  useEffect(() => {
    if (tabValue === 1 && volume && snapshots.length === 0) {
      fetchSnapshots();
    }
  }, [tabValue, volume]);

  const fetchVolumeDetails = async (partialVolume: any) => {
    try {
      setLoading(true);
      
      console.log("=== Fetching Volume Details ===");
      console.log("Partial volume data:", partialVolume);
      
      const volumeId = partialVolume.volumeId || partialVolume.VolumeId;
      const region = partialVolume.region || partialVolume.Region;
      const environment = partialVolume.environment || partialVolume.Environment;
      
      console.log("Extracted values:");
      console.log("  - Volume ID:", volumeId);
      console.log("  - Region:", region);
      console.log("  - Environment:", environment);
      
      if (!volumeId || !region || !environment) {
        console.error("Missing required data:", { volumeId, region, environment });
        console.error("Full partial volume object:", JSON.stringify(partialVolume, null, 2));
        toast.error("Missing required volume information (Region or Environment)");
        setVolume(partialVolume); // Use partial data anyway
        return;
      }

      console.log("Getting credentials for:", environment, region);
      
      // Get credentials for this account and region
      const credsRes = await AdminService.getCredentialsByAccountAndRegion(
        environment,
        region
      );

      console.log("Credentials response:", credsRes);

      if (!credsRes?.data?.id && !credsRes?.data?._id) {
        console.error("No credentials found in response");
        console.error("Response data:", credsRes?.data);
        toast.error("Failed to get credentials");
        setVolume(partialVolume); // Use partial data anyway
        return;
      }

      const credentialsId = credsRes.data.id || credsRes.data._id;
      console.log("Using credentials ID:", credentialsId);

      // Fetch full volume details
      const response = await AdminService.getVolumeById(
        volumeId,
        credentialsId,
        region
      );

      console.log("Volume details response:", response);

      if (response?.data) {
        console.log("Full volume data received:", response.data);
        setVolume(response.data);
      } else {
        console.error("No volume data in response");
        setVolume(partialVolume); // Use partial data anyway
      }
    } catch (error) {
      console.error("Error fetching volume details:", error);
      toast.error("Failed to fetch full volume details");
      setVolume(partialVolume); // Use partial data anyway
    } finally {
      setLoading(false);
    }
  };

  const fetchSnapshots = async () => {
    try {
      setLoadingSnapshots(true);
      
      const volumeId = volume.volumeId || volume.VolumeId;
      const region = volume.region || volume.Region;
      const environment = volume.environment || volume.Environment;
      
      console.log("=== Fetching Snapshots ===");
      console.log("Volume ID:", volumeId);
      console.log("Region:", region);
      console.log("Environment:", environment);
      
      if (!volumeId || !region || !environment) {
        console.error("Missing required data for fetching snapshots");
        toast.error("Cannot fetch snapshots - missing volume information");
        return;
      }

      // Get credentials for this account and region
      const credsRes = await AdminService.getCredentialsByAccountAndRegion(
        environment,
        region
      );

      if (!credsRes?.data?.id && !credsRes?.data?._id) {
        console.error("No credentials found for fetching snapshots");
        toast.error("Failed to get credentials");
        return;
      }

      const credentialsId = credsRes.data.id || credsRes.data._id;
      console.log("Using credentials ID:", credentialsId);

      // Fetch snapshots
      const response = await AdminService.getSnapshotsByVolumeId(
        volumeId,
        credentialsId,
        region
      );

      console.log("Snapshots response:", response);

      if (response?.data) {
        console.log(`Found ${response.data.length} snapshots`);
        setSnapshots(response.data);
      } else {
        setSnapshots([]);
      }
    } catch (error) {
      console.error("Error fetching snapshots:", error);
      toast.error("Failed to fetch snapshots");
      setSnapshots([]);
    } finally {
      setLoadingSnapshots(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
    toast.success("Volume data refreshed");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getStateColor = (state: string) => {
    const lowerState = state?.toLowerCase();
    if (lowerState === "in-use" || lowerState === "available") return "success";
    if (lowerState === "deleting" || lowerState === "error") return "error";
    if (lowerState === "creating") return "warning";
    return "default";
  };

  const formatBytes = (bytes: number | string) => {
    // Handle string format like "25 GB" from the list page
    if (typeof bytes === 'string') {
      return bytes; // Already formatted
    }
    // Handle number format from API
    if (!bytes || bytes === 0) return "0 GB";
    return `${bytes} GB`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  if (!volume) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  const volumeArn = `arn:aws:ec2:${volume.region || "us-east-1"}:${volume.accountId || "000000000000"}:volume/${
    volume.volumeId
  }`;

  return (
    <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh", pb: 4 }}>
      {/* Header */}
      <Box sx={{ bgcolor: "white", borderBottom: "1px solid #e0e0e0", px: 3, py: 2 }}>
        <Breadcrumbs sx={{ mb: 1 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate("/platform/volumes")}
            sx={{ color: "#0073bb", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            Volumes
          </Link>
          <Typography color="text.primary" fontWeight={500}>
            {volume.volumeId}
          </Typography>
        </Breadcrumbs>

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                background: "linear-gradient(135deg, #ff9900 0%, #ff6f00 100%)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <StorageIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="#232f3e">
                {(volume.name && volume.name !== "N/A") ? volume.name : volume.volumeId}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                <Chip
                  label={volume.state}
                  color={getStateColor(volume.state)}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {volume.volumeType} • {formatBytes(volume.size)}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box display="flex" gap={1}>
            <IconButton
              onClick={() => navigate("/platform/volumes")}
              size="small"
              sx={{ border: "1px solid #d5dbdb", borderRadius: "8px", "&:hover": { bgcolor: "#f5f7fa" } }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              size="small"
              sx={{ border: "1px solid #d5dbdb", borderRadius: "8px", "&:hover": { bgcolor: "#f5f7fa" } }}
            >
              {refreshing ? <CircularProgress size={20} /> : <RefreshIcon fontSize="small" />}
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ px: 3, pt: 2 }}>
        <Paper elevation={0} sx={{ bgcolor: "white", borderRadius: "8px", overflow: "hidden" }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: "1px solid #e0e0e0",
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 500,
                fontSize: "14px",
                minHeight: "48px",
                color: "#545b64",
                "&.Mui-selected": { color: "#0073bb" },
              },
              "& .MuiTabs-indicator": { backgroundColor: "#0073bb", height: "3px" },
            }}
          >
            <Tab label="Details" />
            <Tab label="Snapshots" />
            <Tab label="Monitoring" />
            <Tab label="Tags" />
          </Tabs>

          {/* Details Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ px: 2, pb: 2, maxWidth: "1000px" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Volume Summary */}
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <InfoIcon sx={{ color: "#0073bb" }} />
                      <Typography variant="h6" fontWeight={600}>
                        Volume Summary
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: "30%" }}>Volume ID</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                                {volume.volumeId}
                              </Typography>
                              <IconButton size="small" onClick={() => copyToClipboard(volume.volumeId)}>
                                <ContentCopyIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Volume State</TableCell>
                          <TableCell>
                            <Chip label={volume.state} color={getStateColor(volume.state)} size="small" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                          <TableCell>{formatBytes(volume.size)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Volume Type</TableCell>
                          <TableCell>
                            <Chip label={volume.volumeType} size="small" variant="outlined" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>IOPS</TableCell>
                          <TableCell>{volume.iops || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Throughput</TableCell>
                          <TableCell>
                            {volume.throughput ? (
                              typeof volume.throughput === 'string' 
                                ? volume.throughput // Already formatted from list page
                                : `${volume.throughput} MB/s` // Format number from API
                            ) : "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Availability Zone</TableCell>
                          <TableCell>{volume.availabilityZone || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Created Time</TableCell>
                          <TableCell>{formatDate(volume.createTime || volume.CreateTime || volume.createdAt)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Volume ARN */}
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <InfoIcon sx={{ color: "#0073bb" }} />
                      <Typography variant="h6" fontWeight={600}>
                        Volume ARN
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace", bgcolor: "#f5f7fa", p: 1, borderRadius: 1, flex: 1 }}
                      >
                        {volumeArn}
                      </Typography>
                      <IconButton size="small" onClick={() => copyToClipboard(volumeArn)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>

                {/* Attachment Information */}
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <StorageIcon sx={{ color: "#0073bb" }} />
                      <Typography variant="h6" fontWeight={600}>
                        Attachment Information
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {volume.attachedInstances && volume.attachedInstances.length > 0 ? (
                      <>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          This volume is attached to the following instances:
                        </Typography>
                        <List dense>
                          {volume.attachedInstances.map((instanceId: string, idx: number) => (
                            <ListItem key={idx} sx={{ bgcolor: "#f5f7fa", mb: 1, borderRadius: 1 }}>
                              <ListItemText
                                primary={instanceId}
                                secondary={`Device: ${volume.device || "N/A"} • Attached: ${formatDate(
                                  volume.attachTime
                                )}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    ) : (
                      <Alert severity="info">This volume is not attached to any instances</Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Volume Configuration */}
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <InfoIcon sx={{ color: "#0073bb" }} />
                      <Typography variant="h6" fontWeight={600}>
                        Volume Configuration
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: "30%" }}>Encrypted</TableCell>
                          <TableCell>
                            <Chip
                              label={volume.encrypted ? "Yes" : "No"}
                              color={volume.encrypted ? "success" : "default"}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>KMS Key ID</TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "12px", wordBreak: "break-all" }}>
                            {volume.kmsKeyId || "Not encrypted"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Snapshot ID</TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "12px" }}>
                            {volume.snapshotId || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Delete on Termination</TableCell>
                          <TableCell>
                            <Chip
                              label={volume.deleteOnTermination ? "Yes" : "No"}
                              color={volume.deleteOnTermination ? "warning" : "default"}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Multi-Attach Enabled</TableCell>
                          <TableCell>
                            <Chip
                              label={volume.multiAttachEnabled ? "Yes" : "No"}
                              color={volume.multiAttachEnabled ? "info" : "default"}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </TabPanel>

          {/* Snapshots Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ px: 2, pb: 2, maxWidth: "1200px" }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <PhotoCameraIcon sx={{ color: "#0073bb" }} />
                  <Typography variant="h6" fontWeight={600}>
                    Snapshots ({snapshots.length})
                  </Typography>
                </Box>
                <IconButton
                  onClick={fetchSnapshots}
                  disabled={loadingSnapshots}
                  size="small"
                  sx={{ border: "1px solid #d5dbdb", borderRadius: "8px", "&:hover": { bgcolor: "#f5f7fa" } }}
                >
                  {loadingSnapshots ? <CircularProgress size={20} /> : <RefreshIcon fontSize="small" />}
                </IconButton>
              </Box>

              {loadingSnapshots ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : snapshots.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {snapshots.map((snapshot: any, index: number) => (
                    <Card key={index} elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <PhotoCameraIcon sx={{ color: "#0073bb", fontSize: 20 }} />
                            <Typography variant="subtitle1" fontWeight={600}>
                              {snapshot.snapshotId || snapshot.SnapshotId}
                            </Typography>
                          </Box>
                          <Chip
                            label={snapshot.state || snapshot.State}
                            color={(snapshot.state || snapshot.State) === "completed" ? "success" : "warning"}
                            size="small"
                            sx={{ fontWeight: 600, textTransform: "capitalize" }}
                          />
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, width: "25%", border: 0, py: 0.5 }}>Snapshot ID</TableCell>
                              <TableCell sx={{ border: 0, py: 0.5 }}>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "12px" }}>
                                    {snapshot.snapshotId || snapshot.SnapshotId}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={() => copyToClipboard(snapshot.snapshotId || snapshot.SnapshotId)}
                                  >
                                    <ContentCopyIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, border: 0, py: 0.5 }}>Description</TableCell>
                              <TableCell sx={{ border: 0, py: 0.5 }}>
                                {snapshot.description || snapshot.Description || "No description"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, border: 0, py: 0.5 }}>Started</TableCell>
                              <TableCell sx={{ border: 0, py: 0.5 }}>
                                {formatDate(snapshot.startTime || snapshot.StartTime)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, border: 0, py: 0.5 }}>Progress</TableCell>
                              <TableCell sx={{ border: 0, py: 0.5 }}>
                                {snapshot.progress || snapshot.Progress || "N/A"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, border: 0, py: 0.5 }}>Size</TableCell>
                              <TableCell sx={{ border: 0, py: 0.5 }}>
                                {(snapshot.volumeSize || snapshot.VolumeSize) ? `${snapshot.volumeSize || snapshot.VolumeSize} GB` : "N/A"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, border: 0, py: 0.5 }}>Encrypted</TableCell>
                              <TableCell sx={{ border: 0, py: 0.5 }}>
                                <Chip
                                  label={(snapshot.encrypted || snapshot.Encrypted) ? "Yes" : "No"}
                                  size="small"
                                  color={(snapshot.encrypted || snapshot.Encrypted) ? "success" : "default"}
                                  variant="outlined"
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, border: 0, py: 0.5 }}>Owner ID</TableCell>
                              <TableCell sx={{ border: 0, py: 0.5, fontFamily: "monospace", fontSize: "12px" }}>
                                {snapshot.ownerId || snapshot.OwnerId || "N/A"}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Alert severity="info">
                      No snapshots found for this volume. Create a snapshot to backup your data.
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </Box>
          </TabPanel>

          {/* Monitoring Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ px: 2, pb: 2, maxWidth: "1000px" }}>
              <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <MonitorHeartIcon sx={{ color: "#0073bb" }} />
                    <Typography variant="h6" fontWeight={600}>
                      CloudWatch Monitoring
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Volume metrics including read/write operations, throughput, and latency are available in CloudWatch.
                    Connect to CloudWatch for real-time monitoring.
                  </Alert>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, width: "30%" }}>Volume State</TableCell>
                        <TableCell>
                          <Chip label={volume.state} color={getStateColor(volume.state)} size="small" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Volume Type</TableCell>
                        <TableCell>{volume.volumeType}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>IOPS</TableCell>
                        <TableCell>{volume.iops || "N/A"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Throughput</TableCell>
                        <TableCell>{volume.throughput ? `${volume.throughput} MB/s` : "N/A"}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>

          {/* Tags Tab */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ px: 2, pb: 2, maxWidth: "1000px" }}>
              <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <LabelIcon sx={{ color: "#0073bb" }} />
                    <Typography variant="h6" fontWeight={600}>
                      Tags
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {volume.tags && volume.tags.length > 0 ? (
                    <Table size="small">
                      <TableBody>
                        {volume.tags.map((tag: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell sx={{ fontWeight: 600, width: "30%" }}>{tag.key || tag.Key}</TableCell>
                            <TableCell>{tag.value || tag.Value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No tags
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </Box>
  );
}
