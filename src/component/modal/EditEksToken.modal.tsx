import React, { useEffect, useState } from 'react'
import { AdminService } from '../services/admin.service'
import toast from 'react-hot-toast'
import Select from 'react-select'
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    TextField,
    Button,
    Divider,
    CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MonitorIcon from '@mui/icons-material/Monitor';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

interface IEditEksTokenModal {
    show: boolean;
    handleClose: () => void;
    reload: () => void;
    eksData: any
}

export default function EditEksTokenModal({ show, handleClose, reload, eksData }: IEditEksTokenModal) {

    const [region, setRegion] = useState<any>();
    const [data, setData] = useState<any>({});
    const [clusterName, setClusterName] = useState<any>();
    const [environment, setEnvironment] = useState<any>();
    const [loading, setLoading] = useState<boolean>(false);

    const handleChangeValue = (e: any) => {
        setData({ ...data, [e.target.name]: e.target.value })
    }

    const getAllAwsKey = async () => {
        await AdminService.getAllAwsKey().then((res) => {
            if (res.status === 200) {
                setRegion(Object.values(res.data).map((data: any) => {
                    return {
                        label: `${data.enviroment} (${data.region})`,
                        value: data._id
                    }
                }))
            }
        }).catch(err => {
            toast.error(err.response?.data || 'Failed to get AWS key');
        })
    }

    const getClusterName = async () => {
        setLoading(true)
        await AdminService.getClusterName(environment).then((res) => {
            if (res.status === 200) {
                setClusterName(res.data?.map((data: any) => {
                    return {
                        label: data.name,
                        value: data.name
                    }
                }))
            }
        }).catch(err => {
            toast.error(err.response?.data || 'Failed to get cluster name');
        }).finally(() => {
            setLoading(false)
        })
    }

    const handleUpdateEksToken = async () => {
        if (!data?.clusterName || !data?.token) {
            toast.error('Please fill all required fields');
            return;
        }

        const payload = {
            clusterName: data?.clusterName,
            dashboardUrl: data?.dashboardUrl,
            monitoringUrl: data?.monitoringUrl,
            token: data?.token,
            keyId: environment
        }
        await AdminService.updateEKSToken(data?._id, payload).then((res) => {
            if (res.status === 200) {
                toast.success('EKS Token updated successfully');
                handleClose();
                reload();
            }
        }).catch(err => {
            toast.error(err.response?.data || 'Failed to update EKS token');
        })
    }

    useEffect(() => {
        if (environment) {
            getClusterName();
        }
    }, [environment])

    useEffect(() => {
        if (eksData) {
            setData(eksData);
            setEnvironment(eksData?.awsKeyId?._id);
        }
    }, [eksData])

    useEffect(() => {
        getAllAwsKey();
    }, [])

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
                    {/* Environment */}
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600} mb={1} color="#232f3e" display="flex" alignItems="center" gap={1}>
                            <SettingsIcon sx={{ fontSize: 18, color: '#0073bb' }} />
                            Environment *
                        </Typography>
                        <Select
                            options={region}
                            onChange={(e: any) => setEnvironment(e.value)}
                            value={region?.find((r: any) => r.value === environment)}
                            placeholder="Select Environment"
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    borderRadius: '12px',
                                    border: '1px solid #e0e0e0',
                                    padding: '6px',
                                    background: 'white',
                                    '&:hover': {
                                        borderColor: '#0073bb',
                                    }
                                }),
                            }}
                        />
                    </Box>

                    {/* Cluster Name */}
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600} mb={1} color="#232f3e" display="flex" alignItems="center" gap={1}>
                            <AccountTreeIcon sx={{ fontSize: 18, color: '#0073bb' }} />
                            Cluster Name *
                        </Typography>
                        <Select
                            options={clusterName}
                            onChange={(e: any) => setData({ ...data, clusterName: e.value })}
                            value={clusterName?.find((c: any) => c.value === data?.clusterName)}
                            placeholder="Select Cluster"
                            isDisabled={!environment}
                            isLoading={loading}
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    borderRadius: '12px',
                                    border: '1px solid #e0e0e0',
                                    padding: '6px',
                                    background: 'white',
                                    '&:hover': {
                                        borderColor: '#0073bb',
                                    }
                                }),
                            }}
                        />
                    </Box>

                    <Divider />

                    {/* Dashboard URL */}
                    <TextField
                        fullWidth
                        label="Dashboard URL"
                        name="dashboardUrl"
                        value={data?.dashboardUrl || ''}
                        onChange={handleChangeValue}
                        placeholder="https://dashboard.example.com"
                        InputProps={{
                            startAdornment: <DashboardIcon sx={{ color: '#6c757d', mr: 1 }} />,
                        }}
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
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#0073bb',
                            }
                        }}
                    />

                    {/* Monitoring URL */}
                    <TextField
                        fullWidth
                        label="Monitoring URL"
                        name="monitoringUrl"
                        value={data?.monitoringUrl || ''}
                        onChange={handleChangeValue}
                        placeholder="https://monitoring.example.com"
                        InputProps={{
                            startAdornment: <MonitorIcon sx={{ color: '#6c757d', mr: 1 }} />,
                        }}
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
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#0073bb',
                            }
                        }}
                    />

                    {/* Token */}
                    <TextField
                        fullWidth
                        required
                        label="Token"
                        name="token"
                        multiline
                        rows={5}
                        value={data?.token || ''}
                        onChange={handleChangeValue}
                        placeholder="Paste EKS token here..."
                        InputProps={{
                            startAdornment: <VpnKeyIcon sx={{ color: '#6c757d', mr: 1, alignSelf: 'flex-start', mt: 1 }} />,
                        }}
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
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#0073bb',
                            }
                        }}
                    />
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
