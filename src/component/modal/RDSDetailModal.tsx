import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Paper,
  Grid,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Card,
  CardContent,
  Tab,
  Tabs,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import StorageIcon from '@mui/icons-material/Storage';
import SecurityIcon from '@mui/icons-material/Security';
import CloudIcon from '@mui/icons-material/Cloud';
import InfoIcon from '@mui/icons-material/Info';

interface RDSDetailModalProps {
  open: boolean;
  onClose: () => void;
  instance: any;
}

const DetailLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.secondary,
  fontSize: '0.85rem',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '4px',
})) as typeof Typography;

const DetailValue = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.text.primary,
  fontSize: '0.95rem',
  wordBreak: 'break-word',
})) as typeof Typography;

const DetailCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: '16px',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const getStatusColor = (status: string) => {
  const lowerStatus = status?.toLowerCase();
  if (lowerStatus === 'available') return 'success';
  if (lowerStatus === 'deleting') return 'error';
  if (lowerStatus === 'creating') return 'warning';
  if (lowerStatus === 'backing-up') return 'info';
  return 'default';
};

const TabPanel = (props: any) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`rds-tabpanel-${index}`}
      aria-labelledby={`rds-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const RDSDetailModal: React.FC<RDSDetailModalProps> = ({ open, onClose, instance }) => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!instance) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
          color: 'white',
          fontWeight: 700,
          fontSize: '1.3rem',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <StorageIcon />
        {instance?.instanceId}
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="rds details tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab label="Overview" id="rds-tab-0" aria-controls="rds-tabpanel-0" />
          <Tab label="Configuration" id="rds-tab-1" aria-controls="rds-tabpanel-1" />
          <Tab label="Network & Security" id="rds-tab-2" aria-controls="rds-tabpanel-2" />
          <Tab label="Storage & Backups" id="rds-tab-3" aria-controls="rds-tabpanel-3" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Status Section */}
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <StorageIcon sx={{ color: '#0073bb' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Instance Status
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Status</DetailLabel>
                      <Box display="flex" alignItems="center" gap={1}>
                        {instance?.status?.toLowerCase() === 'available' ? (
                          <CheckCircleIcon sx={{ color: 'green', fontSize: '1.2rem' }} />
                        ) : (
                          <ErrorIcon sx={{ color: 'orange', fontSize: '1.2rem' }} />
                        )}
                        <Chip
                          label={instance?.status}
                          color={getStatusColor(instance?.status)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Database Engine</DetailLabel>
                      <DetailValue>{instance?.engine}</DetailValue>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Engine Version</DetailLabel>
                      <DetailValue>{instance?.engineVersion}</DetailValue>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Instance Class</DetailLabel>
                      <DetailValue>{instance?.instanceClass}</DetailValue>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Created</DetailLabel>
                      <DetailValue>{instance?.createdAt}</DetailValue>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Allocated Storage</DetailLabel>
                      <DetailValue>{instance?.storage}</DetailValue>
                    </Grid>
                  </Grid>
                </CardContent>
              </DetailCard>
            </Grid>

            {/* Endpoint Section */}
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <CloudIcon sx={{ color: '#0073bb' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Connectivity
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <DetailLabel>Endpoint Address</DetailLabel>
                  <Box
                    sx={{
                      background: '#f5f5f5',
                      p: 1.5,
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      overflowX: 'auto',
                    }}
                  >
                    <DetailValue>{instance?.endpoint}</DetailValue>
                  </Box>
                </CardContent>
              </DetailCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Configuration Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <InfoIcon sx={{ color: '#0073bb' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Database Configuration
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Instance Type</DetailLabel>
                      <DetailValue>{instance?.instanceClass}</DetailValue>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Database Engine</DetailLabel>
                      <DetailValue>{instance?.engine}</DetailValue>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Engine Version</DetailLabel>
                      <DetailValue>{instance?.engineVersion}</DetailValue>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Allocated Storage</DetailLabel>
                      <DetailValue>{instance?.storage}</DetailValue>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Availability Zone</DetailLabel>
                      <DetailValue>{instance?.availabilityZone}</DetailValue>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Status</DetailLabel>
                      <Chip
                        label={instance?.status}
                        color={getStatusColor(instance?.status)}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </DetailCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Network & Security Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {/* VPC Information */}
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <CloudIcon sx={{ color: '#0073bb' }} />
                    <Typography variant="h6" fontWeight={700}>
                      VPC & Networking
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>VPC ID</DetailLabel>
                      <Box
                        sx={{
                          background: '#f5f5f5',
                          p: 1,
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.9rem',
                        }}
                      >
                        <DetailValue>{instance?.vpcId}</DetailValue>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Subnet Group</DetailLabel>
                      <DetailValue>{instance?.subnetGroup}</DetailValue>
                    </Grid>
                    <Grid item xs={12}>
                      <DetailLabel>Availability Zone</DetailLabel>
                      <DetailValue>{instance?.availabilityZone}</DetailValue>
                    </Grid>
                  </Grid>
                </CardContent>
              </DetailCard>
            </Grid>

            {/* Security Groups */}
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <SecurityIcon sx={{ color: '#0073bb' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Security Groups
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  {instance?.securityGroups && instance?.securityGroups?.length > 0 ? (
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {instance?.securityGroups?.map((sg: string, idx: number) => (
                        <Chip
                          key={idx}
                          label={sg}
                          variant="outlined"
                          color="primary"
                          icon={<SecurityIcon />}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No security groups configured
                    </Typography>
                  )}
                </CardContent>
              </DetailCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Storage & Backups Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <StorageIcon sx={{ color: '#0073bb' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Storage Configuration
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Allocated Storage</DetailLabel>
                      <DetailValue>{instance?.storage}</DetailValue>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Storage Type</DetailLabel>
                      <Chip label="General Purpose (gp3)" color="primary" size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>IOPS</DetailLabel>
                      <DetailValue>3000</DetailValue>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Throughput</DetailLabel>
                      <DetailValue>125 MiB/s</DetailValue>
                    </Grid>
                  </Grid>
                </CardContent>
              </DetailCard>
            </Grid>

            {/* Backup Configuration */}
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <InfoIcon sx={{ color: '#0073bb' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Backup Configuration
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Automated Backups</DetailLabel>
                      <Chip label="Enabled" color="success" size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Backup Retention Period</DetailLabel>
                      <DetailValue>7 days</DetailValue>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Preferred Backup Window</DetailLabel>
                      <DetailValue>03:00-04:00 UTC</DetailValue>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Backup Copy to Region</DetailLabel>
                      <Chip label="Disabled" variant="outlined" size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Delete Automated Backups</DetailLabel>
                      <Chip label="Yes" color="warning" size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Multi-AZ Backups</DetailLabel>
                      <Chip label="Disabled" variant="outlined" size="small" />
                    </Grid>
                  </Grid>
                </CardContent>
              </DetailCard>
            </Grid>

            {/* Enhanced Monitoring */}
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <InfoIcon sx={{ color: '#0073bb' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Enhanced Monitoring
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Enable Enhanced Monitoring</DetailLabel>
                      <Chip label="Enabled" color="success" size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Monitoring Granularity</DetailLabel>
                      <DetailValue>1 second</DetailValue>
                    </Grid>
                    <Grid item xs={12}>
                      <DetailLabel>Metrics Available</DetailLabel>
                      <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                        <Chip label="CPU Utilization" size="small" variant="outlined" />
                        <Chip label="Database Connections" size="small" variant="outlined" />
                        <Chip label="Network I/O" size="small" variant="outlined" />
                        <Chip label="Disk I/O" size="small" variant="outlined" />
                        <Chip label="Read Latency" size="small" variant="outlined" />
                        <Chip label="Write Latency" size="small" variant="outlined" />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </DetailCard>
            </Grid>

            {/* Maintenance */}
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <InfoIcon sx={{ color: '#0073bb' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Maintenance & Updates
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Auto Minor Version Upgrade</DetailLabel>
                      <Chip label="Enabled" color="success" size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Preferred Maintenance Window</DetailLabel>
                      <DetailValue>sun:04:00-sun:05:00</DetailValue>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Multi-AZ Deployment</DetailLabel>
                      <Chip label="Disabled" variant="outlined" size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Failover Priority</DetailLabel>
                      <DetailValue>-</DetailValue>
                    </Grid>
                  </Grid>
                </CardContent>
              </DetailCard>
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RDSDetailModal;
