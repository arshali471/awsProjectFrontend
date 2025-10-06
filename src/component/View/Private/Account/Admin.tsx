import { useEffect, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { AdminService } from "../../../services/admin.service";
import AdminUsersTable from "../../../Table/AdminUser.table";
import AWSKeyTable from "../../../Table/AWSKey.table";
import { TbError404Off } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Divider, IconButton, Button as MuiButton } from "@mui/material";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BlockIcon from '@mui/icons-material/Block';
import TablePagination from "../../../Pagination/TablePagination";

export default function AdminIndex() {

    const navigate = useNavigate();

    const [users, setUsers] = useState<any>([]);
    const [awsKeyData, setAwsKeyData] = useState<any>([]);

    const [isAllowed, setIsAllowed] = useState<boolean>(false)

    // Users pagination
    const [usersCurrentPage, setUsersCurrentPage] = useState<number>(1);
    const [usersPerPage, setUsersPerPage] = useState<number>(10);
    const [usersTotalCount, setUsersTotalCount] = useState<number>(0);

    // AWS Keys pagination
    const [awsCurrentPage, setAwsCurrentPage] = useState<number>(1);
    const [awsPerPage, setAwsPerPage] = useState<number>(10);
    const [awsTotalCount, setAwsTotalCount] = useState<number>(0);

    const getAllUsers = async () => {
        await AdminService.getAllUsers().then((res) => {
            setUsers(res.data)
            setUsersTotalCount(res.data?.length || 0)
        })
    }

    const getAllAWSKey = async () => {
        await AdminService.getAllAwsKey().then((res) => {
            setAwsKeyData(res.data)
            setAwsTotalCount(res.data?.length || 0)
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
                if (res.data.admin) {
                    setIsAllowed(true)
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
            getAllAWSKey();
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
                        {/* Page Header with Back Button */}
                        <Box sx={{ mb: 4 }}>
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
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                                        }
                                    }}
                                >
                                    <AdminPanelSettingsIcon sx={{ fontSize: 32 }} />
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
                                        Admin Panel
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#6c757d',
                                            mt: 0.5,
                                        }}
                                    >
                                        Manage users and AWS credentials
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Users Section */}
                        <Paper
                            elevation={0}
                            sx={{
                                mb: 4,
                                borderRadius: '16px',
                                border: '1px solid rgba(0, 0, 0, 0.06)',
                                overflow: 'hidden',
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                                }
                            }}
                        >
                            <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
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
                                        <PeopleIcon sx={{ fontSize: 24 }} />
                                    </Box>
                                    <Box>
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                fontWeight: 700,
                                                color: '#232f3e',
                                            }}
                                        >
                                            Users Management
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#6c757d',
                                                mt: 0.5,
                                            }}
                                        >
                                            Manage user accounts and permissions
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ p: 3 }}>
                                <AdminUsersTable
                                    tableData={users?.slice((usersCurrentPage - 1) * usersPerPage, usersCurrentPage * usersPerPage)}
                                    reload={getAllUsers}
                                />
                            </Box>
                            {usersTotalCount > 0 && (
                                <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
                                    <TablePagination
                                        total={usersTotalCount}
                                        currentPage={usersCurrentPage}
                                        handlePageChange={setUsersCurrentPage}
                                        perPage={usersPerPage}
                                        setPerPage={setUsersPerPage}
                                    />
                                </Box>
                            )}
                        </Paper>

                        {/* AWS Keys Section */}
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: '16px',
                                border: '1px solid rgba(0, 0, 0, 0.06)',
                                overflow: 'hidden',
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                                }
                            }}
                        >
                            <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
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
                                            variant="h5"
                                            sx={{
                                                fontWeight: 700,
                                                color: '#232f3e',
                                            }}
                                        >
                                            AWS Credentials
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#6c757d',
                                                mt: 0.5,
                                            }}
                                        >
                                            Manage AWS access keys and configurations
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ p: 3 }}>
                                <AWSKeyTable
                                    tableData={awsKeyData?.slice((awsCurrentPage - 1) * awsPerPage, awsCurrentPage * awsPerPage)}
                                    reload={getAllAWSKey}
                                />
                            </Box>
                            {awsTotalCount > 0 && (
                                <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
                                    <TablePagination
                                        total={awsTotalCount}
                                        currentPage={awsCurrentPage}
                                        handlePageChange={setAwsCurrentPage}
                                        perPage={awsPerPage}
                                        setPerPage={setAwsPerPage}
                                    />
                                </Box>
                            )}
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
                                Only administrators can access the admin panel.
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
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #764ba2 0%, #5a3d8a 100%)',
                                            boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
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