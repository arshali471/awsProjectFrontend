import { useEffect, useState } from 'react'
import { AdminService } from '../services/admin.service'
import toast from 'react-hot-toast'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    IconButton,
    Button,
    CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface IViewYmlContentModal {
    show: boolean;
    handleClose: () => void;
    eksTokenId: string | null;
}

export default function ViewYmlContentModal({ show, handleClose, eksTokenId }: IViewYmlContentModal) {
    const [ymlContent, setYmlContent] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const fetchYmlContent = async () => {
        if (!eksTokenId) return;

        setLoading(true);
        try {
            const res = await AdminService.getEKSTokenContent(eksTokenId);
            if (res.status === 200) {
                // Decode the base64 encoded content
                const decodedContent = atob(res.data.content || '');
                setYmlContent(decodedContent);
                setFileName(res.data.fileName || 'config.yml');
            }
        } catch (err: any) {
            toast.error(err.response?.data || 'Failed to fetch YML content');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(ymlContent)
            .then(() => toast.success('Copied to clipboard!'))
            .catch(() => toast.error('Failed to copy'));
    };

    useEffect(() => {
        if (show && eksTokenId) {
            fetchYmlContent();
        } else {
            setYmlContent('');
            setFileName('');
        }
    }, [show, eksTokenId]);

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
                                width: 48,
                                height: 48,
                                background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                            }}
                        >
                            <DescriptionIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#232f3e' }}>
                                View Configuration File
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6c757d', mt: 0.5 }}>
                                {fileName}
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
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box
                        sx={{
                            position: 'relative',
                            background: '#f5f7fa',
                            borderRadius: '12px',
                            p: 2,
                            border: '1px solid #e0e0e0',
                        }}
                    >
                        <IconButton
                            size="small"
                            onClick={copyToClipboard}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                background: 'white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                '&:hover': {
                                    background: '#0073bb',
                                    color: 'white',
                                }
                            }}
                        >
                            <ContentCopyIcon fontSize="small" />
                        </IconButton>
                        <pre
                            style={{
                                margin: 0,
                                fontFamily: 'monospace',
                                fontSize: '13px',
                                lineHeight: '1.6',
                                color: '#232f3e',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all',
                                maxHeight: '400px',
                                overflow: 'auto',
                            }}
                        >
                            {ymlContent || 'No content available'}
                        </pre>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 2 }}>
                <Button
                    onClick={handleClose}
                    variant="contained"
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #005a9e 0%, #0073bb 100%)',
                        }
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
}
