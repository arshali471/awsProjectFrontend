import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button as MuiButton,
    Typography,
    Box,
    IconButton,
    Chip,
    Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ApiIcon from '@mui/icons-material/Api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CodeIcon from '@mui/icons-material/Code';
import moment from 'moment';

interface IApiLogDetailsModal {
    show: boolean;
    handleClose: () => void;
    logData: any;
}

export default function ApiLogDetailsModal({ show, handleClose, logData }: IApiLogDetailsModal) {
    if (!logData) return null;

    const isSuccess = logData.statusCode >= 200 && logData.statusCode < 300;
    const isClientError = logData.statusCode >= 400 && logData.statusCode < 500;
    const isServerError = logData.statusCode >= 500;

    const getStatusColor = () => {
        if (isSuccess) return '#28a745';
        if (isClientError) return '#ffc107';
        if (isServerError) return '#dc3545';
        return '#6c757d';
    };

    const getMethodColor = (method: string) => {
        const colors: any = {
            'GET': '#0073bb',
            'POST': '#28a745',
            'PUT': '#ffc107',
            'DELETE': '#dc3545',
            'PATCH': '#17a2b8'
        };
        return colors[method] || '#6c757d';
    };

    return (
        <Dialog
            open={show}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                }
            }}
        >
            <DialogTitle sx={{ p: 3, pb: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                background: `linear-gradient(135deg, ${getStatusColor()} 0%, ${getStatusColor()}dd 100%)`,
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                            }}
                        >
                            <ApiIcon sx={{ fontSize: 32 }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#232f3e' }}>
                                API Log Details
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6c757d', mt: 0.5 }}>
                                {moment(logData.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={handleClose}
                        sx={{
                            color: '#6c757d',
                            '&:hover': {
                                background: 'rgba(0, 0, 0, 0.04)',
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3, pt: 2 }}>
                {/* Request Information */}
                <Box mb={3}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e', mb: 2 }}>
                        Request Information
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                        {/* Method and Status */}
                        <Box display="flex" gap={2} flexWrap="wrap">
                            <Chip
                                label={logData.method}
                                sx={{
                                    background: `${getMethodColor(logData.method)}20`,
                                    color: getMethodColor(logData.method),
                                    fontWeight: 700,
                                    fontSize: '0.875rem',
                                    height: 32,
                                }}
                            />
                            <Chip
                                icon={isSuccess ? <CheckCircleIcon /> : <ErrorIcon />}
                                label={`${logData.statusCode} ${isSuccess ? 'Success' : isClientError ? 'Client Error' : 'Server Error'}`}
                                sx={{
                                    background: `${getStatusColor()}20`,
                                    color: getStatusColor(),
                                    fontWeight: 700,
                                    fontSize: '0.875rem',
                                    height: 32,
                                }}
                            />
                            <Chip
                                icon={<AccessTimeIcon />}
                                label={`${logData.responseTime || 0} ms`}
                                sx={{
                                    background: 'rgba(0, 115, 187, 0.1)',
                                    color: '#0073bb',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    height: 32,
                                }}
                            />
                        </Box>

                        {/* Endpoint */}
                        <Box
                            sx={{
                                background: '#f8f9fa',
                                p: 2,
                                borderRadius: '8px',
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                color: '#232f3e',
                                wordBreak: 'break-all',
                            }}
                        >
                            {logData.endpoint}
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* User Information */}
                <Box mb={3}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e', mb: 2 }}>
                        User Information
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1.5}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <PersonIcon sx={{ color: '#6c757d', fontSize: 20 }} />
                            <Typography variant="body2" sx={{ color: '#232f3e' }}>
                                <strong>Username:</strong> {logData.username || 'N/A'}
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <LocationOnIcon sx={{ color: '#6c757d', fontSize: 20 }} />
                            <Typography variant="body2" sx={{ color: '#232f3e' }}>
                                <strong>IP Address:</strong> {logData.ipAddress || 'N/A'}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Request Body */}
                {logData.requestBody && Object.keys(logData.requestBody).length > 0 && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Box mb={3}>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <CodeIcon sx={{ color: '#6c757d', fontSize: 20 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e' }}>
                                    Request Body
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    background: '#f8f9fa',
                                    p: 2,
                                    borderRadius: '8px',
                                    fontFamily: 'monospace',
                                    fontSize: '0.813rem',
                                    color: '#232f3e',
                                    overflowX: 'auto',
                                    maxHeight: '300px',
                                    border: '1px solid #e9ecef',
                                }}
                            >
                                <pre style={{ margin: 0 }}>
                                    {JSON.stringify(logData.requestBody, null, 2)}
                                </pre>
                            </Box>
                        </Box>
                    </>
                )}

                {/* Error Message */}
                {logData.errorMessage && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <ErrorIcon sx={{ color: '#dc3545', fontSize: 20 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#dc3545' }}>
                                    Error Message
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    background: 'rgba(220, 53, 69, 0.1)',
                                    p: 2,
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    color: '#dc3545',
                                    border: '1px solid rgba(220, 53, 69, 0.2)',
                                }}
                            >
                                {logData.errorMessage}
                            </Box>
                        </Box>
                    </>
                )}

                {/* User Agent */}
                {logData.userAgent && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e', mb: 1 }}>
                                User Agent
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#6c757d',
                                    fontSize: '0.813rem',
                                    wordBreak: 'break-all',
                                }}
                            >
                                {logData.userAgent}
                            </Typography>
                        </Box>
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 2 }}>
                <MuiButton
                    onClick={handleClose}
                    variant="contained"
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #005a92 0%, #0073bb 100%)',
                        }
                    }}
                >
                    Close
                </MuiButton>
            </DialogActions>
        </Dialog>
    );
}
