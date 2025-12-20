import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button as MuiButton,
    Typography,
    Box,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface IPermissionConfirmationModal {
    show: boolean;
    handleClose: () => void;
    onConfirm: () => void;
    permissionType: string;
    username: string;
    currentValue: boolean;
}

export default function PermissionConfirmationModal(props: IPermissionConfirmationModal) {
    const getPermissionLabel = () => {
        switch (props.permissionType) {
            case 'isActive':
                return 'Active Status';
            case 'admin':
                return 'Admin Access';
            case 'addAWSKey':
                return 'AWS Key Access';
            case 'addUser':
                return 'Add User Access';
            default:
                return 'Permission';
        }
    };

    const getActionText = () => {
        return props.currentValue ? 'disable' : 'enable';
    };

    const getActionColor = () => {
        return props.currentValue ? '#dc3545' : '#10b981';
    };

    return (
        <Dialog
            open={props.show}
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
            <DialogTitle sx={{ p: 3, pb: 2 }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            background: `linear-gradient(135deg, ${getActionColor()} 0%, ${getActionColor()}dd 100%)`,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                        }}
                    >
                        <SecurityIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#232f3e' }}>
                            Confirm Permission Change
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6c757d', mt: 0.5 }}>
                            Please review this change carefully
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3, pt: 2 }}>
                <Typography variant="body1" sx={{ color: '#232f3e', lineHeight: 1.6 }}>
                    Are you sure you want to{' '}
                    <Box
                        component="span"
                        sx={{
                            color: getActionColor(),
                            fontWeight: 700,
                            background: `${getActionColor()}20`,
                            px: 1,
                            py: 0.5,
                            borderRadius: '6px',
                        }}
                    >
                        {getActionText()}
                    </Box>
                    {' '}<strong>{getPermissionLabel()}</strong> for user{' '}
                    <Box
                        component="span"
                        sx={{
                            color: '#0073bb',
                            fontWeight: 700,
                            background: 'rgba(0, 115, 187, 0.1)',
                            px: 1,
                            py: 0.5,
                            borderRadius: '6px',
                        }}
                    >
                        {props.username}
                    </Box>
                    ?
                </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
                <MuiButton
                    onClick={props.handleClose}
                    variant="outlined"
                    startIcon={<CancelIcon />}
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
                </MuiButton>
                <MuiButton
                    onClick={props.onConfirm}
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        background: `linear-gradient(135deg, ${getActionColor()} 0%, ${getActionColor()}dd 100%)`,
                        boxShadow: `0 4px 12px ${getActionColor()}50`,
                        '&:hover': {
                            background: `linear-gradient(135deg, ${getActionColor()}dd 0%, ${getActionColor()}bb 100%)`,
                            boxShadow: `0 6px 16px ${getActionColor()}60`,
                        }
                    }}
                >
                    Confirm
                </MuiButton>
            </DialogActions>
        </Dialog>
    );
}
