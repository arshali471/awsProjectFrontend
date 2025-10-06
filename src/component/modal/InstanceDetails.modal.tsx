import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Chip,
    Card,
    CardContent,
    Grid,
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import StorageIcon from '@mui/icons-material/Storage';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LabelIcon from '@mui/icons-material/Label';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import ConnectModal from './Connect.modal';
import RdpConnectModal from './RdpConnect.modal';

interface InstanceDetailsModalProps {
    instance: any;
    onClose: () => void;
}

export default function InstanceDetailsModal({ instance, onClose }: InstanceDetailsModalProps) {
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [showRdpModal, setShowRdpModal] = useState(false);

    if (!instance) return null;

    const isRunning = instance.state?.toLowerCase() === 'running';
    const isWindows = instance.platformDetails?.toLowerCase().includes('windows') ||
                      instance.operatingSystem?.toLowerCase().includes('windows');

    const DetailItem = ({ label, value }: { label: string; value: any }) => (
        <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, display: 'block', mb: 0.5 }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 400, wordBreak: 'break-word' }}>
                {value || 'N/A'}
            </Typography>
        </Box>
    );

    const SectionCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
        <Card
            elevation={0}
            sx={{
                mb: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(0, 115, 187, 0.02) 0%, rgba(0, 115, 187, 0.01) 100%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    borderColor: 'primary.light',
                    boxShadow: '0 4px 12px rgba(0, 115, 187, 0.1)',
                }
            }}
        >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #0073bb 0%, #005a94 100%)',
                            color: 'white',
                        }}
                    >
                        {icon}
                    </Box>
                    <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                        {title}
                    </Typography>
                </Box>
                <Grid container spacing={2}>
                    {children}
                </Grid>
            </CardContent>
        </Card>
    );

    return (
        <>
            <Dialog
                open
                onClose={onClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                    }
                }}
            >
                <DialogTitle sx={{ pb: 2, pt: 3, px: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={2}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'linear-gradient(135deg, #0073bb 0%, #005a94 100%)',
                                    color: 'white',
                                }}
                            >
                                <ComputerIcon sx={{ fontSize: 28 }} />
                            </Box>
                            <Box>
                                <Typography variant="h5" fontWeight={700} color="text.primary">
                                    {instance.instanceName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {instance.instanceId}
                                </Typography>
                            </Box>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <Chip
                                icon={isRunning ? <PlayCircleOutlineIcon /> : <StopCircleOutlinedIcon />}
                                label={instance.state}
                                sx={{
                                    background: isRunning
                                        ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                                        : 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    '& .MuiChip-icon': { color: 'white' }
                                }}
                            />
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ px: 3, pb: 2 }}>
                    {/* Basic Information */}
                    <SectionCard icon={<ComputerIcon sx={{ fontSize: 20 }} />} title="Basic Information">
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Account" value={instance.account} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Instance Type" value={instance.instanceType} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Architecture" value={instance.architecture} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Image ID" value={instance.imageId} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Platform" value={instance.platformDetails} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Operating System" value={instance.operatingSystem} />
                        </Grid>
                    </SectionCard>

                    {/* Network Information */}
                    <SectionCard icon={<NetworkCheckIcon sx={{ fontSize: 20 }} />} title="Network Information">
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Public IP" value={instance.publicIp} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Private IP" value={instance.privateIp} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Availability Zone" value={instance.availabilityZone} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <DetailItem label="VPC ID" value={instance.vpcId} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <DetailItem label="Subnet ID" value={instance.subnetId} />
                        </Grid>
                        <Grid item xs={12}>
                            <DetailItem label="Security Groups" value={instance.securityGroups} />
                        </Grid>
                    </SectionCard>

                    {/* Storage & Compute */}
                    <SectionCard icon={<StorageIcon sx={{ fontSize: 20 }} />} title="Storage & Compute">
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Key Name" value={instance.keyName} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Root Device Type" value={instance.rootDeviceType} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Root Device Name" value={instance.rootDeviceName} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="EBS Optimized" value={instance.ebsOptimized?.toString()} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="CPU Core Count" value={instance.cpuCoreCount} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Threads Per Core" value={instance.threadsPerCore} />
                        </Grid>
                        <Grid item xs={12}>
                            <DetailItem label="Volume IDs" value={instance.volumeId} />
                        </Grid>
                    </SectionCard>

                    {/* Schedule & Launch */}
                    <SectionCard icon={<ScheduleIcon sx={{ fontSize: 20 }} />} title="Schedule & Launch">
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Launch Time" value={instance.launchTime} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Shutdown Schedule" value={instance.shutdownSchedule} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Startup Schedule" value={instance.startupSchedule} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Retention Days" value={instance.retentionDays} />
                        </Grid>
                    </SectionCard>

                    {/* Tags & Ownership */}
                    <SectionCard icon={<LabelIcon sx={{ fontSize: 20 }} />} title="Tags & Ownership">
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Environment" value={instance.environment} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Application" value={instance.application} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Cost Center" value={instance.costCenter} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Technical L1 Owner" value={instance.technical_L1_Owner} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Technical L2 Owner" value={instance.technical_L2_Owner} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="ITLT Owner" value={instance.itlTOwner} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <DetailItem label="Business Owner" value={instance.businessOwner} />
                        </Grid>
                    </SectionCard>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1.5 }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        startIcon={<CloseIcon />}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                        }}
                    >
                        Close
                    </Button>
                    <Button
                        onClick={() => isWindows ? setShowRdpModal(true) : setShowConnectModal(true)}
                        variant="contained"
                        disabled={!isRunning}
                        startIcon={isWindows ? <DesktopWindowsIcon /> : <LinkIcon />}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            background: isRunning
                                ? isWindows
                                    ? 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)'
                                    : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                                : undefined,
                            '&:hover': isRunning ? {
                                background: isWindows
                                    ? 'linear-gradient(135deg, #005a9e 0%, #004578 100%)'
                                    : 'linear-gradient(135deg, #218838 0%, #1aa179 100%)',
                            } : undefined,
                        }}
                    >
                        {isWindows ? 'RDP Connect' : 'SSH Connect'}
                    </Button>
                </DialogActions>
            </Dialog>

            {showConnectModal && (
                <ConnectModal
                    instance={instance}
                    onClose={() => setShowConnectModal(false)}
                />
            )}
            {showRdpModal && (
                <RdpConnectModal
                    instance={instance}
                    onClose={() => setShowRdpModal(false)}
                />
            )}
        </>
    );
}
