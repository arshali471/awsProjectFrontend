// @ts-nocheck
import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { AdminService } from "../../../services/admin.service";
import UsersTable from "../../../Table/Users.table";
import AddUserModal from "../../../modal/addUser.modal";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Button as MuiButton, IconButton } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BlockIcon from "@mui/icons-material/Block";
import AddIcon from "@mui/icons-material/Add";

export default function AddUser() {

    const navigate = useNavigate();

    const [usersData, setusersData] = useState<any>();
    const [showAddUser, setShowAddUser] = useState<boolean>(false)
    const [isAllowed, setIsAllowed] = useState<boolean>(false)


    const getAllUsers = async () => {
        await AdminService.getAllUsers().then((res) => {
            if (res.status === 200) {
                setusersData(res.data)
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
                if (res.data.addUser) {
                    setIsAllowed(true);
                }
            } else {
                console.error(`Failed to fetch user data. Status: ${res.status}`);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    useEffect(() => {
        getUserData();
    }, [])

    useEffect(() => {
        if (isAllowed) {
            getAllUsers();
        }
    }, [isAllowed])

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
                {isAllowed ? (
                    <>
                        {/* Page Header */}
                        <Box sx={{ mb: 4 }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box display="flex" alignItems="center" gap={2}>
                                    <IconButton
                                        onClick={() => navigate(-1)}
                                        sx={{
                                            background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                                            color: 'white',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #005a9e 0%, #0073bb 100%)',
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
                                            background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                                            borderRadius: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            boxShadow: '0 4px 16px rgba(0, 115, 187, 0.3)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 20px rgba(0, 115, 187, 0.4)',
                                            }
                                        }}
                                    >
                                        <PersonAddIcon sx={{ fontSize: 32 }} />
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
                                            User Management
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#6c757d',
                                                mt: 0.5,
                                            }}
                                        >
                                            Create and manage user accounts
                                        </Typography>
                                    </Box>
                                </Box>
                                <MuiButton
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => setShowAddUser(true)}
                                    sx={{
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: 3,
                                        py: 1.2,
                                        background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                                        boxShadow: '0 4px 12px rgba(0, 115, 187, 0.3)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #005a9e 0%, #0073bb 100%)',
                                            boxShadow: '0 6px 16px rgba(0, 115, 187, 0.4)',
                                        }
                                    }}
                                >
                                    Add User
                                </MuiButton>
                            </Box>
                        </Box>

                        {/* Users Table */}
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
                            <Box sx={{ p: 3 }}>
                                <UsersTable tableData={usersData} />
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
                                Only administrators can manage users.
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
                                        background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                                        boxShadow: '0 4px 12px rgba(0, 115, 187, 0.3)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #005a9e 0%, #0073bb 100%)',
                                            boxShadow: '0 6px 16px rgba(0, 115, 187, 0.4)',
                                        }
                                    }}
                                >
                                    Go to Dashboard
                                </MuiButton>
                            </Box>
                        </Paper>
                    </Box>
                )}
                <AddUserModal
                    show={showAddUser}
                    handleClose={() => setShowAddUser(false)}
                    reload={getAllUsers}
                />
            </Container>
        </Box>
    )
}