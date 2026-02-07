import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoadingContext } from "../../../context/context";
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
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import StorageIcon from "@mui/icons-material/Storage";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";
import SecurityIcon from "@mui/icons-material/Security";
import SettingsIcon from "@mui/icons-material/Settings";
import BackupIcon from "@mui/icons-material/Backup";
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

export default function RDSInstanceDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loading, setLoading }: any = useContext(LoadingContext);

  const [instance, setInstance] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const instanceData = location.state?.instance;
    if (!instanceData) {
      navigate("/platform/rds");
      return;
    }
    setInstance(instanceData);
  }, [location, navigate]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
    toast.success("Database instance data refreshed");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status?.toLowerCase();
    if (lowerStatus === "available") return "success";
    if (lowerStatus === "deleting" || lowerStatus === "failed") return "error";
    if (lowerStatus === "creating" || lowerStatus === "modifying" || lowerStatus === "backing-up") return "warning";
    return "default";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  if (!instance) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  const dbArn = `arn:aws:rds:${instance.region || "us-east-1"}:${instance.accountId || "000000000000"}:db:${
    instance.instanceId
  }`;

  return (
    <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh", pb: 4 }}>
      {/* Header */}
      <Box sx={{ bgcolor: "white", borderBottom: "1px solid #e0e0e0", px: 3, py: 2 }}>
        <Breadcrumbs sx={{ mb: 1 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate("/platform/rds")}
            sx={{ color: "#0073bb", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            RDS Databases
          </Link>
          <Typography color="text.primary" fontWeight={500}>
            {instance.instanceId}
          </Typography>
        </Breadcrumbs>

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                background: "linear-gradient(135deg, #527FFF 0%, #3B5EE6 100%)",
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
                {instance.dbName || instance.instanceId}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                <Chip
                  label={instance.status}
                  color={getStatusColor(instance.status)}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {instance.engine} {instance.engineVersion}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box display="flex" gap={1}>
            <IconButton
              onClick={() => navigate("/platform/rds")}
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
            <Tab label="Configuration" />
            <Tab label="Connectivity & Security" />
            <Tab label="Monitoring" />
            <Tab label="Backups" />
            <Tab label="Maintenance" />
            <Tab label="Tags" />
          </Tabs>

          {/* Configuration Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ px: 2, pb: 2, maxWidth: "1000px" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Database Summary */}
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <InfoIcon sx={{ color: "#0073bb" }} />
                      <Typography variant="h6" fontWeight={600}>
                        Database Instance Summary
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, width: "40%" }}>DB Instance Identifier</TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                                    {instance.instanceId}
                                  </Typography>
                                  <IconButton size="small" onClick={() => copyToClipboard(instance.instanceId)}>
                                    <ContentCopyIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                              <TableCell>
                                <Chip label={instance.status} color={getStatusColor(instance.status)} size="small" />
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Engine</TableCell>
                              <TableCell>{instance.engine || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Engine Version</TableCell>
                              <TableCell>{instance.engineVersion || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>DB Instance Class</TableCell>
                              <TableCell>
                                <Chip label={instance.instanceClass || "N/A"} size="small" variant="outlined" />
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, width: "40%" }}>Availability Zone</TableCell>
                              <TableCell>{instance.availabilityZone || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Multi-AZ</TableCell>
                              <TableCell>
                                <Chip
                                  label={instance.multiAZ ? "Yes" : "No"}
                                  color={instance.multiAZ ? "success" : "default"}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Created Time</TableCell>
                              <TableCell>{formatDate(instance.instanceCreateTime)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Master Username</TableCell>
                              <TableCell>{instance.masterUsername || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Region</TableCell>
                              <TableCell>{instance.region || "N/A"}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Database ARN */}
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <InfoIcon sx={{ color: "#0073bb" }} />
                      <Typography variant="h6" fontWeight={600}>
                        Database ARN
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace", bgcolor: "#f5f7fa", p: 1, borderRadius: 1, flex: 1 }}
                      >
                        {dbArn}
                      </Typography>
                      <IconButton size="small" onClick={() => copyToClipboard(dbArn)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>

                {/* Storage Configuration */}
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <StorageIcon sx={{ color: "#0073bb" }} />
                      <Typography variant="h6" fontWeight={600}>
                        Storage Configuration
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: "30%" }}>Allocated Storage</TableCell>
                          <TableCell>{instance.allocatedStorage ? `${instance.allocatedStorage} GB` : "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Storage Type</TableCell>
                          <TableCell>{instance.storageType || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Storage Encrypted</TableCell>
                          <TableCell>
                            <Chip
                              label={instance.storageEncrypted ? "Yes" : "No"}
                              color={instance.storageEncrypted ? "success" : "default"}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>IOPS</TableCell>
                          <TableCell>{instance.iops || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Storage Throughput</TableCell>
                          <TableCell>
                            {instance.storageThroughput ? `${instance.storageThroughput} MB/s` : "N/A"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Performance Insights */}
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <SettingsIcon sx={{ color: "#0073bb" }} />
                      <Typography variant="h6" fontWeight={600}>
                        Performance Insights
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: "30%" }}>Performance Insights</TableCell>
                          <TableCell>
                            <Chip
                              label={instance.performanceInsightsEnabled ? "Enabled" : "Disabled"}
                              color={instance.performanceInsightsEnabled ? "success" : "default"}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Enhanced Monitoring</TableCell>
                          <TableCell>
                            <Chip
                              label={instance.enhancedMonitoringResourceArn ? "Enabled" : "Disabled"}
                              color={instance.enhancedMonitoringResourceArn ? "success" : "default"}
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

          {/* Connectivity & Security Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ px: 2, pb: 2, maxWidth: "1000px" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Endpoint & Port */}
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <NetworkCheckIcon sx={{ color: "#0073bb" }} />
                      <Typography variant="h6" fontWeight={600}>
                        Endpoint & Port
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: "30%" }}>Endpoint</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography
                                variant="body2"
                                sx={{ fontFamily: "monospace", fontSize: "12px", wordBreak: "break-all" }}
                              >
                                {instance.endpoint || "N/A"}
                              </Typography>
                              {instance.endpoint && (
                                <IconButton size="small" onClick={() => copyToClipboard(instance.endpoint)}>
                                  <ContentCopyIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Port</TableCell>
                          <TableCell>{instance.port || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Publicly Accessible</TableCell>
                          <TableCell>
                            <Chip
                              label={instance.publiclyAccessible ? "Yes" : "No"}
                              color={instance.publiclyAccessible ? "warning" : "success"}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* VPC & Subnets */}
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <NetworkCheckIcon sx={{ color: "#0073bb" }} />
                      <Typography variant="h6" fontWeight={600}>
                        VPC & Subnets
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: "30%" }}>VPC ID</TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "12px" }}>
                            {instance.vpcId || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Subnet Group</TableCell>
                          <TableCell>{instance.dbSubnetGroup || "N/A"}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Security Groups */}
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <SecurityIcon sx={{ color: "#0073bb" }} />
                      <Typography variant="h6" fontWeight={600}>
                        Security Groups
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {instance.vpcSecurityGroups && instance.vpcSecurityGroups.length > 0 ? (
                      <List dense>
                        {instance.vpcSecurityGroups.map((sg: any, idx: number) => (
                          <ListItem key={idx} sx={{ bgcolor: "#f5f7fa", mb: 1, borderRadius: 1 }}>
                            <ListItemText
                              primary={sg.vpcSecurityGroupId || `Security Group ${idx + 1}`}
                              secondary={`Status: ${sg.status || "active"}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No security groups configured
                      </Typography>
                    )}
                  </CardContent>
                </Card>

                {/* Encryption */}
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <SecurityIcon sx={{ color: "#0073bb" }} />
                      <Typography variant="h6" fontWeight={600}>
                        Encryption
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: "30%" }}>Storage Encrypted</TableCell>
                          <TableCell>
                            <Chip
                              label={instance.storageEncrypted ? "Yes" : "No"}
                              color={instance.storageEncrypted ? "success" : "default"}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>KMS Key ID</TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "11px", wordBreak: "break-all" }}>
                            {instance.kmsKeyId || "N/A"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Box>
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
                    Database metrics including CPU, memory, connections, and IOPS are available in CloudWatch. Connect
                    to CloudWatch for real-time monitoring and Performance Insights.
                  </Alert>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, width: "30%" }}>Database Status</TableCell>
                        <TableCell>
                          <Chip label={instance.status} color={getStatusColor(instance.status)} size="small" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Enhanced Monitoring</TableCell>
                        <TableCell>
                          <Chip
                            label={instance.enhancedMonitoringResourceArn ? "Enabled" : "Disabled"}
                            color={instance.enhancedMonitoringResourceArn ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Performance Insights</TableCell>
                        <TableCell>
                          <Chip
                            label={instance.performanceInsightsEnabled ? "Enabled" : "Disabled"}
                            color={instance.performanceInsightsEnabled ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>

          {/* Backups Tab */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ px: 2, pb: 2, maxWidth: "1000px" }}>
              <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <BackupIcon sx={{ color: "#0073bb" }} />
                    <Typography variant="h6" fontWeight={600}>
                      Automated Backups
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, width: "30%" }}>Backup Retention Period</TableCell>
                        <TableCell>
                          {instance.backupRetentionPeriod ? `${instance.backupRetentionPeriod} days` : "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Preferred Backup Window</TableCell>
                        <TableCell>{instance.preferredBackupWindow || "N/A"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Latest Restorable Time</TableCell>
                        <TableCell>{formatDate(instance.latestRestorableTime)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Copy Tags to Snapshots</TableCell>
                        <TableCell>
                          <Chip
                            label={instance.copyTagsToSnapshot ? "Yes" : "No"}
                            color={instance.copyTagsToSnapshot ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>

          {/* Maintenance Tab */}
          <TabPanel value={tabValue} index={4}>
            <Box sx={{ px: 2, pb: 2, maxWidth: "1000px" }}>
              <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <SettingsIcon sx={{ color: "#0073bb" }} />
                    <Typography variant="h6" fontWeight={600}>
                      Maintenance & Updates
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, width: "30%" }}>Preferred Maintenance Window</TableCell>
                        <TableCell>{instance.preferredMaintenanceWindow || "N/A"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Auto Minor Version Upgrade</TableCell>
                        <TableCell>
                          <Chip
                            label={instance.autoMinorVersionUpgrade ? "Enabled" : "Disabled"}
                            color={instance.autoMinorVersionUpgrade ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Deletion Protection</TableCell>
                        <TableCell>
                          <Chip
                            label={instance.deletionProtection ? "Enabled" : "Disabled"}
                            color={instance.deletionProtection ? "success" : "warning"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>CA Certificate Identifier</TableCell>
                        <TableCell>{instance.caCertificateIdentifier || "N/A"}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>

          {/* Tags Tab */}
          <TabPanel value={tabValue} index={5}>
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
                  {instance.tags && instance.tags.length > 0 ? (
                    <Table size="small">
                      <TableBody>
                        {instance.tags.map((tag: any, idx: number) => (
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
