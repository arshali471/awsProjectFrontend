import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { AdminService } from "../../../services/admin.service";
import toast from "react-hot-toast";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button as MuiButton,
    IconButton,
    InputAdornment,
} from "@mui/material";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BlockIcon from "@mui/icons-material/Block";
import PublicIcon from "@mui/icons-material/Public";
import KeyIcon from "@mui/icons-material/Key";
import SettingsIcon from "@mui/icons-material/Settings";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AddIcon from "@mui/icons-material/Add";

export default function AddAWSKey() {

    const navigate = useNavigate();


    const [data, setData] = useState<any>({});
    const [region, setRegion] = useState<any>();
    const [isAllowed, setIsAllowed] = useState<boolean>(false);
    const [showSecretKey, setShowSecretKey] = useState(false);

    const handleChangeValue = (e: any) => {
        setData({ ...data, [e.target.name]: e.target.value })
    }


    const getAwsRegion = async () => {
        await AdminService.getAwsRegion().then((res) => {
            if (res.status === 200) {
                setRegion(Object.values(res.data).map((data: any) => {
                    return {
                        label: data,
                        value: data
                    }
                }))
            }
        })
    }

    const getUserData = async () => {
        try {
            // Check sessionStorage first
            const userRole = sessionStorage.getItem('role');
            if (userRole === 'admin') {
                setIsAllowed(true);
                return;
            }

            // Fallback to API call
            const res = await AdminService.getUserData();
            if (res.status === 200) {
                if (res.data.addAWSKey) {
                    setIsAllowed(true)
                }
            } else {
                console.error(`Failed to fetch user data. Status: ${res.status}`);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };



    const handleAWSKeySubmission = async () => {
        let payload = {
            region: data?.region?.value,
            accessKeyId: data?.accessKeyId,
            secretAccessKey: data?.secretAccessKey,
            enviroment: data?.enviroment
        }
        await AdminService.createAWSKey(payload).then((res) => {
            if (res.status === 200) {
                toast.success("Key Created")
                setData({
                    region: "",
                    accessKeyId: "",
                    secretAccessKey: "",
                    enviroment: ""
                })
            }
        }).catch(err => {
            toast.error(err.response.data)
        })
    }

    useEffect(() => {
        getUserData();
    }, [])

    useEffect(() => {
        if (isAllowed) {
            getAwsRegion();
        }
    }, [isAllowed])




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
                {isAllowed ? (
                    <>
                        {/* Page Header */}
                        <Box sx={{ mb: 4 }}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <IconButton
                                    onClick={() => navigate(-1)}
                                    sx={{
                                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                        color: 'white',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #218838 0%, #1ea87a 100%)',
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
                                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        boxShadow: '0 4px 16px rgba(40, 167, 69, 0.3)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 20px rgba(40, 167, 69, 0.4)',
                                        }
                                    }}
                                >
                                    <VpnKeyIcon sx={{ fontSize: 32 }} />
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
                                        Add AWS Key
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#6c757d',
                                            mt: 0.5,
                                        }}
                                    >
                                        Configure AWS access credentials
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Form Card */}
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: '16px',
                                border: '1px solid rgba(0, 0, 0, 0.06)',
                                overflow: 'hidden',
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                            }}
                        >
                            <Box sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    {/* Region */}
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={600} mb={1} color="#232f3e">
                                            Region *
                                        </Typography>
                                        <Select
                                            options={region}
                                            onChange={(e: any) => setData({ ...data, region: e })}
                                            value={data?.region}
                                            placeholder="Select AWS Region"
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderRadius: '12px',
                                                    border: '1px solid #e0e0e0',
                                                    padding: '4px',
                                                    '&:hover': {
                                                        borderColor: '#28a745',
                                                    }
                                                }),
                                                menuPortal: (base) => ({
                                                    ...base,
                                                    zIndex: 9999,
                                                }),
                                            }}
                                        />
                                    </Box>

                                    {/* Access Key ID */}
                                    <TextField
                                        fullWidth
                                        required
                                        label="Access Key ID"
                                        name="accessKeyId"
                                        value={data?.accessKeyId || ''}
                                        onChange={handleChangeValue}
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
                                        required
                                        label="Secret Access Key"
                                        name="secretAccessKey"
                                        type={showSecretKey ? "text" : "password"}
                                        value={data?.secretAccessKey || ''}
                                        onChange={handleChangeValue}
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
                                        required
                                        label="Environment"
                                        name="enviroment"
                                        value={data?.enviroment || ''}
                                        onChange={handleChangeValue}
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

                                    {/* Submit Button */}
                                    <MuiButton
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={handleAWSKeySubmission}
                                        sx={{
                                            borderRadius: '10px',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            py: 1.5,
                                            mt: 2,
                                            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                            boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #218838 0%, #1ea87a 100%)',
                                                boxShadow: '0 6px 16px rgba(40, 167, 69, 0.4)',
                                            }
                                        }}
                                    >
                                        Add AWS Key
                                    </MuiButton>
                                </Box>
                            </Box>
                        </Paper>
                    </>
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '70vh',
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                p: 6,
                                borderRadius: '24px',
                                textAlign: 'center',
                                border: '2px solid rgba(220, 53, 69, 0.2)',
                                background: 'linear-gradient(135deg, #ffffff 0%, #fff5f5 100%)',
                                boxShadow: '0 8px 32px rgba(220, 53, 69, 0.15)',
                                maxWidth: 500,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 120,
                                    height: 120,
                                    margin: '0 auto 24px',
                                    background: 'linear-gradient(135deg, #dc3545 0%, #e4606d 100%)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    boxShadow: '0 8px 24px rgba(220, 53, 69, 0.3)',
                                }}
                            >
                                <BlockIcon sx={{ fontSize: 64 }} />
                            </Box>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    color: '#232f3e',
                                    mb: 2,
                                }}
                            >
                                Access Denied
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#6c757d',
                                    mb: 1,
                                    fontSize: '1.1rem',
                                }}
                            >
                                You don't have permission to access this page.
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#dc3545',
                                    mb: 4,
                                    fontWeight: 600,
                                }}
                            >
                                Only administrators can manage AWS keys.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                <MuiButton
                                    variant="outlined"
                                    startIcon={<ArrowBackIcon />}
                                    onClick={() => navigate(-1)}
                                    sx={{
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: 3,
                                        py: 1.2,
                                        borderColor: '#e0e0e0',
                                        color: '#6c757d',
                                        '&:hover': {
                                            borderColor: '#bdbdbd',
                                            background: 'rgba(0, 0, 0, 0.02)',
                                        }
                                    }}
                                >
                                    Go Back
                                </MuiButton>
                                <MuiButton
                                    variant="contained"
                                    onClick={() => navigate('/dashboard')}
                                    sx={{
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: 3,
                                        py: 1.2,
                                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                        boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #218838 0%, #1aa179 100%)',
                                            boxShadow: '0 6px 16px rgba(40, 167, 69, 0.4)',
                                        }
                                    }}
                                >
                                    Go to Dashboard
                                </MuiButton>
                            </Box>
                        </Paper>
                    </Box>
                )}
            </Container>
        </Box>
    )
}