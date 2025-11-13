import { useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';

/**
 * EKS Inventory Redirect Component
 * Automatically redirects to IFF Cloud Conductor in a new tab
 */
export default function EKSInventoryRedirect() {
    useEffect(() => {
        // Redirect to IFF Cloud Conductor in the same window
        const baseUrl = 'https://iffcloud-conductor.global.iff.com';

        // Get auth token from sessionStorage
        const authToken = sessionStorage.getItem('authKey');
        const username = sessionStorage.getItem('username');

        // Build URL with auth parameters if token exists
        let redirectUrl = baseUrl;
        if (authToken) {
            const params = new URLSearchParams();
            params.append('token', authToken);
            if (username) {
                params.append('username', username);
            }
            redirectUrl = `${baseUrl}?${params.toString()}`;
        }

        // Redirect in the same window after a brief delay
        const timer = setTimeout(() => {
            window.location.href = redirectUrl;
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                gap: 3,
            }}
        >
            {/* Icon and Loading */}
            <Box
                sx={{
                    width: 80,
                    height: 80,
                    background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 8px 24px rgba(0, 115, 187, 0.3)',
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                        '0%, 100%': {
                            transform: 'scale(1)',
                            boxShadow: '0 8px 24px rgba(0, 115, 187, 0.3)',
                        },
                        '50%': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 12px 32px rgba(0, 115, 187, 0.5)',
                        },
                    },
                }}
            >
                <LaunchIcon sx={{ fontSize: 40 }} />
            </Box>

            {/* Message */}
            <Box sx={{ textAlign: 'center', maxWidth: 600 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        color: '#232f3e',
                        mb: 2,
                    }}
                >
                    Redirecting to IFF Cloud Conductor
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        color: '#6c757d',
                        mb: 3,
                    }}
                >
                    Opening EKS Inventory in a new tab...
                </Typography>

                {/* Loading Spinner */}
                <CircularProgress size={40} sx={{ color: '#0073bb' }} />
            </Box>

            {/* Manual Link (if popup blocked) */}
            <Box
                sx={{
                    mt: 4,
                    p: 3,
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    textAlign: 'center',
                    maxWidth: 500,
                }}
            >
                <Typography
                    variant="body2"
                    sx={{
                        color: '#6c757d',
                        mb: 2,
                    }}
                >
                    If the new tab didn't open automatically, click below:
                </Typography>
                <a
                    href="https://iffcloud-conductor.global.iff.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        backgroundColor: '#0073bb',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#005a94';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#0073bb';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    Open IFF Cloud Conductor
                    <LaunchIcon sx={{ fontSize: 18 }} />
                </a>
            </Box>
        </Box>
    );
}
