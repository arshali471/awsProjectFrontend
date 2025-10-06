import { useEffect, useState } from "react";
import { AdminService } from "../services/admin.service";
import toast from "react-hot-toast";
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    TextField,
    Button,
    Divider,
    InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import PublicIcon from "@mui/icons-material/Public";
import KeyIcon from "@mui/icons-material/Key";
import SettingsIcon from "@mui/icons-material/Settings";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

interface IAddUserModal {
    show: any,
    handleClose: any,
    awsData: any,
}

export default function EditAWSKey({ show, handleClose, awsData }: IAddUserModal) {

    const [data, setData] = useState<any>({});
    const [showSecretKey, setShowSecretKey] = useState(false);

    const handleEditSubmisssion = async (awsId: any) => {
        if (!data?.region || !data?.accessKeyId || !data?.secretAccessKey || !data?.enviroment) {
            toast.error("Please fill all fields");
            return;
        }

        await AdminService.updateAwsKey(awsId, data).then((res) => {
            if (res.status === 200) {
                handleClose();
                toast.success("AWS Key Updated Successfully")
            }
        }).catch(err => {
            toast.error(err.response.data)
        })
    }

    useEffect(() => {
        setData(awsData);
    }, [show])


    return (
        <Drawer
            anchor="right"
            open={show}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 480 },
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
                                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                            }}
                        >
                            <VpnKeyIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    color: '#232f3e',
                                }}
                            >
                                Edit AWS Key
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#6c757d',
                                    mt: 0.5,
                                }}
                            >
                                Update AWS credentials
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
                    {/* Region */}
                    <TextField
                        fullWidth
                        label="Region"
                        value={data?.region || ''}
                        onChange={(e) => setData({ ...data, region: e.target.value })}
                        placeholder="e.g., us-east-1"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PublicIcon sx={{ color: '#6c757d' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                background: 'white',
                                '&:hover fieldset': {
                                    borderColor: '#28a745',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#28a745',
                                    borderWidth: '2px',
                                }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#28a745',
                            }
                        }}
                    />

                    {/* Access Key ID */}
                    <TextField
                        fullWidth
                        label="Access Key ID"
                        value={data?.accessKeyId || ''}
                        onChange={(e) => setData({ ...data, accessKeyId: e.target.value })}
                        placeholder="Enter Access Key ID"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <KeyIcon sx={{ color: '#6c757d' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                background: 'white',
                                '&:hover fieldset': {
                                    borderColor: '#28a745',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#28a745',
                                    borderWidth: '2px',
                                }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#28a745',
                            }
                        }}
                    />

                    {/* Secret Access Key */}
                    <TextField
                        fullWidth
                        label="Secret Access Key"
                        type={showSecretKey ? "text" : "password"}
                        value={data?.secretAccessKey || ''}
                        onChange={(e) => setData({ ...data, secretAccessKey: e.target.value })}
                        placeholder="Enter Secret Access Key"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <VpnKeyIcon sx={{ color: '#6c757d' }} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowSecretKey(!showSecretKey)}
                                        edge="end"
                                        sx={{ color: '#6c757d' }}
                                    >
                                        {showSecretKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                background: 'white',
                                '&:hover fieldset': {
                                    borderColor: '#28a745',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#28a745',
                                    borderWidth: '2px',
                                }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#28a745',
                            }
                        }}
                    />

                    {/* Environment */}
                    <TextField
                        fullWidth
                        label="Environment"
                        value={data?.enviroment || ''}
                        onChange={(e) => setData({ ...data, enviroment: e.target.value })}
                        placeholder="e.g., Production, Staging"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SettingsIcon sx={{ color: '#6c757d' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                background: 'white',
                                '&:hover fieldset': {
                                    borderColor: '#28a745',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#28a745',
                                    borderWidth: '2px',
                                }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#28a745',
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
                    onClick={() => handleEditSubmisssion(data?._id)}
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1.2,
                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                        boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #218838 0%, #1ea87a 100%)',
                            boxShadow: '0 6px 16px rgba(40, 167, 69, 0.4)',
                        }
                    }}
                >
                    Update Key
                </Button>
            </Box>
        </Drawer>
    )
}