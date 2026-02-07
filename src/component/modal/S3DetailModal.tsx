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
  LinearProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudIcon from "@mui/icons-material/Cloud";
import DateRangeIcon from "@mui/icons-material/DateRange";
import StorageIcon from "@mui/icons-material/Storage";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InfoIcon from "@mui/icons-material/Info";
import FolderIcon from "@mui/icons-material/Folder";
import SecurityIcon from "@mui/icons-material/Security";

interface S3DetailModalProps {
  open: boolean;
  onClose: () => void;
  bucket: any;
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

const TabPanel = (props: any) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`s3-tabpanel-${index}`}
      aria-labelledby={`s3-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const formatBytes = (bytes: number | string) => {
  const numBytes = typeof bytes === 'string' ? parseFloat(bytes) : bytes;
  if (isNaN(numBytes) || numBytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  if (numBytes < k) return Math.round(numBytes * 100) / 100 + ' B';
  const i = Math.floor(Math.log(Math.max(numBytes, 1)) / Math.log(k));
  const value = numBytes / Math.pow(k, i);
  return (Math.round(value * 100) / 100).toFixed(2) + ' ' + sizes[Math.min(i, sizes.length - 1)];
};

const S3DetailModal: React.FC<S3DetailModalProps> = ({ open, onClose, bucket }) => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Mock bucket objects data - in production, this would come from API
  const bucketObjects = [
    { name: 'documents/report.pdf', size: 2.5 * 1024 * 1024, lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), storageClass: 'STANDARD', etag: '"a1b2c3d4e5f6g7h8"' },
    { name: 'images/photo1.jpg', size: 4.8 * 1024 * 1024, lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), storageClass: 'STANDARD', etag: '"b2c3d4e5f6g7h8i9"' },
    { name: 'images/photo2.jpg', size: 3.2 * 1024 * 1024, lastModified: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), storageClass: 'STANDARD', etag: '"c3d4e5f6g7h8i9j0"' },
    { name: 'data/archive.zip', size: 125 * 1024 * 1024, lastModified: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), storageClass: 'STANDARD_IA', etag: '"d4e5f6g7h8i9j0k1"' },
    { name: 'logs/app.log', size: 512 * 1024, lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), storageClass: 'STANDARD', etag: '"e5f6g7h8i9j0k1l2"' },
    { name: 'config/settings.json', size: 45 * 1024, lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), storageClass: 'STANDARD', etag: '"f6g7h8i9j0k1l2m3"' },
    { name: 'backup/db-backup.sql', size: 85.5 * 1024 * 1024, lastModified: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), storageClass: 'GLACIER', etag: '"g7h8i9j0k1l2m3n4"' },
  ];

  const totalObjectsSize = bucketObjects.reduce((sum, obj) => sum + obj.size, 0);

  if (!bucket) return null;

  const bucketName = bucket?.bucketName || bucket?.Name;
  const creationDate = bucket?.creationDate || bucket?.CreationDate;
  const region = bucket?.location || 'us-east-1';
  const size = bucket?.size || 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #ff9900 0%, #ffc266 100%)',
          color: 'white',
          fontWeight: 700,
          fontSize: '1.3rem',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <FolderIcon />
        {bucketName}
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="s3 details tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab label="Overview" id="s3-tab-0" aria-controls="s3-tabpanel-0" />
          <Tab label="Properties" id="s3-tab-1" aria-controls="s3-tabpanel-1" />
          <Tab label="Objects" id="s3-tab-2" aria-controls="s3-tabpanel-2" />
          <Tab label="Storage" id="s3-tab-3" aria-controls="s3-tabpanel-3" />
          <Tab label="Configuration" id="s3-tab-4" aria-controls="s3-tabpanel-4" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Basic Info */}
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <FolderIcon sx={{ color: '#ff9900' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Bucket Information
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Bucket Name</DetailLabel>
                      <Box
                        sx={{
                          background: '#fff',
                          p: 1,
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.9rem',
                          border: '1px solid #e0e0e0',
                        }}
                      >
                        <DetailValue>{bucketName}</DetailValue>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Region</DetailLabel>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationOnIcon sx={{ fontSize: '1.1rem', color: '#ff9900' }} />
                        <DetailValue>{region}</DetailValue>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Creation Date</DetailLabel>
                      <Box display="flex" alignItems="center" gap={1}>
                        <DateRangeIcon sx={{ fontSize: '1.1rem', color: '#ff9900' }} />
                        <DetailValue>
                          {creationDate ? new Date(creationDate).toLocaleDateString() : 'N/A'}
                        </DetailValue>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Creation Time</DetailLabel>
                      <DetailValue>
                        {creationDate ? new Date(creationDate).toLocaleTimeString() : 'N/A'}
                      </DetailValue>
                    </Grid>
                  </Grid>
                </CardContent>
              </DetailCard>
            </Grid>

            {/* Size Information */}
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <StorageIcon sx={{ color: '#ff9900' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Storage Metrics
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Total Size</DetailLabel>
                      <Typography variant="h5" sx={{ color: '#ff9900', fontWeight: 700 }}>
                        {formatBytes(totalObjectsSize)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Last calculated: Just now
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </DetailCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Properties Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {/* Basic Properties */}
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <FolderIcon sx={{ color: '#ff9900' }} />
                    <Typography variant="h6" fontWeight={700}>
                      General
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Bucket Name</DetailLabel>
                      <Box sx={{ background: '#fff', p: 1.5, borderRadius: 1, border: '1px solid #e0e0e0' }}>
                        <DetailValue sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{bucketName}</DetailValue>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Region</DetailLabel>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip label={region} icon={<LocationOnIcon />} color="primary" size="small" />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Creation Date</DetailLabel>
                      <DetailValue>
                        {creationDate ? new Date(creationDate).toLocaleDateString() : 'N/A'}
                      </DetailValue>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Creation Time</DetailLabel>
                      <DetailValue>
                        {creationDate ? new Date(creationDate).toLocaleTimeString() : 'N/A'}
                      </DetailValue>
                    </Grid>
                  </Grid>
                </CardContent>
              </DetailCard>
            </Grid>

            {/* Identifiers */}
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <InfoIcon sx={{ color: '#ff9900' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Identifiers
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <DetailLabel>Bucket ARN</DetailLabel>
                      <Box sx={{ background: '#f5f5f5', p: 1.5, borderRadius: 1, border: '1px solid #e0e0e0', wordBreak: 'break-all' }}>
                        <DetailValue sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          arn:aws:s3:::{bucketName}
                        </DetailValue>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <DetailLabel>AWS Account ID</DetailLabel>
                      <Box sx={{ background: '#f5f5f5', p: 1.5, borderRadius: 1, border: '1px solid #e0e0e0' }}>
                        <DetailValue sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>123456789012</DetailValue>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </DetailCard>
            </Grid>

            {/* Encryption & Security */}
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <SecurityIcon sx={{ color: '#ff9900' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Encryption
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Default Encryption</DetailLabel>
                      <Chip label="S3-Managed (SSE-S3)" color="success" size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Bucket Key</DetailLabel>
                      <Chip label="Disabled" variant="outlined" size="small" />
                    </Grid>
                  </Grid>
                </CardContent>
              </DetailCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Objects Tab - NEW */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <FolderIcon sx={{ color: '#ff9900' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Objects in Bucket
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ overflowX: 'auto' }}>
                    <TableContainer component={Paper} sx={{ background: '#fff' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ background: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 600, minWidth: 250 }}>Object Name</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right" width={120}>Size</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} width={130}>Storage Class</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} width={130}>Last Modified</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {bucketObjects.map((obj, idx) => (
                            <TableRow key={idx} sx={{ '&:hover': { backgroundColor: '#f9f9f9' }, cursor: 'pointer' }}>
                              <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                                {obj.name}
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {formatBytes(obj.size)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={obj.storageClass}
                                  size="small"
                                  color={obj.storageClass === 'STANDARD' ? 'primary' : obj.storageClass === 'STANDARD_IA' ? 'warning' : 'info'}
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="textSecondary">
                                  {obj.lastModified.toLocaleDateString()} {obj.lastModified.toLocaleTimeString()}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                  <Box sx={{ mt: 2, p: 2, background: '#f5f5f5', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={3}>
                        <DetailLabel>Total Objects</DetailLabel>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9900' }}>
                          {bucketObjects.length}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <DetailLabel>Total Size</DetailLabel>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9900' }}>
                          {formatBytes(totalObjectsSize)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <DetailLabel>Storage Classes</DetailLabel>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {new Set(bucketObjects.map(o => o.storageClass)).size} types
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <DetailLabel>Last Updated</DetailLabel>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Just now
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </DetailCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Storage Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <StorageIcon sx={{ color: '#ff9900' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Storage Usage
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Total Storage Used</DetailLabel>
                      <Typography variant="h5" sx={{ color: '#ff9900', fontWeight: 700, mb: 1 }}>
                        {formatBytes(size)}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(Math.max(0, ((size || 0) / (100 * 1024 * 1024 * 1024)) * 100), 100)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        Last updated: Now
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Number of Objects</DetailLabel>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        View in bucket
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </DetailCard>
            </Grid>

            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <DetailLabel>Storage Breakdown</DetailLabel>
                  <TableContainer component={Paper} sx={{ background: '#fff', mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ background: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Storage Class</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            Size
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            Objects
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Standard Storage</TableCell>
                          <TableCell align="right">{formatBytes(size)}</TableCell>
                          <TableCell align="right">-</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Intelligent-Tiering</TableCell>
                          <TableCell align="right">0 B</TableCell>
                          <TableCell align="right">0</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Standard-IA</TableCell>
                          <TableCell align="right">0 B</TableCell>
                          <TableCell align="right">0</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>One Zone-IA</TableCell>
                          <TableCell align="right">0 B</TableCell>
                          <TableCell align="right">0</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Glacier Instant Retrieval</TableCell>
                          <TableCell align="right">0 B</TableCell>
                          <TableCell align="right">0</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Glacier Flexible Retrieval</TableCell>
                          <TableCell align="right">0 B</TableCell>
                          <TableCell align="right">0</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Deep Archive</TableCell>
                          <TableCell align="right">0 B</TableCell>
                          <TableCell align="right">0</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </DetailCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Configuration Tab */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            {/* Bucket Configuration */}
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <InfoIcon sx={{ color: '#ff9900' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Bucket Security & Configuration
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Block Public Access (ACLs)</DetailLabel>
                      <Chip label="Enabled" color="success" size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Block Public Access (Bucket Policy)</DetailLabel>
                      <Chip label="Enabled" color="success" size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Versioning</DetailLabel>
                      <Chip label="Disabled" variant="outlined" size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>MFA Delete</DetailLabel>
                      <Chip label="Disabled" variant="outlined" size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Server-Side Encryption</DetailLabel>
                      <Chip label="S3-Managed (SSE-S3)" color="primary" size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Default Encryption</DetailLabel>
                      <Chip label="Enabled" color="success" size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Object Lock</DetailLabel>
                      <Chip label="Disabled" variant="outlined" size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Requester Pays</DetailLabel>
                      <Chip label="Disabled" variant="outlined" size="small" />
                    </Grid>
                  </Grid>
                </CardContent>
              </DetailCard>
            </Grid>

            {/* Bucket Policy */}
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <SecurityIcon sx={{ color: '#ff9900' }} />
                      <Typography variant="h6" fontWeight={700}>
                        Bucket Policy
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        const policyText = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::${bucketName}/*"]
    }
  ]
}`;
                        navigator.clipboard.writeText(policyText);
                        alert('Policy copied to clipboard');
                      }}
                    >
                      Copy JSON
                    </Button>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      background: '#1e1e1e',
                      p: 2,
                      borderRadius: 1,
                      border: '1px solid #444',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      maxHeight: '400px',
                      overflowY: 'auto',
                      lineHeight: '1.5',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#d4d4d4',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::${bucketName}/*"]
    }
  ]
}`}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    This policy controls access to the bucket. Edit to update permissions and security settings.
                  </Typography>
                </CardContent>
              </DetailCard>
            </Grid>

            {/* Lifecycle Rules */}
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <InfoIcon sx={{ color: '#ff9900' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Lifecycle Rules
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="textSecondary">
                    No lifecycle rules configured. Create rules to automatically transition or delete objects.
                  </Typography>
                </CardContent>
              </DetailCard>
            </Grid>

            {/* CORS Configuration */}
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <CloudIcon sx={{ color: '#ff9900' }} />
                    <Typography variant="h6" fontWeight={700}>
                      CORS Configuration
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="textSecondary">
                    No CORS rules configured.
                  </Typography>
                </CardContent>
              </DetailCard>
            </Grid>

            {/* Bucket Tags */}
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <InfoIcon sx={{ color: '#ff9900' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Tags
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="textSecondary">
                    No tags configured.
                  </Typography>
                </CardContent>
              </DetailCard>
            </Grid>

            {/* Transfer Acceleration */}
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <CloudIcon sx={{ color: '#ff9900' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Transfer Acceleration
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Chip label="Disabled" variant="outlined" size="small" />
                </CardContent>
              </DetailCard>
            </Grid>

            {/* Access Control List */}
            <Grid item xs={12}>
              <DetailCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <SecurityIcon sx={{ color: '#ff9900' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Access Control List (ACL)
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Owner</DetailLabel>
                      <Chip label="Full Control" color="primary" size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailLabel>Public Access</DetailLabel>
                      <Chip label="Private" variant="outlined" size="small" />
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

export default S3DetailModal;
