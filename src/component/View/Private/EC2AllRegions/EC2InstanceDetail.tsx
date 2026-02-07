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
import ComputerIcon from "@mui/icons-material/Computer";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";
import StorageIcon from "@mui/icons-material/Storage";
import SecurityIcon from "@mui/icons-material/Security";
import LabelIcon from "@mui/icons-material/Label";
import InfoIcon from "@mui/icons-material/Info";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
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

export default function EC2InstanceDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loading, setLoading }: any = useContext(LoadingContext);
  
  // Detect if coming from EC2 Dashboard or EC2 Inventory
  const isFromDashboard = location.pathname.includes('/platform/ec2/instance');
  const backPath = isFromDashboard ? '/platform/ec2' : '/platform/ec2-all-regions';
  const breadcrumbText = isFromDashboard ? 'EC2' : 'EC2 Instances';

  const [instance, setInstance] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [fullDetails, setFullDetails] = useState<any>(null);

  useEffect(() => {
    const instanceData = location.state?.instance;
    if (!instanceData) {
      navigate(backPath);
      return;
    }
    
    console.log("Initial instance data from list:", instanceData);
    console.log("Initial BlockDeviceMappings:", instanceData.BlockDeviceMappings);
    console.log("Initial SecurityGroups:", instanceData.SecurityGroups);
    
    setInstance(instanceData);
    
    // Fetch full instance details from API
    fetchInstanceDetails(instanceData);
  }, [location, navigate]);

  const fetchInstanceDetails = async (instanceData: any) => {
    try {
      setRefreshing(true);
      
      console.log("=== Fetching Instance Details ===");
      console.log("Instance ID:", instanceData.InstanceId);
      console.log("Environment:", instanceData.Environment);
      console.log("Region:", instanceData.Region);
      
      if (!instanceData.Environment || !instanceData.Region) {
        console.error("Missing Environment or Region in instance data");
        toast.error("Missing account/region information");
        return;
      }
      
      // Get credentials for the account and region
      const credsRes = await AdminService.getCredentialsByAccountAndRegion(
        instanceData.Environment,
        instanceData.Region
      );
      
      console.log("Credentials Response:", credsRes);
      
      if (!credsRes?.data?._id) {
        console.error("Failed to get credentials");
        toast.error("Failed to get AWS credentials");
        return;
      }
      
      const credentialsId = credsRes.data._id;
      console.log("Credentials ID:", credentialsId);
      
      // Now fetch full instance details
      const response = await AdminService.getInstanceDetails(
        instanceData.InstanceId,
        credentialsId,
        instanceData.Region
      );
      
      console.log("=== Raw Response ===");
      console.log("Response type:", typeof response);
      console.log("Response.data exists:", !!response?.data);
      console.log("Full response:", response);
      
      // Handle both Axios response and direct data
      const instanceDetails = response?.data || response;
      
      console.log("=== Extracted Instance Details ===");
      console.log("Instance Details:", instanceDetails);
      console.log("SecurityGroups:", instanceDetails?.SecurityGroups);
      console.log("BlockDeviceMappings:", instanceDetails?.BlockDeviceMappings);
      console.log("NetworkInterfaces:", instanceDetails?.NetworkInterfaces);
      
      if (instanceDetails && instanceDetails.InstanceId) {
        setFullDetails(instanceDetails);
        
        // Extract name from tags
        const nameTag = instanceDetails.Tags?.find((tag: any) => tag.Key === "Name");
        const instanceName = nameTag?.Value || instanceData.InstanceName || instanceData.Name || "";
        
        // Build complete instance object
        const completeInstance = {
          ...instanceData, // Keep original data as fallback
          ...instanceDetails, // Override with full details from API
          Name: instanceName,
          InstanceName: instanceName,
          State: instanceDetails.State?.Name || instanceDetails.State || instanceData.State,
          SecurityGroups: instanceDetails.SecurityGroups || [],
          NetworkInterfaces: instanceDetails.NetworkInterfaces || [],
          BlockDeviceMappings: instanceDetails.BlockDeviceMappings || [],
          // Ensure Region and Environment are preserved from original data
          Region: instanceData.Region,
          Environment: instanceData.Environment,
        };
        
        console.log("=== Complete Instance Object ===");
        console.log("Name:", completeInstance.Name);
        console.log("SecurityGroups count:", completeInstance.SecurityGroups?.length);
        console.log("SecurityGroups full:", completeInstance.SecurityGroups);
        console.log("BlockDeviceMappings count:", completeInstance.BlockDeviceMappings?.length);
        console.log("SecurityGroups:", completeInstance.SecurityGroups);
        console.log("BlockDeviceMappings:", completeInstance.BlockDeviceMappings);
        
        // Log each security group's rules
        completeInstance.SecurityGroups?.forEach((sg: any, idx: number) => {
          console.log(`Security Group ${idx + 1}:`, sg.GroupName);
          console.log("  - IpPermissions (Inbound):", sg.IpPermissions);
          console.log("  - IpPermissionsEgress (Outbound):", sg.IpPermissionsEgress);
        });
        
        setInstance(completeInstance);
        toast.success("Instance details loaded");
      } else {
        console.error("Invalid instance details received:", instanceDetails);
        toast.error("Invalid instance data received");
      }
    } catch (error) {
      console.error("=== Error Fetching Instance Details ===");
      console.error("Error:", error);
      toast.error("Failed to fetch complete instance details");
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    if (instance) {
      await fetchInstanceDetails(instance);
      toast.success("Instance data refreshed");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getStateColor = (state: any) => {
    // Handle both string and object formats
    const stateValue = typeof state === 'string' ? state : state?.Name || '';
    const lowerState = stateValue?.toLowerCase();
    if (lowerState === "running") return "success";
    if (lowerState === "stopped") return "error";
    if (lowerState === "stopping" || lowerState === "pending") return "warning";
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

  const instanceArn = `arn:aws:ec2:${instance.Region}:${instance.AccountId || "000000000000"}:instance/${instance.InstanceId}`;

  return (
    <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh", pb: 4 }}>
      {/* Header */}
      <Box sx={{ bgcolor: "white", borderBottom: "1px solid #e0e0e0", px: 3, py: 2 }}>
        <Breadcrumbs sx={{ mb: 1 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate(backPath)}
            sx={{ color: "#0073bb", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            {breadcrumbText}
          </Link>
          <Typography color="text.primary" fontWeight={500}>
            {instance.InstanceId}
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
              <ComputerIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="#232f3e">
                {instance.Name || instance.Tags?.find((tag: any) => tag.Key === "Name")?.Value || instance.InstanceId}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                  {instance.InstanceId}
                </Typography>
                <Typography variant="body2" color="text.secondary">•</Typography>
                <Chip
                  label={instance.State?.Name || instance.State}
                  color={getStateColor(instance.State?.Name || instance.State)}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {instance.InstanceType}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box display="flex" gap={1}>
            <IconButton
              onClick={() => navigate(backPath)}
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
            <Tab label="Monitoring" />
            <Tab label="Networking" />
            <Tab label="Storage" />
            <Tab label="Security" />
            <Tab label="Tags" />
          </Tabs>

          {/* Details Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ px: 2, pb: 2, maxWidth: "1000px" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Instance Summary */}
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <InfoIcon sx={{ color: "#0073bb" }} />
                      <Typography variant="h6" fontWeight={600}>
                        Instance Summary
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: "flex", gap: 3 }}>
                      <Box sx={{ flex: 1 }}>
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, width: "40%" }}>Instance ID</TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                                    {instance.InstanceId}
                                  </Typography>
                                  <IconButton size="small" onClick={() => copyToClipboard(instance.InstanceId)}>
                                    <ContentCopyIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Instance State</TableCell>
                              <TableCell>
                                <Chip 
                                  label={typeof instance.State === 'string' ? instance.State : instance.State?.Name || 'N/A'} 
                                  color={getStateColor(instance.State)} 
                                  size="small" 
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Instance Type</TableCell>
                              <TableCell>{instance.InstanceType || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Availability Zone</TableCell>
                              <TableCell>{instance.AvailabilityZone || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Platform</TableCell>
                              <TableCell>{instance.Platform || "Linux/UNIX"}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Private IP</TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "12px" }}>
                                    {instance.PrivateIpAddress || "N/A"}
                                  </Typography>
                                  {instance.PrivateIpAddress && (
                                    <IconButton size="small" onClick={() => copyToClipboard(instance.PrivateIpAddress)}>
                                      <ContentCopyIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Public IP</TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "12px" }}>
                                    {instance.PublicIpAddress || "N/A"}
                                  </Typography>
                                  {instance.PublicIpAddress && (
                                    <IconButton size="small" onClick={() => copyToClipboard(instance.PublicIpAddress)}>
                                      <ContentCopyIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, width: "40%" }}>Launch Time</TableCell>
                              <TableCell>{formatDate(instance.LaunchTime)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>AMI ID</TableCell>
                              <TableCell sx={{ fontFamily: "monospace", fontSize: "12px" }}>
                                {instance.ImageId || "N/A"}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Key Name</TableCell>
                              <TableCell>{instance.KeyName || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Region</TableCell>
                              <TableCell>{instance.Region || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Environment</TableCell>
                              <TableCell>
                                <Chip label={instance.Environment || "N/A"} size="small" variant="outlined" />
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Instance ARN */}
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <InfoIcon sx={{ color: "#0073bb" }} />
                      <Typography variant="h6" fontWeight={600}>
                        Instance ARN
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace", bgcolor: "#f5f7fa", p: 1, borderRadius: 1, flex: 1 }}
                      >
                        {instanceArn}
                      </Typography>
                      <IconButton size="small" onClick={() => copyToClipboard(instanceArn)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>

                {/* Host and Placement */}
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <ComputerIcon sx={{ color: "#0073bb" }} />
                      <Typography variant="h6" fontWeight={600}>
                        Host and Placement
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: "30%" }}>Tenancy</TableCell>
                          <TableCell>{instance.Tenancy || "default"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Host ID</TableCell>
                          <TableCell>{instance.HostId || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Affinity</TableCell>
                          <TableCell>{instance.Affinity || "default"}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </TabPanel>

          {/* Monitoring Tab */}
          <TabPanel value={tabValue} index={1}>
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
                    Detailed monitoring metrics are available in CloudWatch. Connect to CloudWatch for real-time
                    metrics.
                  </Alert>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, width: "30%" }}>Monitoring State</TableCell>
                        <TableCell>
                          <Chip
                            label={instance.MonitoringState || "Disabled"}
                            color={instance.MonitoringState === "enabled" ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Instance State</TableCell>
                        <TableCell>
                          <Chip label={instance.State} color={getStateColor(instance.State)} size="small" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Status Checks</TableCell>
                        <TableCell>Available in AWS CloudWatch Console</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>

          {/* Networking Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ px: 2, pb: 2, maxWidth: "1000px" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* IP Addresses */}
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <NetworkCheckIcon sx={{ color: "#0073bb" }} />
                      <Typography variant="h6" fontWeight={600}>
                        IP Addresses
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: "30%" }}>Private IPv4 Address</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                                {instance.PrivateIpAddress || "N/A"}
                              </Typography>
                              {instance.PrivateIpAddress && (
                                <IconButton
                                  size="small"
                                  onClick={() => copyToClipboard(instance.PrivateIpAddress)}
                                >
                                  <ContentCopyIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Public IPv4 Address</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                                {instance.PublicIpAddress || "N/A"}
                              </Typography>
                              {instance.PublicIpAddress && (
                                <IconButton size="small" onClick={() => copyToClipboard(instance.PublicIpAddress)}>
                                  <ContentCopyIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                        {instance.Ipv6Address && (
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>IPv6 Address</TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "11px" }}>
                                  {instance.Ipv6Address}
                                </Typography>
                                <IconButton size="small" onClick={() => copyToClipboard(instance.Ipv6Address)}>
                                  <ContentCopyIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                        {instance.NetworkInterfaces && instance.NetworkInterfaces.length > 0 && (
                          <>
                            {instance.NetworkInterfaces[0]?.PrivateIpAddresses && 
                             instance.NetworkInterfaces[0].PrivateIpAddresses.length > 1 && (
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Secondary Private IPs</TableCell>
                                <TableCell>
                                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                    {instance.NetworkInterfaces[0].PrivateIpAddresses
                                      .filter((ip: any) => !ip.Primary)
                                      .map((ip: any, idx: number) => (
                                        <Box key={idx} display="flex" alignItems="center" gap={1}>
                                          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                                            {ip.PrivateIpAddress}
                                          </Typography>
                                          <IconButton
                                            size="small"
                                            onClick={() => copyToClipboard(ip.PrivateIpAddress)}
                                          >
                                            <ContentCopyIcon sx={{ fontSize: 14 }} />
                                          </IconButton>
                                        </Box>
                                      ))}
                                  </Box>
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Network Interfaces */}
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <NetworkCheckIcon sx={{ color: "#0073bb" }} />
                      <Typography variant="h6" fontWeight={600}>
                        Network Interfaces
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: "30%" }}>VPC ID</TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "12px" }}>
                            {instance.VpcId || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Subnet ID</TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "12px" }}>
                            {instance.SubnetId || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Network Interface ID</TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "12px" }}>
                            {instance.NetworkInterfaces?.[0]?.NetworkInterfaceId || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Private DNS</TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "12px", wordBreak: "break-all" }}>
                            {instance.PrivateDnsName || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Public DNS</TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "12px", wordBreak: "break-all" }}>
                            {instance.PublicDnsName || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Source/Dest Check</TableCell>
                          <TableCell>
                            <Chip
                              label={instance.SourceDestCheck !== false ? "Enabled" : "Disabled"}
                              color={instance.SourceDestCheck !== false ? "success" : "warning"}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Elastic IP */}
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <NetworkCheckIcon sx={{ color: "#0073bb" }} />
                      <Typography variant="h6" fontWeight={600}>
                        Elastic IP
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      {instance.PublicIpAddress ? `Associated: ${instance.PublicIpAddress}` : "No Elastic IP associated"}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </TabPanel>

          {/* Storage Tab */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ px: 2, pb: 2, maxWidth: "1000px" }}>
              <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <StorageIcon sx={{ color: "#0073bb" }} />
                    <Typography variant="h6" fontWeight={600}>
                      Block Devices
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, width: "30%" }}>Root Device Type</TableCell>
                        <TableCell>{instance.RootDeviceType || "ebs"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Root Device Name</TableCell>
                        <TableCell>{instance.RootDeviceName || "/dev/xvda"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>EBS Optimized</TableCell>
                        <TableCell>
                          <Chip
                            label={instance.EbsOptimized ? "Yes" : "No"}
                            color={instance.EbsOptimized ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  
                  {instance.BlockDeviceMappings && instance.BlockDeviceMappings.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1" fontWeight={600} mb={2}>
                        Block Devices ({instance.BlockDeviceMappings.length})
                      </Typography>
                      {instance.BlockDeviceMappings.map((device: any, idx: number) => (
                        <Paper 
                          key={idx} 
                          elevation={0} 
                          sx={{ 
                            bgcolor: "#f5f7fa", 
                            p: 2, 
                            mb: 2, 
                            border: "1px solid #e0e0e0", 
                            borderRadius: "8px",
                            cursor: device.Ebs?.VolumeId ? "pointer" : "default",
                            transition: "all 0.2s",
                            "&:hover": device.Ebs?.VolumeId ? {
                              bgcolor: "#e8f4f8",
                              borderColor: "#0073bb",
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(0,115,187,0.15)"
                            } : {}
                          }}
                          onClick={() => {
                            if (device.Ebs?.VolumeId) {
                              const volumeData = {
                                volumeId: device.Ebs.VolumeId,
                                VolumeId: device.Ebs.VolumeId,
                                deviceName: device.DeviceName,
                                DeviceName: device.DeviceName,
                                state: device.Ebs.Status || "attached",
                                State: device.Ebs.Status || "attached",
                                attachTime: device.Ebs.AttachTime,
                                AttachTime: device.Ebs.AttachTime,
                                deleteOnTermination: device.Ebs.DeleteOnTermination,
                                DeleteOnTermination: device.Ebs.DeleteOnTermination,
                                instanceId: instance.InstanceId,
                                InstanceId: instance.InstanceId,
                                region: instance.Region,
                                Region: instance.Region,
                                environment: instance.Environment,
                                Environment: instance.Environment,
                                size: 0, // Will be fetched from API
                                Size: 0,
                              };
                              
                              console.log("=== Navigating to Volume Detail ===");
                              console.log("Volume ID:", device.Ebs.VolumeId);
                              console.log("Region:", instance.Region);
                              console.log("Environment:", instance.Environment);
                              console.log("Full volume data:", volumeData);
                              
                              // Navigate to volume detail page with properly structured data
                              navigate(`/platform/volumes/detail/${device.Ebs.VolumeId}`, {
                                state: { 
                                  volume: volumeData
                                }
                              });
                            }
                          }}
                        >
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <StorageIcon sx={{ color: "#0073bb", fontSize: 20 }} />
                              <Typography variant="subtitle2" fontWeight={600}>
                                {device.DeviceName || `Device ${idx + 1}`}
                              </Typography>
                            </Box>
                            <Chip 
                              label={device.Ebs?.Status || "attached"} 
                              size="small" 
                              color="success"
                              sx={{ fontWeight: 600, textTransform: "capitalize" }}
                            />
                          </Box>
                          <Table size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell sx={{ border: 0, py: 0.5, px: 0, width: "35%", color: "text.secondary", fontSize: "13px" }}>Volume ID</TableCell>
                                <TableCell sx={{ border: 0, py: 0.5, px: 0 }}>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "12px" }}>
                                      {device.Ebs?.VolumeId || "N/A"}
                                    </Typography>
                                    {device.Ebs?.VolumeId && (
                                      <IconButton size="small" onClick={() => copyToClipboard(device.Ebs.VolumeId)}>
                                        <ContentCopyIcon sx={{ fontSize: 14 }} />
                                      </IconButton>
                                    )}
                                  </Box>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ border: 0, py: 0.5, px: 0, color: "text.secondary", fontSize: "13px" }}>Attach Time</TableCell>
                                <TableCell sx={{ border: 0, py: 0.5, px: 0, fontSize: "13px" }}>
                                  {device.Ebs?.AttachTime ? formatDate(device.Ebs.AttachTime) : "N/A"}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ border: 0, py: 0.5, px: 0, color: "text.secondary", fontSize: "13px" }}>Delete on Termination</TableCell>
                                <TableCell sx={{ border: 0, py: 0.5, px: 0 }}>
                                  <Chip 
                                    label={device.Ebs?.DeleteOnTermination ? "Yes" : "No"} 
                                    size="small"
                                    color={device.Ebs?.DeleteOnTermination ? "warning" : "default"}
                                    sx={{ height: 20, fontSize: "11px" }}
                                  />
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={tabValue} index={4}>
            <Box sx={{ px: 2, pb: 2, maxWidth: "1000px" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* IAM Role */}
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <SecurityIcon sx={{ color: "#0073bb" }} />
                      <Typography variant="h6" fontWeight={600}>
                        IAM Role
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2">{instance.IamInstanceProfile || "No IAM role attached"}</Typography>
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
                    {instance.SecurityGroups && instance.SecurityGroups.length > 0 ? (
                      <Box>
                        {instance.SecurityGroups.map((sg: any, idx: number) => (
                          <Paper key={idx} elevation={0} sx={{ bgcolor: "#f5f7fa", p: 2, mb: 2, border: "1px solid #e0e0e0", borderRadius: "8px" }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <SecurityIcon sx={{ color: "#0073bb", fontSize: 20 }} />
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {sg.GroupName || `Security Group ${idx + 1}`}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Chip label={sg.GroupId || "N/A"} size="small" sx={{ fontFamily: "monospace", fontSize: "11px" }} />
                                <IconButton size="small" onClick={() => copyToClipboard(sg.GroupId)}>
                                  <ContentCopyIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Box>
                            </Box>
                            {sg.Description && (
                              <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                                {sg.Description}
                              </Typography>
                            )}
                            
                            {/* Inbound Rules */}
                            {sg.IpPermissions && sg.IpPermissions.length > 0 && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" fontWeight={600} color="#0073bb" display="block" mb={1}>
                                  Inbound Rules ({sg.IpPermissions.length})
                                </Typography>
                                <Paper elevation={0} sx={{ border: "1px solid #e0e0e0", overflow: "hidden" }}>
                                  <Table size="small">
                                    <TableBody>
                                      {sg.IpPermissions.map((rule: any, ruleIdx: number) => (
                                        <TableRow key={ruleIdx} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                                          <TableCell sx={{ py: 1, fontSize: "12px", fontWeight: 600, width: "15%" }}>
                                            {rule.IpProtocol === "-1" ? "All" : (rule.IpProtocol?.toUpperCase() || "N/A")}
                                          </TableCell>
                                          <TableCell sx={{ py: 1, fontSize: "12px", width: "20%" }}>
                                            {rule.IpProtocol === "-1" ? (
                                              <Chip label="All Ports" size="small" sx={{ height: 20, fontSize: "11px" }} />
                                            ) : rule.FromPort === rule.ToPort ? (
                                              rule.FromPort || "All"
                                            ) : (
                                              `${rule.FromPort || "All"} - ${rule.ToPort || "All"}`
                                            )}
                                          </TableCell>
                                          <TableCell sx={{ py: 1, fontSize: "12px" }}>
                                            {rule.IpRanges?.map((ip: any, ipIdx: number) => (
                                              <Chip key={ipIdx} label={ip.CidrIp} size="small" sx={{ mr: 0.5, mb: 0.5, height: 20, fontSize: "11px" }} />
                                            ))}
                                            {rule.Ipv6Ranges?.map((ip: any, ipIdx: number) => (
                                              <Chip key={ipIdx} label={ip.CidrIpv6} size="small" sx={{ mr: 0.5, mb: 0.5, height: 20, fontSize: "11px" }} />
                                            ))}
                                            {rule.UserIdGroupPairs?.map((sgRef: any, sgIdx: number) => (
                                              <Chip 
                                                key={sgIdx} 
                                                label={sgRef.GroupId} 
                                                size="small" 
                                                color="primary"
                                                variant="outlined"
                                                sx={{ mr: 0.5, mb: 0.5, height: 20, fontSize: "11px", fontFamily: "monospace" }} 
                                              />
                                            ))}
                                            {!rule.IpRanges?.length && !rule.Ipv6Ranges?.length && !rule.UserIdGroupPairs?.length && "N/A"}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </Paper>
                              </Box>
                            )}
                            
                            {/* Outbound Rules */}
                            {sg.IpPermissionsEgress && sg.IpPermissionsEgress.length > 0 && (
                              <Box>
                                <Typography variant="caption" fontWeight={600} color="#0073bb" display="block" mb={1}>
                                  Outbound Rules ({sg.IpPermissionsEgress.length})
                                </Typography>
                                <Paper elevation={0} sx={{ border: "1px solid #e0e0e0", overflow: "hidden" }}>
                                  <Table size="small">
                                    <TableBody>
                                      {sg.IpPermissionsEgress.map((rule: any, ruleIdx: number) => (
                                        <TableRow key={ruleIdx} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                                          <TableCell sx={{ py: 1, fontSize: "12px", fontWeight: 600, width: "15%" }}>
                                            {rule.IpProtocol === "-1" ? "All" : (rule.IpProtocol?.toUpperCase() || "N/A")}
                                          </TableCell>
                                          <TableCell sx={{ py: 1, fontSize: "12px", width: "20%" }}>
                                            {rule.IpProtocol === "-1" ? (
                                              <Chip label="All Ports" size="small" sx={{ height: 20, fontSize: "11px" }} />
                                            ) : rule.FromPort === rule.ToPort ? (
                                              rule.FromPort || "All"
                                            ) : (
                                              `${rule.FromPort || "All"} - ${rule.ToPort || "All"}`
                                            )}
                                          </TableCell>
                                          <TableCell sx={{ py: 1, fontSize: "12px" }}>
                                            {rule.IpRanges?.map((ip: any, ipIdx: number) => (
                                              <Chip key={ipIdx} label={ip.CidrIp} size="small" sx={{ mr: 0.5, mb: 0.5, height: 20, fontSize: "11px" }} />
                                            ))}
                                            {rule.Ipv6Ranges?.map((ip: any, ipIdx: number) => (
                                              <Chip key={ipIdx} label={ip.CidrIpv6} size="small" sx={{ mr: 0.5, mb: 0.5, height: 20, fontSize: "11px" }} />
                                            ))}
                                            {rule.UserIdGroupPairs?.map((sgRef: any, sgIdx: number) => (
                                              <Chip 
                                                key={sgIdx} 
                                                label={sgRef.GroupId} 
                                                size="small" 
                                                color="primary"
                                                variant="outlined"
                                                sx={{ mr: 0.5, mb: 0.5, height: 20, fontSize: "11px", fontFamily: "monospace" }} 
                                              />
                                            ))}
                                            {!rule.IpRanges?.length && !rule.Ipv6Ranges?.length && !rule.UserIdGroupPairs?.length && "N/A"}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </Paper>
                              </Box>
                            )}
                            
                            {!sg.IpPermissions?.length && !sg.IpPermissionsEgress?.length && (
                              <Alert severity="info" sx={{ mt: 1 }}>
                                No rules configured or additional permissions required to view rules
                              </Alert>
                            )}
                            
                            <Box sx={{ bgcolor: "white", p: 1.5, borderRadius: 1, mt: 2 }}>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                VPC: {sg.VpcId || "N/A"}
                              </Typography>
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    ) : (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        No security groups attached
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Key Pair */}
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <SecurityIcon sx={{ color: "#0073bb" }} />
                      <Typography variant="h6" fontWeight={600}>
                        Key Pair
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2">{instance.KeyName || "No key pair"}</Typography>
                  </CardContent>
                </Card>
              </Box>
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
                  {instance.Tags && instance.Tags.length > 0 ? (
                    <Table size="small">
                      <TableBody>
                        {instance.Tags.map((tag: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell sx={{ fontWeight: 600, width: "30%" }}>{tag.Key}</TableCell>
                            <TableCell>{tag.Value}</TableCell>
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
