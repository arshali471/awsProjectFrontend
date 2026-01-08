import { Box, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    rightContent?: React.ReactNode;
    showBackButton?: boolean;
}

export default function PageHeader({
    icon,
    title,
    subtitle,
    rightContent,
    showBackButton = true
}: PageHeaderProps) {
    const navigate = useNavigate();

    return (
        <Box sx={{ mb: 3 }}>
            <Box display="flex" alignItems="center" gap={2} justifyContent="space-between" flexWrap="wrap">
                <Box display="flex" alignItems="center" gap={2}>
                    {showBackButton && (
                        <IconButton
                            onClick={() => navigate(-1)}
                            sx={{
                                background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                                color: 'white',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #005a9e 0%, #0073bb 100%)',
                                    transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    )}
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            boxShadow: '0 4px 16px rgba(0, 115, 187, 0.3)',
                        }}
                    >
                        {icon}
                    </Box>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 0.5 }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {rightContent && (
                    <Box display="flex" alignItems="center" gap={2}>
                        {rightContent}
                    </Box>
                )}
            </Box>
        </Box>
    );
}
