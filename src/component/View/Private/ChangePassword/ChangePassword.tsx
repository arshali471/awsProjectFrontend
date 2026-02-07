import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminService } from "../../../services/admin.service";
import toast from "react-hot-toast";
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button as MuiButton,
    IconButton,
    InputAdornment,
    Alert,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function ChangePassword() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState<any>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState<any>({});
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = () => {
        let newErrors: any = {};
        if (!formData.currentPassword) newErrors.currentPassword = "Required";
        if (!formData.newPassword) newErrors.newPassword = "Required";
        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const payload = {
            currentPassword: formData?.currentPassword,
            newPassword: formData?.confirmPassword
        }
        if (validate()) {
            await AdminService.changeUserPassword(payload).then((res) => {
                if (res.status === 200) {
                    toast.success("Password Changed")
                }
            }).catch(err => {
                toast.error(err.response.data)
            })
        }
    };

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
            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                {/* Page Header */}
                <Box sx={{ mb: 4 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <IconButton
                            onClick={() => navigate(-1)}
                            sx={{
                                background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                                color: 'white',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #7B1FA2 0%, #6A1B9A 100%)',
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
                                background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: '0 4px 16px rgba(156, 39, 176, 0.3)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 20px rgba(156, 39, 176, 0.4)',
                                }
                            }}
                        >
                            <LockResetIcon sx={{ fontSize: 32 }} />
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
                                Change Password
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6c757d', mt: 0.5 }}>
                                Update your account password securely
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
                        maxWidth: 600,
                        mx: 'auto',
                    }}
                >
                    <Box sx={{ p: 4 }}>
                        {/* Display errors if any */}
                        {Object.keys(errors).length > 0 && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                                Please fix the errors below
                            </Alert>
                        )}

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Current Password */}
                            <TextField
                                fullWidth
                                label="Current Password"
                                type={showCurrentPassword ? "text" : "password"}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                error={!!errors.currentPassword}
                                helperText={errors.currentPassword}
                                placeholder="Enter your current password"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon sx={{ color: '#6c757d' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                edge="end"
                                                sx={{ color: '#6c757d' }}
                                            >
                                                {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        background: 'white',
                                        '&:hover fieldset': {
                                            borderColor: '#9C27B0',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#9C27B0',
                                            borderWidth: '2px',
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#9C27B0',
                                    }
                                }}
                            />

                            {/* New Password */}
                            <TextField
                                fullWidth
                                label="New Password"
                                type={showNewPassword ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                error={!!errors.newPassword}
                                helperText={errors.newPassword}
                                placeholder="Enter your new password"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon sx={{ color: '#6c757d' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                edge="end"
                                                sx={{ color: '#6c757d' }}
                                            >
                                                {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        background: 'white',
                                        '&:hover fieldset': {
                                            borderColor: '#9C27B0',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#9C27B0',
                                            borderWidth: '2px',
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#9C27B0',
                                    }
                                }}
                            />

                            {/* Confirm New Password */}
                            <TextField
                                fullWidth
                                label="Confirm New Password"
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword}
                                placeholder="Confirm your new password"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon sx={{ color: '#6c757d' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                                sx={{ color: '#6c757d' }}
                                            >
                                                {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        background: 'white',
                                        '&:hover fieldset': {
                                            borderColor: '#9C27B0',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#9C27B0',
                                            borderWidth: '2px',
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#9C27B0',
                                    }
                                }}
                            />

                            {/* Submit Button */}
                            <MuiButton
                                fullWidth
                                variant="contained"
                                onClick={handleSubmit}
                                sx={{
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    py: 1.5,
                                    mt: 2,
                                    background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                                    boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #7B1FA2 0%, #6A1B9A 100%)',
                                        boxShadow: '0 6px 16px rgba(156, 39, 176, 0.4)',
                                    }
                                }}
                            >
                                Change Password
                            </MuiButton>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}
