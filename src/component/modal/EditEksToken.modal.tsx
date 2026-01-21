import { useEffect, useState } from 'react'
import { AdminService } from '../services/admin.service'
import toast from 'react-hot-toast'
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    TextField,
    Button,
    CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';

interface IEditEksTokenModal {
    show: boolean;
    handleClose: () => void;
    reload: () => void;
    eksData: any
}

export default function EditEksTokenModal({ show, handleClose, reload, eksData }: IEditEksTokenModal) {

    const [data, setData] = useState<any>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [ymlFile, setYmlFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>('');

    const handleChangeValue = (e: any) => {
        setData({ ...data, [e.target.name]: e.target.value })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const fileNameLower = file.name.toLowerCase();

            // Validate file extension
            if (!fileNameLower.endsWith('.yml') && !fileNameLower.endsWith('.yaml')) {
                toast.error('Only YML/YAML files are allowed');
                e.target.value = '';
                return;
            }

            setYmlFile(file);
            setFileName(file.name);
        }
    }

    const handleUpdateEksToken = async () => {
        if (!data?.clusterName) {
            toast.error('Please provide cluster name');
            return;
        }

        const formData = new FormData();
        formData.append('clusterName', data.clusterName);
        if (ymlFile) formData.append('ymlFile', ymlFile);

        try {
            const res = await AdminService.updateEKSToken(data?._id, formData);
            if (res.status === 200) {
                toast.success('EKS Token updated successfully');
                setYmlFile(null);
                setFileName('');
                handleClose();
                reload();
            }
        } catch (err: any) {
            toast.error(err.response?.data || 'Failed to update EKS token');
        }
    }

    useEffect(() => {
        if (eksData) {
            setData(eksData);
        }
    }, [eksData])

    return (
        <Drawer
            anchor="right"
            open={show}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 500 },
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
                }
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                }}
            >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
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
                            <EditIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#232f3e' }}>
                                Edit EKS Token
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6c757d', mt: 0.5 }}>
                                Update EKS cluster access
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
            </Box>

            {/* Form Content */}
            <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Cluster Name */}
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600} mb={1} color="#232f3e" display="flex" alignItems="center" gap={1}>
                            <AccountTreeIcon sx={{ fontSize: 18, color: '#0073bb' }} />
                            Cluster Name *
                        </Typography>
                        <TextField
                            fullWidth
                            required
                            name="clusterName"
                            value={data?.clusterName || ''}
                            onChange={handleChangeValue}
                            placeholder="Enter cluster name (e.g., my-eks-cluster)"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    background: 'white',
                                    '&:hover fieldset': {
                                        borderColor: '#0073bb',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#0073bb',
                                        borderWidth: '2px',
                                    }
                                }
                            }}
                        />
                    </Box>

                    {/* YML File Upload */}
                    <Box
                        sx={{
                            p: 3,
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                            borderRadius: '12px',
                            border: '1px solid rgba(0, 115, 187, 0.2)',
                        }}
                    >
                        <Typography variant="subtitle2" fontWeight={600} mb={2} color="#232f3e" display="flex" alignItems="center" gap={1}>
                            <CloudUploadIcon sx={{ fontSize: 18, color: '#0073bb' }} />
                            Configuration File (Optional)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            Upload a new YML/YAML configuration file to replace the existing one
                        </Typography>

                        <Box
                            sx={{
                                border: '2px dashed #e0e0e0',
                                borderRadius: '12px',
                                p: 3,
                                textAlign: 'center',
                                background: 'white',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    borderColor: '#0073bb',
                                    background: 'rgba(0, 115, 187, 0.05)',
                                }
                            }}
                        >
                            <input
                                type="file"
                                id="yml-file-upload-edit"
                                accept=".yml,.yaml"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="yml-file-upload-edit" style={{ cursor: 'pointer', display: 'block' }}>
                                {ymlFile ? (
                                    <Box>
                                        <DescriptionIcon sx={{ fontSize: 48, color: '#28a745', mb: 1 }} />
                                        <Typography variant="body1" fontWeight={600} color="#232f3e">
                                            {fileName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Click to change file
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box>
                                        <CloudUploadIcon sx={{ fontSize: 48, color: '#6c757d', mb: 1 }} />
                                        <Typography variant="body1" fontWeight={600} color="#232f3e">
                                            Click to upload new YML file
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Leave empty to keep existing configuration
                                        </Typography>
                                    </Box>
                                )}
                            </label>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Footer Actions */}
            <Box
                sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                    display: 'flex',
                    gap: 2,
                }}
            >
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleClose}
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1.2,
                        borderColor: '#e0e0e0',
                        color: '#6c757d',
                        '&:hover': {
                            borderColor: '#bdbdbd',
                            background: 'rgba(0, 0, 0, 0.02)',
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleUpdateEksToken}
                    disabled={loading}
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1.2,
                        background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                        boxShadow: '0 4px 12px rgba(0, 115, 187, 0.3)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #005a9e 0%, #0073bb 100%)',
                            boxShadow: '0 6px 16px rgba(0, 115, 187, 0.4)',
                        }
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Token'}
                </Button>
            </Box>
        </Drawer>
    )
}
