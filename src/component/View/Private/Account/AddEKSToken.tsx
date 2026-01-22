import { useEffect, useState } from "react";
import { Container, Spinner, Table } from "react-bootstrap";
import { AdminService } from "../../../services/admin.service";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AddEksTokenModal from "../../../modal/AddEksToken.modal";
import EditEksTokenModal from "../../../modal/EditEksToken.modal";
import TablePagination from "../../../Pagination/TablePagination";
import {
    Box,
    Typography,
    Paper,
    Button as MuiButton,
    IconButton,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import TokenIcon from "@mui/icons-material/Token";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BlockIcon from "@mui/icons-material/Block";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import DescriptionIcon from "@mui/icons-material/Description";

export default function AddEKSToken() {
    const navigate = useNavigate();

    const [isAllowed, setIsAllowed] = useState<boolean>(false);
    const [isUserLoading, setIsUserLoading] = useState<boolean>(true);
    const [showAddEksTokenModal, setShowAddEksTokenModal] = useState<boolean>(false);
    const [data, setData] = useState<any>([]);
    const [eksIndex, setEksIndex] = useState<number>(-1);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [selectedEksToken, setSelectedEksToken] = useState<any>(null);
    const [search, setSearch] = useState<any>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(10);
    const [loading, setLoading] = useState<boolean>(false);

    const getAllEksToken = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getAllEksToken(search, currentPage, perPage);
            if (res.status === 200) {
                setData(res.data.data);
                setTotalCount(res.data.count);
            }
        } catch (err: any) {
            toast.error(err.response?.data || "Failed to get EKS token");
        } finally {
            setLoading(false);
        }
    };

    const getUserData = async () => {
        try {
            // Check sessionStorage first
            const userRole = sessionStorage.getItem('role');
            if (userRole === 'admin') {
                setIsAllowed(true);
                setIsUserLoading(false);
                return;
            }

            // Fallback to API call
            const res = await AdminService.getUserData();
            if (res.status === 200 && res.data.admin) {
                setIsAllowed(true);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setIsUserLoading(false);
        }
    };

    // const copyToClipboard = (text: string) => {
    //     navigator.clipboard
    //         .writeText(text)
    //         .then(() => toast.success("Copied to clipboard!"))
    //         .catch(() => toast.error("Failed to copy"));
    // };

    useEffect(() => {
        getAllEksToken();
    }, [search, perPage, currentPage]);

    useEffect(() => {
        getUserData();
    }, []);

    const handleDelete = async () => {
        try {
            const res = await AdminService.deleteEKSToken(selectedEksToken._id);
            if (res.status === 200) {
                toast.success("EKS Token deleted successfully");
                setShowDeleteModal(false);
                setSelectedEksToken(null);
                getAllEksToken();
            }
        } catch (err: any) {
            toast.error(err.response?.data || "Failed to delete EKS token");
        }
    };

    const openDeleteModal = (eksToken: any) => {
        setSelectedEksToken(eksToken);
        setShowDeleteModal(true);
    };

    if (isUserLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Spinner animation="border" />
            </Box>
        );
    }

    if (!isAllowed) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    py: 4,
                    px: 3,
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
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#232f3e', mb: 2 }}>
                        Access Denied
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6c757d', mb: 1, fontSize: '1.1rem' }}>
                        You don't have permission to access this page.
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#dc3545', mb: 4, fontWeight: 600 }}>
                        Only administrators can manage EKS tokens.
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
                                background: 'linear-gradient(135deg, #FF6B6B 0%, #e4606d 100%)',
                                boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #e55555 0%, #d35560 100%)',
                                    boxShadow: '0 6px 16px rgba(255, 107, 107, 0.4)',
                                }
                            }}
                        >
                            Go to Dashboard
                        </MuiButton>
                    </Box>
                </Paper>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
                py: 4,
                px: 3,
            }}
        >
            <Container>
                {/* Page Header */}
                <Box sx={{ mb: 4 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={2}>
                            <IconButton
                                onClick={() => navigate(-1)}
                                sx={{
                                    background: 'linear-gradient(135deg, #FF6B6B 0%, #e4606d 100%)',
                                    color: 'white',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #e55555 0%, #d35560 100%)',
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
                                    background: 'linear-gradient(135deg, #FF6B6B 0%, #e4606d 100%)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    boxShadow: '0 4px 16px rgba(255, 107, 107, 0.3)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 20px rgba(255, 107, 107, 0.4)',
                                    }
                                }}
                            >
                                <TokenIcon sx={{ fontSize: 32 }} />
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
                                    EKS Token Management
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6c757d', mt: 0.5 }}>
                                    Manage EKS cluster access tokens
                                </Typography>
                            </Box>
                        </Box>
                        <MuiButton
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setShowAddEksTokenModal(true)}
                            sx={{
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                py: 1.2,
                                background: 'linear-gradient(135deg, #FF6B6B 0%, #e4606d 100%)',
                                boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #e55555 0%, #d35560 100%)',
                                    boxShadow: '0 6px 16px rgba(255, 107, 107, 0.4)',
                                }
                            }}
                        >
                            Add EKS Token
                        </MuiButton>
                    </Box>
                </Box>

                {/* Search */}
                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        placeholder="Search by cluster name..."
                        value={search || ''}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ color: '#6c757d', mr: 1 }} />,
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                background: 'white',
                            }
                        }}
                    />
                </Box>

                {/* Table Card */}
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: '16px',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                        mb: 3,
                    }}
                >
                    <Box sx={{ p: 3 }}>
                        <Table striped hover responsive>
                            <thead>
                                <tr>
                                    <th>Sr.No</th>
                                    <th>Cluster Name</th>
                                    <th>YML File</th>
                                    <th>Uploaded By</th>
                                    <th>Updated By</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center">
                                            <Spinner size="sm" animation="border" />
                                        </td>
                                    </tr>
                                ) : data.length > 0 ? (
                                    data.map((item: any, index: number) => (
                                        <tr key={item._id}>
                                            <td>{(currentPage - 1) * perPage + index + 1}</td>
                                            <td>{item.clusterName || "--"}</td>
                                            <td>
                                                {item.fileName ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <DescriptionIcon sx={{ fontSize: 18, color: '#28a745' }} />
                                                        <Typography variant="body2" sx={{ color: '#0073bb' }}>
                                                            {item.fileName}
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Typography variant="body2" sx={{ color: '#6c757d' }}>
                                                        No file
                                                    </Typography>
                                                )}
                                            </td>
                                            <td>
                                                {item.createdBy ? (
                                                    item.createdBy.username || item.createdBy.email || "--"
                                                ) : "--"}
                                            </td>
                                            <td>
                                                {item.updatedBy ? (
                                                    item.updatedBy.username || item.updatedBy.email || "--"
                                                ) : "--"}
                                            </td>
                                            <td>
                                                <IconButton size="small" onClick={() => setEksIndex(index)} sx={{ color: '#0073bb' }}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => openDeleteModal(item)} sx={{ color: '#dc3545', ml: 1 }}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center">No data found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Box>
                </Paper>
                <TablePagination total={totalCount} currentPage={currentPage} perPage={perPage} handlePageChange={setCurrentPage} setPerPage={setPerPage} />
            </Container>

            <AddEksTokenModal show={showAddEksTokenModal} handleClose={() => setShowAddEksTokenModal(false)} reload={getAllEksToken} />
            <EditEksTokenModal show={eksIndex !== -1} handleClose={() => setEksIndex(-1)} reload={getAllEksToken} eksData={data[eksIndex]} />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
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
                                width: 48,
                                height: 48,
                                background: 'linear-gradient(135deg, #dc3545 0%, #e4606d 100%)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                            }}
                        >
                            <DeleteIcon sx={{ fontSize: 24 }} />
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
                    <Typography variant="body1">
                        Are you sure you want to delete the EKS token for cluster{" "}
                        <strong>{selectedEksToken?.clusterName}</strong>?
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
                    <MuiButton
                        onClick={() => setShowDeleteModal(false)}
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
                        onClick={handleDelete}
                        variant="contained"
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
        </Box>
    );
}
