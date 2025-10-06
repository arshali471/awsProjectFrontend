import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Tooltip, Typography, Chip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import KeyboardIcon from '@mui/icons-material/Keyboard';

interface RdpViewerProps {
    config: {
        ip: string;
        username: string;
        password: string;
        port: number;
        quality: string;
        security: string;
        instanceName: string;
        instanceId: string;
    };
}

export default function RdpViewer({ config }: RdpViewerProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fullscreen, setFullscreen] = useState(false);
    const [showKeyboard, setShowKeyboard] = useState(false);
    const clientRef = useRef<any>(null);
    const tunnelRef = useRef<any>(null);

    useEffect(() => {
        connect();
        return () => {
            disconnect();
        };
    }, []);

    const connect = async () => {
        try {
            const rdpWsUrl = import.meta.env.VITE_RDP_WS_URL || 'ws://localhost:3100/rdp';

            // Create WebSocket tunnel
            const tunnel = new WebSocket(rdpWsUrl);

            tunnelRef.current = tunnel;

            tunnel.onopen = () => {
                console.log('RDP WebSocket connected');

                // Send connection parameters
                const connectionParams = {
                    ip: config.ip,
                    username: config.username,
                    password: config.password,
                    port: config.port,
                    quality: config.quality,
                    security: config.security,
                };

                tunnel.send(JSON.stringify(connectionParams));
            };

            tunnel.onmessage = (event) => {
                if (typeof event.data === 'string') {
                    try {
                        const message = JSON.parse(event.data);
                        if (message.type === 'connected') {
                            setConnected(true);
                            setError(null);
                        } else if (message.type === 'error') {
                            setError(message.message);
                            setConnected(false);
                        }
                    } catch (e) {
                        // Handle binary data or non-JSON messages
                        console.log('Received data:', event.data);
                    }
                } else {
                    // Handle canvas rendering here
                    // This would typically involve Guacamole client rendering
                    renderFrame(event.data);
                }
            };

            tunnel.onerror = (err) => {
                console.error('RDP WebSocket error:', err);
                setError('Connection error. Please check your network and try again.');
                setConnected(false);
            };

            tunnel.onclose = () => {
                console.log('RDP WebSocket closed');
                setConnected(false);
                if (!error) {
                    setError('Connection closed. Click Reconnect to try again.');
                }
            };
        } catch (err) {
            console.error('RDP connection error:', err);
            setError('Failed to establish RDP connection.');
        }
    };

    const disconnect = () => {
        if (tunnelRef.current) {
            tunnelRef.current.close();
            tunnelRef.current = null;
        }
        setConnected(false);
    };

    const reconnect = () => {
        disconnect();
        setError(null);
        setTimeout(() => connect(), 500);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            canvasRef.current?.requestFullscreen();
            setFullscreen(true);
        } else {
            document.exitFullscreen();
            setFullscreen(false);
        }
    };

    const renderFrame = (data: any) => {
        // Placeholder for actual canvas rendering
        // In production, you'd use Guacamole client to render the frame
        console.log('Rendering frame:', data);
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100vh',
                background: '#000',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Top Toolbar */}
            <Box
                sx={{
                    height: 48,
                    background: '#2d2d2d',
                    borderBottom: '1px solid #444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                }}
            >
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="body2" sx={{ color: '#0078d4', fontWeight: 600 }}>
                        🖥️ {config.instanceName}
                    </Typography>
                    <Chip
                        label={config.ip}
                        size="small"
                        sx={{
                            background: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
                            color: 'white',
                            fontWeight: 600,
                        }}
                    />
                    <Typography variant="caption" sx={{ color: '#666', fontFamily: 'monospace' }}>
                        {config.instanceId}
                    </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                    {connected ? (
                        <Chip
                            label="Connected"
                            size="small"
                            sx={{ background: '#28a745', color: 'white', fontWeight: 600 }}
                        />
                    ) : error ? (
                        <Chip
                            label="Disconnected"
                            size="small"
                            sx={{ background: '#dc3545', color: 'white', fontWeight: 600 }}
                        />
                    ) : (
                        <Chip
                            label="Connecting..."
                            size="small"
                            sx={{ background: '#ffc107', color: '#000', fontWeight: 600 }}
                        />
                    )}

                    <Tooltip title="Virtual Keyboard">
                        <IconButton
                            size="small"
                            onClick={() => setShowKeyboard(!showKeyboard)}
                            sx={{ color: showKeyboard ? '#0078d4' : 'white' }}
                        >
                            <KeyboardIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                        <IconButton
                            size="small"
                            onClick={toggleFullscreen}
                            sx={{ color: 'white' }}
                        >
                            {fullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Reconnect">
                        <IconButton
                            size="small"
                            onClick={reconnect}
                            sx={{ color: 'white' }}
                        >
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* RDP Canvas */}
            <Box
                ref={canvasRef}
                sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#1e1e1e',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {error ? (
                    <Box
                        sx={{
                            textAlign: 'center',
                            color: 'white',
                            p: 4,
                        }}
                    >
                        <Typography variant="h6" color="error" gutterBottom>
                            Connection Error
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {error}
                        </Typography>
                        <IconButton
                            onClick={reconnect}
                            sx={{
                                background: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
                                color: 'white',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #005a9e 0%, #004578 100%)',
                                },
                            }}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Box>
                ) : !connected ? (
                    <Box sx={{ textAlign: 'center', color: 'white' }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Establishing RDP connection...
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Connecting to {config.ip}:{config.port}
                        </Typography>
                    </Box>
                ) : (
                    <Box
                        id="rdp-display"
                        sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#0078d4',
                            color: 'white',
                        }}
                    >
                        <Box sx={{ textAlign: 'center' }}>
                            <DesktopWindowsIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
                            <Typography variant="h6">RDP Session Active</Typography>
                            <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                                Note: Full RDP rendering requires backend setup with Guacamole
                            </Typography>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Status Bar */}
            <Box
                sx={{
                    height: 32,
                    background: '#2d2d2d',
                    color: '#888',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    borderTop: '1px solid #444',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                }}
            >
                <Box display="flex" alignItems="center" gap={2}>
                    <span>👤 {config.username}</span>
                    <span>|</span>
                    <span>Port: {config.port}</span>
                    <span>|</span>
                    <span>Quality: {config.quality}</span>
                </Box>
                <span>RDP Protocol</span>
            </Box>
        </Box>
    );
}

// Placeholder icon component
function DesktopWindowsIcon({ sx }: any) {
    return (
        <Box component="span" sx={sx}>
            🪟
        </Box>
    );
}
