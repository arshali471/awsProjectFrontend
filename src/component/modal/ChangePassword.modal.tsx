import { useState } from "react";
import { AdminService } from "../services/admin.service";
import toast from "react-hot-toast";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    IconButton,
    InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LockResetIcon from "@mui/icons-material/LockReset";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

interface IChangePaswordModal {
    show: any,
    handleClose: () => void
}

export default function ChangePaswordModal(props: IChangePaswordModal) {

    const [password, setPassword] = useState<any>("");
    const [showPassword, setShowPassword] = useState(false);

    const handleChangePassword = async() => {
        if (!password || password.trim() === "") {
            toast.error("Please enter a password");
            return;
        }

        await AdminService.changeUserPasswordByAdmin(props.show, {newPassword:password}).then((res) => {
            if(res.status === 200) {
                toast.success("Password Changed Successfully")
                setPassword("");
                props.handleClose();
            }
        }).catch(err => {
            toast.error(err.response.data)
        })
    }

    return (
        <Dialog
            open={props.show ? true : false}
            onClose={props.handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                }
            }}
        >
            {/* Header */}
            <DialogTitle sx={{ p: 3, pb: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                            }}
                        >
                            <LockResetIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    color: '#232f3e',
                                }}
                            >
                                Change Password
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#6c757d',
                                    mt: 0.5,
                                }}
                            >
                                Update user password
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={props.handleClose}
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

            {/* Content */}
            <DialogContent sx={{ p: 3, pt: 2 }}>
                <TextField
                    fullWidth
                    label="New Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoFocus
                    InputProps={{
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
                            '&:hover fieldset': {
                                borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#667eea',
                                borderWidth: '2px',
                            }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: '#667eea',
                        }
                    }}
                />
            </DialogContent>

            {/* Actions */}
            <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
                <Button
                    onClick={props.handleClose}
                    variant="outlined"
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
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
                    onClick={handleChangePassword}
                    variant="contained"
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                            boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                        }
                    }}
                >
                    Save Password
                </Button>
            </DialogActions>
        </Dialog>
    )
}