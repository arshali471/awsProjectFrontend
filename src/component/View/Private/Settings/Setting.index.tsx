// @ts-nocheck
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import { Box, Typography, Card, CardContent, Grid, Chip, IconButton } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import TokenIcon from '@mui/icons-material/Token'
import KeyIcon from '@mui/icons-material/Key'
import LockIcon from '@mui/icons-material/Lock'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ShieldIcon from '@mui/icons-material/Shield'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PeopleIcon from '@mui/icons-material/People'
import AssessmentIcon from '@mui/icons-material/Assessment'

export default function SettingIndex() {
    const navigate = useNavigate();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Check if user logged in via SSO
    const ssoProvider = sessionStorage.getItem("ssoProvider");
    const isLocalUser = ssoProvider === "local";

    const apps = [
        {
            url: "/settings/admin",
            name: "Admin Panel",
            icon: AdminPanelSettingsIcon,
            isAdmin: true,
            description: "Manage administrators and permissions",
            color: "#667eea",
            bgColor: "rgba(102, 126, 234, 0.1)"
        },
        {
            url: "/settings/addUser",
            name: "Add Users",
            icon: PersonAddIcon,
            isAdmin: true,
            description: "Create and manage user accounts",
            color: "#0073bb",
            bgColor: "rgba(0, 115, 187, 0.1)"
        },
        {
            url: "/settings/addAWSKey",
            name: "AWS Keys",
            icon: VpnKeyIcon,
            isAdmin: true,
            description: "Manage AWS access credentials",
            color: "#28a745",
            bgColor: "rgba(40, 167, 69, 0.1)"
        },
        {
            url: "/settings/addEKSToken",
            name: "EKS Token",
            icon: TokenIcon,
            isAdmin: true,
            description: "Configure EKS cluster access tokens",
            color: "#FF6B6B",
            bgColor: "rgba(255, 107, 107, 0.1)"
        },
        {
            url: "/settings/ssh-key",
            name: "SSH Keys",
            icon: KeyIcon,
            isAdmin: true,
            description: "Manage SSH authentication keys",
            color: "#FFA726",
            bgColor: "rgba(255, 167, 38, 0.1)"
        },
        {
            url: "/settings/active-users",
            name: "Active Users",
            icon: PeopleIcon,
            isAdmin: true,
            description: "Monitor logged-in users and sessions",
            color: "#00BCD4",
            bgColor: "rgba(0, 188, 212, 0.1)"
        },
        {
            url: "/settings/api-logs",
            name: "API Logs",
            icon: AssessmentIcon,
            isAdmin: true,
            description: "View API request logs and monitoring data",
            color: "#FF9800",
            bgColor: "rgba(255, 152, 0, 0.1)"
        },
        {
            url: "/settings/change-password",
            name: "Change Password",
            icon: LockIcon,
            isAdmin: false,
            description: "Update your account password",
            color: "#9C27B0",
            bgColor: "rgba(156, 39, 176, 0.1)"
        },
    ];

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
                pt: 10,
                pb: 4,
                px: 3,
            }}
        >
            <Container>
                {/* Page Header */}
                <Box sx={{ mb: 4 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <IconButton
                            onClick={() => navigate(-1)}
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #764ba2 0%, #5a3d8a 100%)',
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
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                                }
                            }}
                        >
                            <SettingsIcon sx={{ fontSize: 32 }} />
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
                                Settings & Configuration
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#6c757d',
                                    mt: 0.5,
                                }}
                            >
                                Manage your account, security, and system preferences
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Settings Grid */}
                <Grid container spacing={3}>
                    {apps
                        .filter(app => {
                            // Hide change password for SSO users
                            if (app.url === "/settings/change-password" && !isLocalUser) {
                                return false;
                            }
                            return true;
                        })
                        .map((app, index) => {
                        const IconComponent = app.icon;
                        return (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card
                                    elevation={hoveredIndex === index ? 8 : 2}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    onClick={() => navigate(app.url)}
                                    sx={{
                                        height: '100%',
                                        cursor: 'pointer',
                                        borderRadius: 3,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        transform: hoveredIndex === index ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        border: `2px solid ${hoveredIndex === index ? app.color : 'transparent'}`,
                                        '&:hover': {
                                            boxShadow: `0 12px 28px ${app.bgColor}`,
                                        },
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '4px',
                                            background: `linear-gradient(90deg, ${app.color}, ${app.color}dd)`,
                                            transform: hoveredIndex === index ? 'scaleX(1)' : 'scaleX(0)',
                                            transformOrigin: 'left',
                                            transition: 'transform 0.4s ease',
                                        }
                                    }}
                                >
                                    {/* Admin Badge */}
                                    {app.isAdmin && (
                                        <Chip
                                            icon={<ShieldIcon sx={{ fontSize: 14, color: 'white !important' }} />}
                                            label="ADMIN"
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: 12,
                                                right: 12,
                                                bgcolor: app.bgColor,
                                                color: app.color,
                                                fontWeight: 700,
                                                fontSize: '0.7rem',
                                                border: `1px solid ${app.color}33`,
                                                zIndex: 1,
                                                '& .MuiChip-icon': {
                                                    color: app.color,
                                                }
                                            }}
                                        />
                                    )}

                                    <CardContent sx={{ p: 3, textAlign: 'center', position: 'relative' }}>
                                        {/* Icon Container */}
                                        <Box
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                margin: '0 auto 20px',
                                                borderRadius: 3,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: hoveredIndex === index ? app.bgColor : '#f8f9fa',
                                                border: `3px solid ${hoveredIndex === index ? app.color : 'transparent'}`,
                                                transition: 'all 0.4s ease',
                                                position: 'relative',
                                            }}
                                        >
                                            <IconComponent
                                                sx={{
                                                    fontSize: 40,
                                                    color: hoveredIndex === index ? app.color : '#6c757d',
                                                    transition: 'all 0.4s ease',
                                                    transform: hoveredIndex === index ? 'scale(1.1)' : 'scale(1)',
                                                }}
                                            />
                                        </Box>

                                        {/* Text Content */}
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 700,
                                                color: '#232f3e',
                                                mb: 1,
                                                fontSize: '1.1rem',
                                            }}
                                        >
                                            {app.name}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#6c757d',
                                                mb: 2,
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            {app.description}
                                        </Typography>

                                        {/* Arrow Icon */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 1,
                                                opacity: hoveredIndex === index ? 1 : 0,
                                                transition: 'opacity 0.3s ease',
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: app.color,
                                                }}
                                            >
                                                Configure
                                            </Typography>
                                            <ArrowForwardIcon sx={{ fontSize: 18, color: app.color }} />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Container>
        </Box>
    )
}
