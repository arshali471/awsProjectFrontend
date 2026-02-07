import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Button as MuiButton,
    Paper,
    IconButton,
    InputAdornment,
    Card,
    CardContent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TerminalIcon from '@mui/icons-material/Terminal';
import PersonIcon from '@mui/icons-material/Person';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkIcon from '@mui/icons-material/Link';
import PublicIcon from '@mui/icons-material/Public';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SSHTerminal() {
    const navigate = useNavigate();
    const [ip, setIp] = useState('');
    const [username, setUsername] = useState('');
    const [sshFile, setSshFile] = useState<File | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSshFile(file);
        }
    };

    const handleConnect = async () => {
        if (!ip || !username || !sshFile) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            setIsConnecting(true);
            const formData = new FormData();
            formData.append('ip', ip);
            formData.append('username', username);
            formData.append('sshkey', sshFile);

            const { data } = await axios.post(
                `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/aws/ssh`,
                formData
            );

            console.log('[SSHTerminal] Backend response:', data);
            console.log('[SSHTerminal] User-entered IP:', ip);
            console.log('[SSHTerminal] User-entered username:', username);
            console.log('[SSHTerminal] Backend returned IP:', data.ip);
            
            // IMPORTANT: Use the IP that the USER entered, not from backend response
            // Backend just echoes back what we sent, but we should use our form value
            const credentialsToSend = {
                ip: ip,  // Use form value, not data.ip
                username: username,  // Use form value, not data.username
                sshKey: data.sshKey
            };

            // Open the terminal in a new tab
            const terminalUrl = `${window.location.origin}/terminal`;
            const newWindow = window.open(terminalUrl, '_blank');

            // Send credentials to the new window
            let acknowledged = false;
            let sendAttempts = 0;

            function sendCredentials(event?: MessageEvent) {
                if (event && event.data === 'ack') {
                    acknowledged = true;
                    window.removeEventListener('message', sendCredentials);
                    toast.success('Terminal connected successfully!');
                    setIsConnecting(false);
                    return;
                }
                if (newWindow && !acknowledged && sendAttempts < 20) {
                    console.log('[SSHTerminal] Sending credentials to terminal window (attempt ' + (sendAttempts + 1) + '):', {
                        ip: credentialsToSend.ip,
                        username: credentialsToSend.username,
                        sshKeyLength: credentialsToSend.sshKey?.length || 0
                    });
                    newWindow.postMessage(
                        credentialsToSend,
                        window.location.origin
                    );
                    sendAttempts++;
                    setTimeout(sendCredentials, 150);
                }
            }

            window.addEventListener('message', sendCredentials);
            sendCredentials();

        } catch (error: any) {
            console.error('SSH Connect Error:', error);
            toast.error(error.response?.data?.message || 'Failed to connect to SSH');
            setIsConnecting(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
                py: 4,
                px: 3,
            }}
        >
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                {/* Page Header */}
                <Box sx={{ mb: 4 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <IconButton
                            onClick={() => navigate(-1)}
                            sx={{
                                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                color: 'white',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #218838 0%, #1aa179 100%)',
                                    transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: '0 4px 16px rgba(40, 167, 69, 0.3)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 20px rgba(40, 167, 69, 0.4)',
                                }
                            }}
                        >
                            <TerminalIcon sx={{ fontSize: 32 }} />
                        </Box>
                        <Box>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    color: '#232f3e',
                                    letterSpacing: '-0.5px',
                                }}
                            >
                                SSH Terminal
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6c757d', mt: 0.5 }}>
                                Connect to any server via SSH
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Info Card */}
                <Card
                    elevation={0}
                    sx={{
                        mb: 3,
                        borderRadius: '16px',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.05) 0%, rgba(32, 201, 151, 0.05) 100%)',
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="body2" sx={{ color: '#6c757d', lineHeight: 1.6 }}>
                            <strong>Instructions:</strong> Enter the IP address of the server you want to connect to, provide your username,
                            and upload your SSH private key file (.pem or .key). The terminal will open in a new tab.
                        </Typography>
                    </CardContent>
                </Card>

                {/* Form Card */}
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: '16px',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                    }}
                >
                    <Box sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* IP Address */}
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} mb={1.5} color="#232f3e">
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <PublicIcon sx={{ fontSize: 18, color: '#28a745' }} />
                                        IP Address *
                                    </Box>
                                </Typography>
                                <TextField
                                    fullWidth
                                    value={ip}
                                    onChange={(e) => setIp(e.target.value)}
                                    placeholder="e.g., 192.168.1.100 or server.example.com"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PublicIcon sx={{ color: '#6c757d' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            background: 'white',
                                            '&:hover fieldset': {
                                                borderColor: '#28a745',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#28a745',
                                                borderWidth: '2px',
                                            }
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: '#28a745',
                                        }
                                    }}
                                />
                            </Box>

                            {/* Username */}
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} mb={1.5} color="#232f3e">
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <PersonIcon sx={{ fontSize: 18, color: '#28a745' }} />
                                        Username *
                                    </Box>
                                </Typography>
                                <TextField
                                    fullWidth
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="e.g., ec2-user, ubuntu, root"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon sx={{ color: '#6c757d' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            background: 'white',
                                            '&:hover fieldset': {
                                                borderColor: '#28a745',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#28a745',
                                                borderWidth: '2px',
                                            }
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: '#28a745',
                                        }
                                    }}
                                />
                            </Box>

                            {/* SSH Key Upload */}
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} mb={1.5} color="#232f3e">
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <VpnKeyIcon sx={{ fontSize: 18, color: '#28a745' }} />
                                        SSH Private Key *
                                    </Box>
                                </Typography>
                                <MuiButton
                                    component="label"
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<CloudUploadIcon />}
                                    sx={{
                                        py: 2,
                                        borderRadius: '12px',
                                        borderStyle: 'dashed',
                                        borderWidth: '2px',
                                        borderColor: '#28a745',
                                        color: '#28a745',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        '&:hover': {
                                            borderWidth: '2px',
                                            borderStyle: 'dashed',
                                            borderColor: '#218838',
                                            background: 'rgba(40, 167, 69, 0.04)',
                                        }
                                    }}
                                >
                                    {sshFile ? 'Change SSH Key File' : 'Upload SSH Key (.pem, .key)'}
                                    <input
                                        type="file"
                                        accept=".pem,.key"
                                        hidden
                                        onChange={handleFileChange}
                                    />
                                </MuiButton>
                                {sshFile && (
                                    <Box
                                        sx={{
                                            mt: 2,
                                            p: 2,
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(32, 201, 151, 0.1) 100%)',
                                            border: '1px solid rgba(40, 167, 69, 0.3)',
                                        }}
                                    >
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <CheckCircleIcon sx={{ fontSize: 20, color: '#28a745' }} />
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#28a745',
                                                    fontWeight: 600,
                                                    wordBreak: 'break-all',
                                                }}
                                            >
                                                {sshFile.name}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Box>

                            {/* Connect Button */}
                            <MuiButton
                                variant="contained"
                                size="large"
                                onClick={handleConnect}
                                disabled={!ip || !username || !sshFile || isConnecting}
                                startIcon={<LinkIcon />}
                                sx={{
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    py: 1.5,
                                    mt: 2,
                                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                    boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #218838 0%, #1aa179 100%)',
                                        boxShadow: '0 6px 16px rgba(40, 167, 69, 0.4)',
                                    },
                                    '&:disabled': {
                                        background: 'rgba(0, 0, 0, 0.12)',
                                    }
                                }}
                            >
                                {isConnecting ? 'Connecting...' : 'Connect to SSH Terminal'}
                            </MuiButton>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}
