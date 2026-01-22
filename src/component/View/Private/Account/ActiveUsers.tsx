import { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import { AdminService } from "../../../services/admin.service";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Paper,
    IconButton,
    TextField,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Switch,
    FormControlLabel,
    Tooltip,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import moment from "moment";

interface ActiveUser {
    _id: string;
    username: string;
    email: string;
    isActive: boolean;
    ssoProvider?: string;
    displayName?: string;
    lastLogin?: string;
    lastLogout?: string;
    lastActivity?: string;
    admin: boolean;
    createdAt?: string;
    sessionCount?: number;
    sessions?: any[];
}

export default function ActiveUsers() {
    const navigate = useNavigate();

    const [isAllowed, setIsAllowed] = useState<boolean>(false);
    const [isUserLoading, setIsUserLoading] = useState<boolean>(true);
    const [data, setData] = useState<ActiveUser[]>([]);
    const [filteredData, setFilteredData] = useState<ActiveUser[]>([]);
    const [search, setSearch] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [sortField, setSortField] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        ssoUsers: 0,
        localUsers: 0,
    });

    const getAllUsers = async () => {
        setLoading(true);
        try {
            // Use the old endpoint temporarily while debugging session status endpoint
            const res = await AdminService.getAllUsers();
            if (res.status === 200) {
                const users = res.data || [];
                setData(users);
                setFilteredData(users);

                // Calculate stats: users are only active if logged in within 24 hours AND no logout
                const active = users.filter((u: ActiveUser) => {
                    if (!u.lastLogin) return false;
                    if (u.lastLogout) return false; // If logged out, always inactive

                    const twentyFourHoursAgo = new Date();
                    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
                    return new Date(u.lastLogin) > twentyFourHoursAgo;
                }).length;
                const sso = users.filter((u: ActiveUser) => u.ssoProvider === 'azure').length;

                setStats({
                    total: users.length,
                    active: active,
                    inactive: users.length - active,
                    ssoUsers: sso,
                    localUsers: users.length - sso,
                });

                setLastRefresh(new Date());
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to get users");
        } finally{
            setLoading(false);
        }
    };

    const getUserData = async () => {
        try {
            const userRole = sessionStorage.getItem('role');
            if (userRole === 'admin') {
                setIsAllowed(true);
                setIsUserLoading(false);
                return;
            }

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

    useEffect(() => {
        getUserData();
    }, []);

    useEffect(() => {
        if (isAllowed) {
            getAllUsers();
        }
    }, [isAllowed]);

    // Auto-refresh every 30 seconds if enabled
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (autoRefresh && isAllowed) {
            interval = setInterval(() => {
                getAllUsers();
            }, 30000); // 30 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh, isAllowed]);

    useEffect(() => {
        if (search) {
            const filtered = data.filter((user) =>
                user.username?.toLowerCase().includes(search.toLowerCase()) ||
                user.email?.toLowerCase().includes(search.toLowerCase()) ||
                user.displayName?.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(data);
        }
    }, [search, data]);

    const getInitials = (name: string) => {
        return name?.substring(0, 2).toUpperCase() || "U";
    };

    // Check if user is currently active
    const isUserCurrentlyActive = (user: ActiveUser) => {
        // User must have logged in to be active
        if (!user.lastLogin) return false;

        // If user has logged out, they are ALWAYS inactive
        if (user.lastLogout) {
            return false;
        }

        // If no logout record exists, check if login was recent (within last 24 hours)
        // This prevents showing users as "active" who logged in days ago but never logged out
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        return new Date(user.lastLogin) > twentyFourHoursAgo;
    };

    // Handle sorting
    const handleSort = (field: string) => {
        const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortDirection(newDirection);

        const sorted = [...filteredData].sort((a: any, b: any) => {
            let aValue = a[field];
            let bValue = b[field];

            // Handle special cases
            if (field === "status") {
                aValue = isUserCurrentlyActive(a) ? 1 : 0;
                bValue = isUserCurrentlyActive(b) ? 1 : 0;
            } else if (field === "lastLogin" || field === "lastLogout" || field === "createdAt") {
                aValue = aValue ? new Date(aValue).getTime() : 0;
                bValue = bValue ? new Date(bValue).getTime() : 0;
            } else if (field === "admin") {
                aValue = aValue ? 1 : 0;
                bValue = bValue ? 1 : 0;
            } else if (field === "username") {
                aValue = (a.displayName || a.username || "").toLowerCase();
                bValue = (b.displayName || b.username || "").toLowerCase();
            } else if (typeof aValue === "string") {
                aValue = aValue.toLowerCase();
                bValue = bValue?.toLowerCase() || "";
            }

            if (aValue < bValue) return newDirection === "asc" ? -1 : 1;
            if (aValue > bValue) return newDirection === "asc" ? 1 : -1;
            return 0;
        });

        setFilteredData(sorted);
    };

    // Render sort icon
    const renderSortIcon = (field: string) => {
        if (sortField !== field) return null;
        return sortDirection === "asc" ? (
            <ArrowUpwardIcon sx={{ fontSize: 16, ml: 0.5 }} />
        ) : (
            <ArrowDownwardIcon sx={{ fontSize: 16, ml: 0.5 }} />
        );
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
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#232f3e', mb: 2 }}>
                        Access Denied
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6c757d', mb: 4 }}>
                        Only administrators can view active users.
                    </Typography>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{
                            background: 'linear-gradient(135deg, #dc3545 0%, #e4606d 100%)',
                            color: 'white',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #c82333 0%, #d35560 100%)',
                            }
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
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
                                    background: 'linear-gradient(135deg, #00BCD4 0%, #00ACC1 100%)',
                                    color: 'white',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #00ACC1 0%, #0097A7 100%)',
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
                                    background: 'linear-gradient(135deg, #00BCD4 0%, #00ACC1 100%)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    boxShadow: '0 4px 16px rgba(0, 188, 212, 0.3)',
                                }}
                            >
                                <PeopleIcon sx={{ fontSize: 32 }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#232f3e' }}>
                                    Active Users
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6c757d', mt: 0.5 }}>
                                    Real-time session monitoring • Last updated: {moment(lastRefresh).fromNow()}
                                </Typography>
                            </Box>
                        </Box>
                        <Box display="flex" alignItems="center" gap={2}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={autoRefresh}
                                        onChange={(e) => setAutoRefresh(e.target.checked)}
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: '#00BCD4',
                                            },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                backgroundColor: '#00BCD4',
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 600 }}>
                                        Auto-refresh (30s)
                                    </Typography>
                                }
                            />
                            <Tooltip title="Refresh now">
                                <IconButton
                                    onClick={getAllUsers}
                                    disabled={loading}
                                    sx={{
                                        background: 'linear-gradient(135deg, #00BCD4 0%, #00ACC1 100%)',
                                        color: 'white',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #00ACC1 0%, #0097A7 100%)',
                                        },
                                        '&:disabled': {
                                            background: '#e0e0e0',
                                        }
                                    }}
                                >
                                    {loading ? <Spinner animation="border" size="sm" /> : <RefreshIcon />}
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>

                {/* Stats Cards */}
                <Box sx={{ mb: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' }, gap: 2 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Total Users</Typography>
                        <Typography variant="h4" fontWeight={700} color="#00BCD4">{stats.total}</Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Active</Typography>
                        <Typography variant="h4" fontWeight={700} color="#28a745">{stats.active}</Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Inactive</Typography>
                        <Typography variant="h4" fontWeight={700} color="#dc3545">{stats.inactive}</Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>SSO Users</Typography>
                        <Typography variant="h4" fontWeight={700} color="#0078d4">{stats.ssoUsers}</Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Local Users</Typography>
                        <Typography variant="h4" fontWeight={700} color="#667eea">{stats.localUsers}</Typography>
                    </Paper>
                </Box>

                {/* Search */}
                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        placeholder="Search by username, email, or name..."
                        value={search}
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

                {/* Users Table */}
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                    <Table>
                        <TableHead sx={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                            <TableRow>
                                <TableCell
                                    sx={{ fontWeight: 700, color: '#232f3e', cursor: 'pointer', userSelect: 'none', '&:hover': { background: 'rgba(0,0,0,0.03)' } }}
                                    onClick={() => handleSort("username")}
                                >
                                    <Box display="flex" alignItems="center">
                                        User
                                        {renderSortIcon("username")}
                                    </Box>
                                </TableCell>
                                <TableCell
                                    sx={{ fontWeight: 700, color: '#232f3e', cursor: 'pointer', userSelect: 'none', '&:hover': { background: 'rgba(0,0,0,0.03)' } }}
                                    onClick={() => handleSort("email")}
                                >
                                    <Box display="flex" alignItems="center">
                                        Email
                                        {renderSortIcon("email")}
                                    </Box>
                                </TableCell>
                                <TableCell
                                    sx={{ fontWeight: 700, color: '#232f3e', cursor: 'pointer', userSelect: 'none', '&:hover': { background: 'rgba(0,0,0,0.03)' } }}
                                    onClick={() => handleSort("status")}
                                >
                                    <Box display="flex" alignItems="center">
                                        Status
                                        {renderSortIcon("status")}
                                    </Box>
                                </TableCell>
                                <TableCell
                                    sx={{ fontWeight: 700, color: '#232f3e', cursor: 'pointer', userSelect: 'none', '&:hover': { background: 'rgba(0,0,0,0.03)' } }}
                                    onClick={() => handleSort("ssoProvider")}
                                >
                                    <Box display="flex" alignItems="center">
                                        Auth Type
                                        {renderSortIcon("ssoProvider")}
                                    </Box>
                                </TableCell>
                                <TableCell
                                    sx={{ fontWeight: 700, color: '#232f3e', cursor: 'pointer', userSelect: 'none', '&:hover': { background: 'rgba(0,0,0,0.03)' } }}
                                    onClick={() => handleSort("admin")}
                                >
                                    <Box display="flex" alignItems="center">
                                        Role
                                        {renderSortIcon("admin")}
                                    </Box>
                                </TableCell>
                                <TableCell
                                    sx={{ fontWeight: 700, color: '#232f3e', cursor: 'pointer', userSelect: 'none', '&:hover': { background: 'rgba(0,0,0,0.03)' } }}
                                    onClick={() => handleSort("lastLogin")}
                                >
                                    <Box display="flex" alignItems="center">
                                        Last Login
                                        {renderSortIcon("lastLogin")}
                                    </Box>
                                </TableCell>
                                <TableCell
                                    sx={{ fontWeight: 700, color: '#232f3e', cursor: 'pointer', userSelect: 'none', '&:hover': { background: 'rgba(0,0,0,0.03)' } }}
                                    onClick={() => handleSort("lastLogout")}
                                >
                                    <Box display="flex" alignItems="center">
                                        Last Logout
                                        {renderSortIcon("lastLogout")}
                                    </Box>
                                </TableCell>
                                <TableCell
                                    sx={{ fontWeight: 700, color: '#232f3e', cursor: 'pointer', userSelect: 'none', '&:hover': { background: 'rgba(0,0,0,0.03)' } }}
                                    onClick={() => handleSort("createdAt")}
                                >
                                    <Box display="flex" alignItems="center">
                                        Created
                                        {renderSortIcon("createdAt")}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Spinner animation="border" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredData.length > 0 ? (
                                filteredData.map((user) => (
                                    <TableRow key={user._id} hover>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Avatar sx={{ bgcolor: isUserCurrentlyActive(user) ? '#00BCD4' : '#6c757d' }}>
                                                    {getInitials(user.displayName || user.username)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {user.displayName || user.username}
                                                    </Typography>
                                                    {user.displayName && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            @{user.username}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{user.email}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Chip
                                                    icon={isUserCurrentlyActive(user) ? <CheckCircleIcon /> : <CancelIcon />}
                                                    label={isUserCurrentlyActive(user) ? "Active" : "Inactive"}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: isUserCurrentlyActive(user) ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                                                        color: isUserCurrentlyActive(user) ? '#28a745' : '#dc3545',
                                                        fontWeight: 600,
                                                        border: `1px solid ${isUserCurrentlyActive(user) ? '#28a745' : '#dc3545'}33`,
                                                    }}
                                                />
                                                {isUserCurrentlyActive(user) && user.sessionCount && user.sessionCount > 0 && (
                                                    <Tooltip title={`${user.sessionCount} active session${user.sessionCount > 1 ? 's' : ''}`}>
                                                        <Chip
                                                            label={user.sessionCount}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: 'rgba(0, 188, 212, 0.1)',
                                                                color: '#00BCD4',
                                                                fontWeight: 700,
                                                                minWidth: '32px',
                                                            }}
                                                        />
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.ssoProvider === 'azure' ? 'Microsoft SSO' : 'Local'}
                                                size="small"
                                                sx={{
                                                    bgcolor: user.ssoProvider === 'azure' ? 'rgba(0, 120, 212, 0.1)' : 'rgba(102, 126, 234, 0.1)',
                                                    color: user.ssoProvider === 'azure' ? '#0078d4' : '#667eea',
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.admin ? 'Admin' : 'User'}
                                                size="small"
                                                sx={{
                                                    bgcolor: user.admin ? 'rgba(255, 107, 107, 0.1)' : 'rgba(0, 188, 212, 0.1)',
                                                    color: user.admin ? '#FF6B6B' : '#00BCD4',
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {user.lastLogin ? (
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <LoginIcon sx={{ fontSize: 16, color: '#28a745' }} />
                                                    <Typography variant="body2">
                                                        {moment(user.lastLogin).fromNow()}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Never
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {user.lastLogout ? (
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <LogoutIcon sx={{ fontSize: 16, color: '#dc3545' }} />
                                                    <Typography variant="body2">
                                                        {moment(user.lastLogout).fromNow()}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Never
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {user.createdAt ? moment(user.createdAt).format('MMM DD, YYYY') : '--'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Typography variant="body2" color="text.secondary">
                                            No users found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </Box>
    );
}
