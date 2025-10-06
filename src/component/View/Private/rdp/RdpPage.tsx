import React, { useEffect, useState } from 'react';
import RdpViewer from './RdpViewer';
import { Box, CircularProgress, Typography } from '@mui/material';

const RDP_CONFIG_KEY = 'rdp_config';
const RDP_CONFIG_TIMESTAMP_KEY = 'rdp_config_timestamp';
const CONFIG_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export default function RdpPage() {
    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
        // Try to restore config from sessionStorage first
        const restoreConfig = () => {
            try {
                const storedConfig = sessionStorage.getItem(RDP_CONFIG_KEY);
                const timestamp = sessionStorage.getItem(RDP_CONFIG_TIMESTAMP_KEY);

                if (storedConfig && timestamp) {
                    const age = Date.now() - parseInt(timestamp);
                    if (age < CONFIG_EXPIRY) {
                        const parsed = JSON.parse(storedConfig);
                        setConfig(parsed);
                        return true;
                    } else {
                        sessionStorage.removeItem(RDP_CONFIG_KEY);
                        sessionStorage.removeItem(RDP_CONFIG_TIMESTAMP_KEY);
                    }
                }
            } catch (error) {
                console.error('Failed to restore RDP config:', error);
            }
            return false;
        };

        const restored = restoreConfig();

        // Listen for RDP config from parent window
        const handler = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            if (event.data && event.data.type === 'rdp_credentials' && event.data.data) {
                const rdpConfig = event.data.data;
                setConfig(rdpConfig);

                // Store config in sessionStorage
                try {
                    sessionStorage.setItem(RDP_CONFIG_KEY, JSON.stringify(rdpConfig));
                    sessionStorage.setItem(RDP_CONFIG_TIMESTAMP_KEY, Date.now().toString());
                } catch (error) {
                    console.error('Failed to store RDP config:', error);
                }

                // Send acknowledgment
                window.opener?.postMessage('rdp_ack', window.location.origin);
            }

            if (event.data && event.data.request === 'rdp_config' && window.opener) {
                window.opener.postMessage('resend_rdp', window.location.origin);
            }
        };

        window.addEventListener('message', handler);

        // Request config from parent if not restored
        if (!restored && window.opener) {
            window.opener.postMessage({ request: 'rdp_config' }, window.location.origin);
        }

        return () => window.removeEventListener('message', handler);
    }, []);

    if (!config) {
        return (
            <Box
                sx={{
                    position: 'fixed',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    background: '#1e1e1e',
                    color: 'white',
                }}
            >
                <CircularProgress sx={{ color: '#0078d4' }} />
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    Connecting to Windows Server...
                </Typography>
            </Box>
        );
    }

    return <RdpViewer config={config} />;
}
