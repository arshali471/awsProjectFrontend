// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Container, Table, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom';
import TablePagination from '../../../Pagination/TablePagination';
import { AdminService } from '../../../services/admin.service';
import toast from 'react-hot-toast';
import moment from 'moment';
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
} from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BlockIcon from '@mui/icons-material/Block';
import LockIcon from '@mui/icons-material/Lock';

export default function SshKey() {

  const navigate = useNavigate()

  const [search, setSearch] = useState<string>('');
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [addSshKeyModal, setShowAddSshKeyModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedSshKey, setSelectedSshKey] = useState<any>(null);
  const [data, setData] = useState<any>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [files, setFiles] = useState<any>();

  // Check if user is admin
  const checkAdminAccess = async () => {
    try {
      // Check sessionStorage first
      const userRole = sessionStorage.getItem('role');
      if (userRole === 'admin') {
        setIsAdmin(true);
        return;
      }

      // Fallback to API call
      const res = await AdminService.getUserData();
      if (res.status === 200 && (res.data.admin || res.data.addSshKey)) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Error checking admin access:", error);
    }
  };

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const getAllSshKey = async () => {
    setLoading(true);
    try {
      const searchValue = search.trim() === '' ? null : search.trim();
      const res = await AdminService.getSshKey(searchValue, currentPage, perPage);
      if (res.status === 200) {
        setData(res.data.data);
        setTotalCount(res.data.total);
      }
    } catch (error) {
      toast.error("Failed to fetch SSH keys");
    } finally {
      setLoading(false);
    }
  }

  const handleUploadSshKey = async () => {
    const formData = new FormData();
    formData.append("upload", files[0])
    await AdminService.uploadSshKey(formData).then((res) => {
      if (res.status === 201) {
        toast.success("SSH key uploaded.")
        setShowAddSshKeyModal(false)
        getAllSshKey();
      }
    }).catch(err => {
      console.log(err, "error");
      toast.error(err.response.data.message || "Failed to upload SSH key")
    })
  }

  const handleDeleteSshKey = async () => {
    try {
      const res = await AdminService.deleteSshKey(selectedSshKey._id);
      if (res.status === 200) {
        toast.success("SSH key deleted successfully");
        setShowDeleteModal(false);
        getAllSshKey();
      }
    } catch (error) {
      toast.error("Failed to delete SSH key");
    }
  }

  const openDeleteModal = (sshKey: any) => {
    setSelectedSshKey(sshKey);
    setShowDeleteModal(true);
  }

  useEffect(() => {
    if (isAdmin) {
      getAllSshKey();
    }
  }, [currentPage, perPage, search, isAdmin])

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          px: 3,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              borderRadius: '24px',
              border: '2px solid rgba(220, 53, 69, 0.2)',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #ffffff 0%, #fff5f5 100%)',
              boxShadow: '0 8px 32px rgba(220, 53, 69, 0.15)',
            }}
          >
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  background: 'linear-gradient(135deg, #dc3545 0%, #e4606d 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  mx: 'auto',
                  mb: 3,
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
                Only administrators can manage SSH keys.
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
                    background: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)',
                    boxShadow: '0 4px 12px rgba(255, 167, 38, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #FB8C00 0%, #F57C00 100%)',
                      boxShadow: '0 6px 16px rgba(255, 167, 38, 0.4)',
                    }
                  }}
                >
                  Go to Dashboard
                </MuiButton>
              </Box>
            </Box>
          </Paper>
        </Container>
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
                  background: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FB8C00 0%, #F57C00 100%)',
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
                  background: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 4px 16px rgba(255, 167, 38, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(255, 167, 38, 0.4)',
                  }
                }}
              >
                <KeyIcon sx={{ fontSize: 32 }} />
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
                  SSH Keys
                </Typography>
                <Typography variant="body2" sx={{ color: '#6c757d', mt: 0.5 }}>
                  Manage SSH authentication keys
                </Typography>
              </Box>
            </Box>
            <MuiButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddSshKeyModal(true)}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.2,
                background: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)',
                boxShadow: '0 4px 12px rgba(255, 167, 38, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FB8C00 0%, #F57C00 100%)',
                  boxShadow: '0 6px 16px rgba(255, 167, 38, 0.4)',
                }
              }}
            >
              Upload SSH Key
            </MuiButton>
          </Box>
        </Box>

        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search SSH keys..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: '#6c757d', mr: 1 }} />,
            }}
            sx={{
              width: 400,
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
                  <th>SSH Key Name</th>
                  <th>Created By</th>
                  <th>Updated By</th>
                  <th>Added On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                      <Spinner size="sm" animation="border" />
                    </td>
                  </tr>
                ) : data.length > 0 ? (
                  data.map((item: any, index: number) => (
                    <tr key={item._id}>
                      <td>{(currentPage - 1) * perPage + index + 1}</td>
                      <td>{item.sshKeyName || "--"}</td>
                      <td>{item.createdBy?.username || "--"}</td>
                      <td>{item.updatedBy?.username || "--"}</td>
                      <td>{moment(item?.createAt).format("DD-MM-YYYY, HH:mm A") || "--"}</td>
                      <td>
                        <IconButton size="small" onClick={() => openDeleteModal(item)} sx={{ color: '#dc3545' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No data found.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Box>
        </Paper>

        <TablePagination total={totalCount} currentPage={currentPage} perPage={perPage} handlePageChange={setCurrentPage} setPerPage={setPerPage} />
      </Container>

      {/* Upload SSH Key Dialog */}
      <Dialog
        open={addSshKeyModal}
        onClose={() => setShowAddSshKeyModal(false)}
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
                background: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <UploadFileIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#232f3e' }}>
                Upload SSH Key
              </Typography>
              <Typography variant="body2" sx={{ color: '#6c757d', mt: 0.5 }}>
                Select a file to upload
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 2 }}>
          <MuiButton
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            fullWidth
            sx={{
              py: 3,
              borderRadius: '12px',
              borderStyle: 'dashed',
              borderWidth: '2px',
              borderColor: '#FFA726',
              color: '#FFA726',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#FB8C00',
                background: 'rgba(255, 167, 38, 0.04)',
              }
            }}
          >
            {files?.[0]?.name || 'Choose SSH Key File'}
            <input
              type="file"
              hidden
              onChange={(e: any) => setFiles(e.target.files)}
            />
          </MuiButton>
          {files?.[0] && (
            <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
              ✓ File selected: {files[0].name}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
          <MuiButton
            onClick={() => setShowAddSshKeyModal(false)}
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
            onClick={handleUploadSshKey}
            variant="contained"
            disabled={!files?.[0]}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              background: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)',
              boxShadow: '0 4px 12px rgba(255, 167, 38, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #FB8C00 0%, #F57C00 100%)',
                boxShadow: '0 6px 16px rgba(255, 167, 38, 0.4)',
              }
            }}
          >
            Upload
          </MuiButton>
        </DialogActions>
      </Dialog>

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
            Are you sure you want to delete the SSH key{" "}
            <strong>{selectedSshKey?.sshKeyName}</strong>?
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
            onClick={handleDeleteSshKey}
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
  )
}
