import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Typography, Box, Card, CardContent, Chip, Divider, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import PersonIcon from '@mui/icons-material/Person';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';

interface RdpConnectModalProps {
    instance: any;
    onClose: () => void;
}

export default function RdpConnectModal({ instance, onClose }: RdpConnectModalProps) {
    const [username, setUsername] = useState('Administrator');
    const [password, setPassword] = useState('');
    const [port, setPort] = useState('3389');
    const [quality, setQuality] = useState('medium');
    const [security, setSecurity] = useState('any');

    const handleConnect = () => {
        const rdpUrl = `${window.location.origin}/rdp`;
        const newWindow = window.open(rdpUrl, '_blank');

        const rdpConfig = {
            ip: instance.publicIp || instance.privateIp,
            username,
            password,
            port: parseInt(port),
            quality,
            security,
            instanceName: instance.instanceName,
            instanceId: instance.instanceId,
        };

        let acknowledged = false;
        let sendAttempts = 0;

        function sendCredentials(event?: MessageEvent) {
            if (event && event.data === 'rdp_ack') {
                acknowledged = true;
                window.removeEventListener('message', sendCredentials);
                return;
            }
            if (newWindow && !acknowledged && sendAttempts < 20) {
                newWindow.postMessage(
                    {
                        type: 'rdp_credentials',
                        data: rdpConfig,
                    },
                    window.location.origin
                );
                sendAttempts++;
                setTimeout(sendCredentials, 150);
            }
        }

        window.addEventListener('message', sendCredentials);
        sendCredentials();

        onClose();
    };

    return (
        <Dialog
            open
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                }
            }}
        >
            <DialogTitle sx={{ pb: 2, pt: 3, px: 3 }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
                            color: 'white',
                        }}
                    >
                        <DesktopWindowsIcon sx={{ fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700} color="text.primary">
                            RDP Connection
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Connect to Windows Server via RDP
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ px: 3, pb: 2 }}>
                {/* Instance Info Card */}
                <Card
                    elevation={0}
                    sx={{
                        mb: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, rgba(0, 120, 212, 0.05) 0%, rgba(0, 90, 158, 0.05) 100%)',
                    }}
                >
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                        <Box display="flex" flexDirection="column" gap={1.5}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    Instance Name
                                </Typography>
                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                    {instance.instanceName || 'Unknown'}
                                </Typography>
                            </Box>
                            <Divider />
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    IP Address
                                </Typography>
                                <Chip
                                    label={instance.publicIp || instance.privateIp}
                                    size="small"
                                    sx={{
                                        fontWeight: 600,
                                        background: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
                                        color: 'white',
                                    }}
                                />
                            </Box>
                            <Divider />
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    Instance ID
                                </Typography>
                                <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                    {instance.instanceId}
                                </Typography>
                            </Box>
                            <Divider />
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    Platform
                                </Typography>
                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                    {instance.platformDetails || 'Windows'}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Username Input */}
                <Box mb={2.5}>
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 1.5 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <PersonIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                            Username
                        </Box>
                    </Typography>
                    <TextField
                        placeholder="Enter username (e.g., Administrator)"
                        fullWidth
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            }
                        }}
                    />
                </Box>

                {/* Password Input */}
                <Box mb={2.5}>
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 1.5 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <VpnKeyIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                            Password
                        </Box>
                    </Typography>
                    <TextField
                        type="password"
                        placeholder="Enter password"
                        fullWidth
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            }
                        }}
                    />
                </Box>

                {/* Advanced Settings */}
                <Box mb={2}>
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 1.5 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <SettingsIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                            Advanced Settings
                        </Box>
                    </Typography>
                    <Box display="flex" gap={2}>
                        <TextField
                            label="Port"
                            value={port}
                            onChange={e => setPort(e.target.value)}
                            sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <FormControl sx={{ flex: 1 }}>
                            <InputLabel>Quality</InputLabel>
                            <Select
                                value={quality}
                                label="Quality"
                                onChange={e => setQuality(e.target.value)}
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="low">Low</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                                <MenuItem value="best">Best</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>

                <FormControl fullWidth>
                    <InputLabel>Security Mode</InputLabel>
                    <Select
                        value={security}
                        label="Security Mode"
                        onChange={e => setSecurity(e.target.value)}
                        sx={{ borderRadius: 2 }}
                    >
                        <MenuItem value="any">Any</MenuItem>
                        <MenuItem value="nla">Network Level Authentication (NLA)</MenuItem>
                        <MenuItem value="tls">TLS</MenuItem>
                        <MenuItem value="rdp">RDP</MenuItem>
                    </Select>
                </FormControl>
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
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleConnect}
                    disabled={!username || !password}
                    startIcon={<LinkIcon />}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        background: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #005a9e 0%, #004578 100%)',
                        },
                        '&:disabled': {
                            background: 'rgba(0, 0, 0, 0.12)',
                        }
                    }}
                >
                    Connect Now
                </Button>
            </DialogActions>
        </Dialog>
    );
}
