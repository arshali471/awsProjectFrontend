// @ts-nocheck
import { useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Grid, Chip, IconButton } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import BuildIcon from '@mui/icons-material/Build';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

import JenkinsImage from "../../../../assets/jenkins.png";
import AnsibleImage from "../../../../assets/ansible.png";
import GitLabImage from "../../../../assets/gitLab.png";
import NexusImage from "../../../../assets/nexus.png";

export default function DevopsIndex() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const navigate = useNavigate();

    const handleNavigate = (url: string) => {
        window.open(url, "_blank");
    };

    const apps = [
        {
            url: "https://jenkins-prod.iff.com",
            name: "Jenkins Production",
            icon: JenkinsImage,
            description: "CI/CD Pipeline",
            category: "Build",
            color: "#D24939",
            bgColor: "rgba(210, 73, 57, 0.1)"
        },
        {
            url: "https://jenkins-ca-nonprod.global.iff.com",
            name: "Jenkins Non-Prod",
            icon: JenkinsImage,
            description: "Development Pipeline",
            category: "Build",
            color: "#D24939",
            bgColor: "rgba(210, 73, 57, 0.1)"
        },
        {
            url: "https://awx.iff.com",
            name: "AWX Tower",
            icon: AnsibleImage,
            description: "Automation Platform",
            category: "Deploy",
            color: "#EE0000",
            bgColor: "rgba(238, 0, 0, 0.1)"
        },
        {
            url: "https://gitlab.com/danisco-nutrition-and-biosciences/iff-cloud-engineering",
            name: "GitLab",
            icon: GitLabImage,
            description: "Source Control",
            category: "Code",
            color: "#FC6D26",
            bgColor: "rgba(252, 109, 38, 0.1)"
        },
        {
            url: "http://nexus.iff.com",
            name: "Nexus Repository",
            icon: NexusImage,
            description: "Artifact Storage",
            category: "Artifacts",
            color: "#00A95C",
            bgColor: "rgba(0, 169, 92, 0.1)"
        },
    ];

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
                py: 4,
                px: 3,
            }}
        >
            <Container maxWidth="lg">
                {/* Header Section with Back Button */}
                <Box sx={{ mb: 4 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        {/* Back Button */}
                        <IconButton
                            onClick={() => navigate('/dashboard')}
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                width: 48,
                                height: 48,
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                    transform: 'translateX(-4px)',
                                    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                                }
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
                            <BuildIcon sx={{ fontSize: 32 }} />
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
                                DevOps Tools
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#6c757d',
                                    mt: 0.5,
                                }}
                            >
                                Access your development and deployment tools
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Apps Grid */}
                <Grid container spacing={4} justifyContent="center">
                    {apps.map((app, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card
                                elevation={hoveredIndex === index ? 12 : 1}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                onClick={() => handleNavigate(app.url)}
                                sx={{
                                    height: '100%',
                                    cursor: 'pointer',
                                    borderRadius: 4,
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transform: hoveredIndex === index ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',
                                    background: 'white',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    border: `2px solid ${hoveredIndex === index ? app.color : 'transparent'}`,
                                    '&:hover': {
                                        boxShadow: `0 20px 40px ${app.bgColor}`,
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
                                {/* Category Badge */}
                                <Chip
                                    label={app.category}
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        top: 16,
                                        right: 16,
                                        bgcolor: app.bgColor,
                                        color: app.color,
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                        border: `1px solid ${app.color}33`,
                                        zIndex: 1,
                                    }}
                                />

                                <CardContent sx={{ p: 4, textAlign: 'center', position: 'relative' }}>
                                    {/* Icon Container */}
                                    <Box
                                        sx={{
                                            width: 100,
                                            height: 100,
                                            margin: '0 auto 24px',
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
                                        <img
                                            src={app.icon}
                                            alt={app.name}
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                objectFit: 'contain',
                                                transition: 'transform 0.4s ease',
                                                transform: hoveredIndex === index ? 'scale(1.1)' : 'scale(1)',
                                            }}
                                        />
                                    </Box>

                                    {/* Text Content */}
                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                        color="text.primary"
                                        sx={{
                                            mb: 1,
                                            fontSize: '1.1rem',
                                        }}
                                    >
                                        {app.name}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mb: 3, fontSize: '0.9rem' }}
                                    >
                                        {app.description}
                                    </Typography>

                                    {/* Open Button */}
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 1,
                                            px: 3,
                                            py: 1,
                                            borderRadius: 2,
                                            bgcolor: hoveredIndex === index ? app.color : 'transparent',
                                            color: hoveredIndex === index ? 'white' : app.color,
                                            border: `2px solid ${app.color}`,
                                            fontWeight: 600,
                                            transition: 'all 0.3s ease',
                                            transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
                                        }}
                                    >
                                        <Typography variant="body2" fontWeight={700} fontSize="0.85rem">
                                            Open Tool
                                        </Typography>
                                        <LaunchIcon sx={{ fontSize: 18 }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Stats Section */}
                <Box sx={{ mt: 5 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Card
                                elevation={2}
                                sx={{
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h3" fontWeight={700}>
                                        {apps.length}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                                        Available Tools
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card
                                elevation={2}
                                sx={{
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                    color: 'white',
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h3" fontWeight={700}>
                                        24/7
                                    </Typography>
                                    <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                                        System Availability
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card
                                elevation={2}
                                sx={{
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                    color: 'white',
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h3" fontWeight={700}>
                                        100%
                                    </Typography>
                                    <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                                        Cloud Native
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
}
