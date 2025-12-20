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
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import PublicIcon from "@mui/icons-material/Public";
import SettingsIcon from "@mui/icons-material/Settings";

interface IAddUserModal {
    show: any,
    handleClose: any,
    awsData: any,
}

export default function EditAWSKey({ show, handleClose, awsData }: IAddUserModal) {

    const [data, setData] = useState<any>({});

    // AWS Regions list - All available regions
    const awsRegions = [
        // US Regions
        { value: 'us-east-1', label: 'US East (N. Virginia)' },
        { value: 'us-east-2', label: 'US East (Ohio)' },
        { value: 'us-west-1', label: 'US West (N. California)' },
        { value: 'us-west-2', label: 'US West (Oregon)' },

        // Asia Pacific Regions
        { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' },
        { value: 'ap-south-2', label: 'Asia Pacific (Hyderabad)' },
        { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
        { value: 'ap-northeast-2', label: 'Asia Pacific (Seoul)' },
        { value: 'ap-northeast-3', label: 'Asia Pacific (Osaka)' },
        { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
        { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
        { value: 'ap-southeast-3', label: 'Asia Pacific (Jakarta)' },
        { value: 'ap-southeast-4', label: 'Asia Pacific (Melbourne)' },
        { value: 'ap-east-1', label: 'Asia Pacific (Hong Kong)' },

        // Canada Regions
        { value: 'ca-central-1', label: 'Canada (Central)' },
        { value: 'ca-west-1', label: 'Canada (Calgary)' },

        // Europe Regions
        { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
        { value: 'eu-central-2', label: 'Europe (Zurich)' },
        { value: 'eu-west-1', label: 'Europe (Ireland)' },
        { value: 'eu-west-2', label: 'Europe (London)' },
        { value: 'eu-west-3', label: 'Europe (Paris)' },
        { value: 'eu-north-1', label: 'Europe (Stockholm)' },
        { value: 'eu-south-1', label: 'Europe (Milan)' },
        { value: 'eu-south-2', label: 'Europe (Spain)' },

        // South America Regions
        { value: 'sa-east-1', label: 'South America (São Paulo)' },

        // Middle East Regions
        { value: 'me-south-1', label: 'Middle East (Bahrain)' },
        { value: 'me-central-1', label: 'Middle East (UAE)' },

        // Africa Regions
        { value: 'af-south-1', label: 'Africa (Cape Town)' },

        // Israel Region
        { value: 'il-central-1', label: 'Israel (Tel Aviv)' },
    ];

    const handleEditSubmisssion = async (awsId: any) => {
        if (!data?.region || !data?.enviroment) {
            toast.error("Please fill all fields");
            return;
        }

        // Only send region and environment for update
        const updatePayload = {
            region: data.region,
            enviroment: data.enviroment
        };

        await AdminService.updateAwsKey(awsId, updatePayload).then((res) => {
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
                                Update region and environment
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
                    <FormControl fullWidth>
                        <InputLabel
                            id="region-select-label"
                            sx={{
                                '&.Mui-focused': {
                                    color: '#28a745',
                                }
                            }}
                        >
                            Region
                        </InputLabel>
                        <Select
                            labelId="region-select-label"
                            value={data?.region || ''}
                            label="Region"
                            onChange={(e) => setData({ ...data, region: e.target.value })}
                            startAdornment={
                                <InputAdornment position="start">
                                    <PublicIcon sx={{ color: '#6c757d' }} />
                                </InputAdornment>
                            }
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 400,
                                    },
                                },
                            }}
                            sx={{
                                borderRadius: '12px',
                                background: 'white',
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#28a745',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#28a745',
                                    borderWidth: '2px',
                                }
                            }}
                        >
                            {awsRegions.map((region) => (
                                <MenuItem key={region.value} value={region.value}>
                                    {region.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Environment */}
                    <TextField
                        fullWidth
                        label="Environment"
                        value={data?.enviroment || ''}
                        onChange={(e) => setData({ ...data, enviroment: e.target.value })}
                        placeholder="e.g., CIPL, Production, Staging"
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