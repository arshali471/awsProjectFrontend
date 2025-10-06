import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button as MuiButton,
    Typography,
    Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteIcon from '@mui/icons-material/Delete';

interface IConfirmationModal {
    show: any,
    handleClose: () => void
    label?: string
    username?: string
    onClick: (userId: any) => void
}

export default function ConfirmationModal(props: IConfirmationModal) {
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
            <DialogTitle sx={{ p: 3, pb: 2 }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            background: 'linear-gradient(135deg, #dc3545 0%, #e4606d 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                        }}
                    >
                        <WarningAmberIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#232f3e' }}>
                            Confirm Deletion
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6c757d', mt: 0.5 }}>
                            This action cannot be undone
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3, pt: 2 }}>
                {props.username ? (
                    <Typography variant="body1" sx={{ color: '#232f3e', lineHeight: 1.6 }}>
                        Are you sure you want to delete the user{' '}
                        <Box
                            component="span"
                            sx={{
                                color: '#dc3545',
                                fontWeight: 700,
                                background: 'rgba(220, 53, 69, 0.1)',
                                px: 1,
                                py: 0.5,
                                borderRadius: '6px',
                            }}
                        >
                            {props.username}
                        </Box>
                        ?
                    </Typography>
                ) : (
                    <Typography variant="body1" sx={{ color: '#232f3e', lineHeight: 1.6 }}>
                        {props.label || "Are you sure you want to delete this item?"}
                    </Typography>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
                <MuiButton
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
                </MuiButton>
                <MuiButton
                    onClick={() => props.onClick(props.show)}
                    variant="contained"
                    startIcon={<DeleteIcon />}
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        background: 'linear-gradient(135deg, #dc3545 0%, #e4606d 100%)',
                        boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #c82333 0%, #d35560 100%)',
                            boxShadow: '0 6px 16px rgba(220, 53, 69, 0.4)',
                        }
                    }}
                >
                    Delete
                </MuiButton>
            </DialogActions>
        </Dialog>
    )
}