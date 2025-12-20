// @ts-nocheck
import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { AdminService } from "../../../services/admin.service";
import { useNavigate } from "react-router-dom";
import {
    Box, Typography, Paper, IconButton, Grid, Card, CardContent,
    TextField, Select, MenuItem, FormControl, InputLabel, Chip, CircularProgress, Button
} from "@mui/material";
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import SpeedIcon from "@mui/icons-material/Speed";
import ApiIcon from "@mui/icons-material/Api";
import RefreshIcon from "@mui/icons-material/Refresh";
import BlockIcon from "@mui/icons-material/Block";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import TableViewIcon from "@mui/icons-material/TableView";
import moment from "moment";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import ApiLogDetailsModal from "../../../modal/ApiLogDetails.modal";

export default function ApiLogs() {
    const navigate = useNavigate();
    const apiRef = useGridApiRef();

    const [logs, setLogs] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

    // Filters
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 100 });
    const [totalLogs, setTotalLogs] = useState(0);
    const [method, setMethod] = useState("");
    const [statusCode, setStatusCode] = useState("");
    const [endpoint, setEndpoint] = useState("");
    const [username, setUsername] = useState("");
    const [startDate, setStartDate] = useState(moment().subtract(7, 'days').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));

    // Log Details Modal
    const [showLogDetailsModal, setShowLogDetailsModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState<any>(null);

    const checkAdminAccess = async () => {
        try {
            // Check sessionStorage first
            const userRole = sessionStorage.getItem('role');
            const adminFlag = sessionStorage.getItem('admin');

            if (userRole === 'admin' || adminFlag === 'true') {
                setIsAdmin(true);
                setCheckingAuth(false);
                return;
            }

            // Fallback to API call
            const res = await AdminService.getUserData();
            if (res.status === 200 && res.data.admin) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        } catch (error) {
            console.error("Error checking admin access:", error);
            setIsAdmin(false);
        }
        setCheckingAuth(false);
    };

    const fetchLogs = async () => {
        if (!isAdmin) return;

        setLoading(true);
        try {
            const res = await AdminService.getApiLogs({
                page: paginationModel.page + 1,
                limit: paginationModel.pageSize,
                method: method || undefined,
                statusCode: statusCode || undefined,
                endpoint: endpoint || undefined,
                username: username || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined
            });

            if (res.status === 200 && res.data.success) {
                setLogs(res.data.data);
                setTotalLogs(res.data.pagination.total);
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
            setLogs([]);
            setTotalLogs(0);
        }
        setLoading(false);
    };

    const fetchStats = async () => {
        if (!isAdmin) return;

        try {
            const res = await AdminService.getApiStats({
                startDate: startDate || undefined,
                endDate: endDate || undefined
            });

            if (res.status === 200 && res.data.success) {
                setStats(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    useEffect(() => {
        checkAdminAccess();
    }, []);

    useEffect(() => {
        if (isAdmin && !checkingAuth) {
            fetchLogs();
            fetchStats();
        }
    }, [isAdmin, checkingAuth, paginationModel, method, statusCode, startDate, endDate]);

    const handleRefresh = () => {
        fetchLogs();
        fetchStats();
    };

    const getStatusColor = (statusCode: number) => {
        if (statusCode < 300) return 'success';
        if (statusCode < 400) return 'info';
        if (statusCode < 500) return 'warning';
        return 'error';
    };

    const getMethodColor = (method: string) => {
        const colors: any = {
            'GET': 'primary',
            'POST': 'success',
            'PUT': 'warning',
            'DELETE': 'error',
            'PATCH': 'info'
        };
        return colors[method] || 'default';
    };

    const handleExportCSV = () => {
        const exportColumns = [
            { field: 'createdAt', headerName: 'Timestamp' },
            { field: 'method', headerName: 'Method' },
            { field: 'endpoint', headerName: 'Endpoint' },
            { field: 'statusCode', headerName: 'Status Code' },
            { field: 'responseTime', headerName: 'Response Time (ms)' },
            { field: 'username', headerName: 'Username' },
            { field: 'ipAddress', headerName: 'IP Address' }
        ];

        const csvContent = [
            exportColumns.map(col => col.headerName).join(','),
            ...rows.map(row =>
                exportColumns.map(col => {
                    let val = row[col.field];

                    // Format timestamp
                    if (col.field === 'createdAt' && val) {
                        val = moment(val).format('YYYY-MM-DD HH:mm:ss');
                    }

                    // Handle null/undefined values
                    if (val === null || val === undefined) {
                        val = '-';
                    }

                    return typeof val === 'string' ? `"${val}"` : val;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const timestamp = moment().format('YYYY-MM-DD_HHmmss');
        saveAs(blob, `API_Logs_${timestamp}.csv`);
    };

    const handleExportExcel = () => {
        const exportColumns = [
            { field: 'createdAt', headerName: 'Timestamp' },
            { field: 'method', headerName: 'Method' },
            { field: 'endpoint', headerName: 'Endpoint' },
            { field: 'statusCode', headerName: 'Status Code' },
            { field: 'responseTime', headerName: 'Response Time (ms)' },
            { field: 'username', headerName: 'Username' },
            { field: 'ipAddress', headerName: 'IP Address' }
        ];

        // Prepare data for Excel export
        const excelData = rows.map(row => {
            const rowData: any = {};
            exportColumns.forEach(col => {
                let val = row[col.field];

                // Format timestamp
                if (col.field === 'createdAt' && val) {
                    val = moment(val).format('YYYY-MM-DD HH:mm:ss');
                }

                // Handle null/undefined values
                if (val === null || val === undefined) {
                    val = '-';
                }

                rowData[col.headerName] = val;
            });
            return rowData;
        });

        // Create worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'API Logs');

        // Set column widths
        const colWidths = exportColumns.map(col => ({ wch: Math.max(col.headerName.length + 5, 15) }));
        worksheet['!cols'] = colWidths;

        // Generate filename with timestamp
        const timestamp = moment().format('YYYY-MM-DD_HHmmss');
        const filename = `API_Logs_${timestamp}.xlsx`;

        // Export to Excel
        XLSX.writeFile(workbook, filename);
    };

    const columns: GridColDef[] = [
        {
            field: 'createdAt',
            headerName: 'Timestamp',
            width: 180,
            renderCell: (params) => moment(params.value).format('YYYY-MM-DD HH:mm:ss')
        },
        {
            field: 'method',
            headerName: 'Method',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={getMethodColor(params.value)}
                    size="small"
                    sx={{ fontWeight: 600, fontSize: 11 }}
                />
            )
        },
        {
            field: 'endpoint',
            headerName: 'Endpoint',
            width: 350,
            flex: 1
        },
        {
            field: 'statusCode',
            headerName: 'Status',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={getStatusColor(params.value)}
                    size="small"
                    sx={{ fontWeight: 600, fontSize: 11 }}
                />
            )
        },
        {
            field: 'responseTime',
            headerName: 'Response Time',
            width: 130,
            renderCell: (params) => `${params.value}ms`
        },
        {
            field: 'username',
            headerName: 'Username',
            width: 150,
            renderCell: (params) => params.value || '-'
        },
        {
            field: 'ipAddress',
            headerName: 'IP Address',
            width: 150,
            renderCell: (params) => params.value || '-'
        }
    ];

    const rows = logs.map((log, index) => ({
        id: log._id || index,
        ...log
    }));

    // Show loading while checking authentication
    if (checkingAuth) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    // Show access denied if not admin
    if (!isAdmin) {
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
                                maxWidth: 500,
                            }}
                        >
                            <BlockIcon sx={{ fontSize: 80, color: '#dc3545', mb: 2 }} />
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#232f3e', mb: 2 }}>
                                Access Denied
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#6c757d', mb: 3 }}>
                                Only administrators can access API logs and monitoring data.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => navigate(-1)}
                                sx={{
                                    background: 'linear-gradient(135deg, #0073bb 0%, #005a94 100%)',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 4,
                                    py: 1.5,
                                }}
                            >
                                Go Back
                            </Button>
                        </Paper>
                    </Box>
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
                                }}
                            >
                                <AssessmentIcon sx={{ fontSize: 32 }} />
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
                                    API Logs & Monitoring
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#6c757d',
                                        mt: 0.5,
                                    }}
                                >
                                    Track API requests, monitor performance, and analyze usage patterns
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Stats Cards */}
                {stats && (
                    <Grid container spacing={2.5} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card
                                elevation={0}
                                sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '12px',
                                    height: '120px',
                                }}
                            >
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                        <ApiIcon sx={{ color: '#ffffff', fontSize: 22 }} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', fontWeight: 500 }}>
                                            TOTAL REQUESTS
                                        </Typography>
                                    </Box>
                                    <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '36px' }}>
                                        {stats.overall?.totalRequests?.toLocaleString() || 0}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card
                                elevation={0}
                                sx={{
                                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                    borderRadius: '12px',
                                    height: '120px',
                                }}
                            >
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                        <CheckCircleIcon sx={{ color: '#ffffff', fontSize: 22 }} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', fontWeight: 500 }}>
                                            SUCCESS
                                        </Typography>
                                    </Box>
                                    <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '36px' }}>
                                        {stats.overall?.successCount?.toLocaleString() || 0}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card
                                elevation={0}
                                sx={{
                                    background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
                                    borderRadius: '12px',
                                    height: '120px',
                                }}
                            >
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                        <ErrorIcon sx={{ color: '#ffffff', fontSize: 22 }} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', fontWeight: 500 }}>
                                            ERRORS
                                        </Typography>
                                    </Box>
                                    <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '36px' }}>
                                        {stats.overall?.errorCount?.toLocaleString() || 0}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card
                                elevation={0}
                                sx={{
                                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                    borderRadius: '12px',
                                    height: '120px',
                                }}
                            >
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                        <SpeedIcon sx={{ color: '#ffffff', fontSize: 22 }} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', fontWeight: 500 }}>
                                            AVG RESPONSE TIME
                                        </Typography>
                                    </Box>
                                    <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '36px' }}>
                                        {stats.overall?.avgResponseTime ? `${stats.overall.avgResponseTime.toFixed(0)}ms` : '0ms'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* Filters */}
                <Paper
                    elevation={0}
                    sx={{
                        mb: 3,
                        p: 2.5,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        border: '1px solid #e9ecef',
                        borderRadius: '16px',
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                        {/* Method Filter */}
                        <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel size="small">Method</InputLabel>
                            <Select
                                value={method}
                                label="Method"
                                size="small"
                                onChange={(e) => setMethod(e.target.value)}
                                sx={{
                                    height: 40,
                                    fontSize: '0.875rem'
                                }}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="GET">GET</MenuItem>
                                <MenuItem value="POST">POST</MenuItem>
                                <MenuItem value="PUT">PUT</MenuItem>
                                <MenuItem value="DELETE">DELETE</MenuItem>
                                <MenuItem value="PATCH">PATCH</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Status Code Filter */}
                        <FormControl sx={{ minWidth: 140 }}>
                            <InputLabel size="small">Status</InputLabel>
                            <Select
                                value={statusCode}
                                label="Status"
                                size="small"
                                onChange={(e) => setStatusCode(e.target.value)}
                                sx={{
                                    height: 40,
                                    fontSize: '0.875rem'
                                }}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="200">200 OK</MenuItem>
                                <MenuItem value="201">201 Created</MenuItem>
                                <MenuItem value="400">400 Bad Request</MenuItem>
                                <MenuItem value="401">401 Unauthorized</MenuItem>
                                <MenuItem value="403">403 Forbidden</MenuItem>
                                <MenuItem value="404">404 Not Found</MenuItem>
                                <MenuItem value="500">500 Server Error</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Endpoint Filter */}
                        <TextField
                            label="Endpoint"
                            value={endpoint}
                            size="small"
                            onChange={(e) => setEndpoint(e.target.value)}
                            placeholder="/api/v1/..."
                            sx={{
                                minWidth: 200,
                                '& .MuiInputBase-root': {
                                    height: 40,
                                    fontSize: '0.875rem'
                                }
                            }}
                        />

                        {/* Username Filter */}
                        <TextField
                            label="Username"
                            value={username}
                            size="small"
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{
                                minWidth: 150,
                                '& .MuiInputBase-root': {
                                    height: 40,
                                    fontSize: '0.875rem'
                                }
                            }}
                        />

                        {/* Start Date Filter */}
                        <TextField
                            type="date"
                            label="Start Date"
                            value={startDate}
                            size="small"
                            onChange={(e) => setStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                minWidth: 160,
                                '& .MuiInputBase-root': {
                                    height: 40,
                                    fontSize: '0.875rem'
                                }
                            }}
                        />

                        {/* End Date Filter */}
                        <TextField
                            type="date"
                            label="End Date"
                            value={endDate}
                            size="small"
                            onChange={(e) => setEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                minWidth: 160,
                                '& .MuiInputBase-root': {
                                    height: 40,
                                    fontSize: '0.875rem'
                                }
                            }}
                        />

                        {/* Spacer to push buttons to the right */}
                        <Box sx={{ flexGrow: 1 }} />

                        {/* Action Buttons */}
                        <Box display="flex" gap={1}>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleExportCSV}
                                startIcon={<FileDownloadIcon />}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 2,
                                    height: 40,
                                    fontSize: '0.813rem',
                                    background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #005a92 0%, #0073bb 100%)',
                                    },
                                }}
                            >
                                CSV
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleExportExcel}
                                startIcon={<TableViewIcon />}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 2,
                                    height: 40,
                                    fontSize: '0.813rem',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                    },
                                }}
                            >
                                Excel
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleRefresh}
                                disabled={loading}
                                startIcon={<RefreshIcon />}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 2,
                                    height: 40,
                                    fontSize: '0.813rem',
                                    background: 'linear-gradient(135deg, #0073bb 0%, #005a94 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #005a94 0%, #004876 100%)',
                                    },
                                }}
                            >
                                Refresh
                            </Button>
                        </Box>
                    </Box>
                </Paper>

                {/* DataGrid Table */}
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: '16px',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        height: 600,
                    }}
                >
                    <DataGrid
                        apiRef={apiRef}
                        rows={rows}
                        columns={columns}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[50, 100, 200]}
                        rowCount={totalLogs}
                        paginationMode="server"
                        loading={loading}
                        onRowClick={(params) => {
                            setSelectedLog(params.row);
                            setShowLogDetailsModal(true);
                        }}
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid #f0f0f0',
                            },
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#f8f9fa',
                                borderBottom: '2px solid #e9ecef',
                                fontWeight: 600,
                            },
                            '& .MuiDataGrid-row': {
                                cursor: 'pointer',
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: '#f8f9fa',
                            },
                        }}
                    />
                </Paper>

                {/* Log Details Modal */}
                <ApiLogDetailsModal
                    show={showLogDetailsModal}
                    handleClose={() => {
                        setShowLogDetailsModal(false);
                        setSelectedLog(null);
                    }}
                    logData={selectedLog}
                />
            </Container>
        </Box>
    );
}
