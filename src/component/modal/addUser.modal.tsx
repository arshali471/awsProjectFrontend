import { useState } from "react";
import { AdminService } from "../services/admin.service";
import toast from "react-hot-toast";
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Divider,
    InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";

interface IAddUserModal {
    show: any,
    handleClose: any,
    reload?: () => void
}

export default function AddUserModal({ show, handleClose, reload }: IAddUserModal) {

    const [data, setData] = useState<any>({});
    const [showPassword, setShowPassword] = useState(false);

    const handleChangeValue = (e: any) => {
        setData({ ...data, [e.target.name]: e.target.value })
    }

    const handleToggleValue = (e: any) => {
        setData({ ...data, [e.target.name]: e.target.checked })
    }

    const handleUserSubmission = async () => {
        if (!data?.username || !data?.password || !data?.email) {
            toast.error("Please fill all required fields (username, email, password)");
            return;
        }

        await AdminService.createUser(data).then((res) => {
            if (res.status === 200) {
                setData({});
                handleClose();
                toast.success("User Created Successfully");
                if (reload) {
                    reload();
                }
            }
        }).catch(err => {
            toast.error(err.response.data)
        })
    }

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
                    pt: 8,
                    px: 3,
                    pb: 3,
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
                            <PersonAddIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    color: '#232f3e',
                                }}
                            >
                                Add New User
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#6c757d',
                                    mt: 0.5,
                                }}
                            >
                                Create a new user account
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
                    {/* Username */}
                    <TextField
                        fullWidth
                        required
                        label="Username"
                        name="username"
                        value={data?.username || ''}
                        onChange={handleChangeValue}
                        placeholder="Enter username"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <AccountCircleIcon sx={{ color: '#6c757d' }} />
                                </InputAdornment>
                            ),
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

                    {/* Email */}
                    <TextField
                        fullWidth
                        required
                        label="Email"
                        name="email"
                        type="email"
                        value={data?.email || ''}
                        onChange={handleChangeValue}
                        placeholder="Enter email address"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailIcon sx={{ color: '#6c757d' }} />
                                </InputAdornment>
                            ),
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

                    {/* Password */}
                    <TextField
                        fullWidth
                        required
                        label="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={data?.password || ''}
                        onChange={handleChangeValue}
                        placeholder="Enter password"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon sx={{ color: '#6c757d' }} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                        sx={{ color: '#6c757d' }}
                                    >
                                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                </InputAdornment>
                            ),
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

                    <Divider sx={{ my: 1 }} />

                    {/* Permissions Section */}
                    <Typography variant="subtitle1" fontWeight={600} color="#232f3e">
                        Permissions
                    </Typography>

                    <Box
                        sx={{
                            background: 'white',
                            borderRadius: '12px',
                            p: 2,
                            border: '1px solid rgba(0, 0, 0, 0.06)',
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Switch
                                    name="addAWSKey"
                                    onChange={handleToggleValue}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#0073bb',
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: '#0073bb',
                                        },
                                    }}
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body1" fontWeight={500}>
                                        Add AWS Key
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Allow user to manage AWS credentials
                                    </Typography>
                                </Box>
                            }
                        />
                    </Box>

                    <Box
                        sx={{
                            background: 'white',
                            borderRadius: '12px',
                            p: 2,
                            border: '1px solid rgba(0, 0, 0, 0.06)',
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Switch
                                    name="addUser"
                                    onChange={handleToggleValue}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#0073bb',
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: '#0073bb',
                                        },
                                    }}
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body1" fontWeight={500}>
                                        Add Users
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Allow user to create and manage other users
                                    </Typography>
                                </Box>
                            }
                        />
                    </Box>

                    <Box
                        sx={{
                            background: 'white',
                            borderRadius: '12px',
                            p: 2,
                            border: '1px solid rgba(0, 0, 0, 0.06)',
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Switch
                                    name="addDocument"
                                    onChange={handleToggleValue}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#0073bb',
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: '#0073bb',
                                        },
                                    }}
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body1" fontWeight={500}>
                                        Upload Documentation
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Allow user to upload files in documentation section
                                    </Typography>
                                </Box>
                            }
                        />
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
                    onClick={handleUserSubmission}
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
                    Create User
                </Button>
            </Box>
        </Drawer>
    )
}