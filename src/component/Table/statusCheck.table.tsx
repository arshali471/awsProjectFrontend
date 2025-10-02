import * as React from 'react';
import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Button, Box, CircularProgress } from '@mui/material';
import { saveAs } from 'file-saver';
import { Spinner } from 'react-bootstrap';

interface IStatusCheckTable {
    tableData: any[];
    loading: boolean;
    fetchData: () => void;
}

const getStatusBadge = (status: string) => {
    const baseStyle = {
        borderRadius: '4px',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
        padding: '3px 6px',
    };
    if (!status || status === '--') return <span style={{ ...baseStyle, backgroundColor: '#6c757d' }}>--</span>;
    const lower = status.toLowerCase();
    if (["active", "running", "ok"].includes(lower)) return <span style={{ ...baseStyle, backgroundColor: '#28a745' }}>{status}</span>;
    if (["inactive", "stopped", "failed"].includes(lower)) return <span style={{ ...baseStyle, backgroundColor: '#dc3545' }}>{status}</span>;
    return <span style={{ ...baseStyle, backgroundColor: '#6c757d' }}>{status}</span>;
};

export default function StatusCheckTable({ tableData, loading, fetchData }: IStatusCheckTable) {
    const apiRef = useGridApiRef();
    const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
    const isLoading = loading;

    const columns: GridColDef[] = [
        { field: 'serialNo', headerName: 'Sr No.', width: 70, resizable: true },
        { field: 'instanceName', headerName: 'Name', width: 150 },
        { field: 'instanceId', headerName: 'ID', width: 200 },
        { field: 'ip', headerName: 'IP', width: 150 },
        { field: 'os', headerName: 'OS', width: 100 },
        {
            field: 'state',
            headerName: 'State',
            width: 100,
            renderCell: (params) => getStatusBadge(params.value)
        },
        {
            field: 'cloudWatchStatus',
            headerName: 'CloudWatch',
            width: 120,
            renderCell: (params) => getStatusBadge(params.value)
        },
        {
            field: 'crowdStrikeStatus',
            headerName: 'CrowdStrike',
            width: 120,
            renderCell: (params) => getStatusBadge(params.value)
        },
        {
            field: 'qualysStatus',
            headerName: 'Qualys',
            width: 100,
            renderCell: (params) => getStatusBadge(params.value)
        },
        {
            field: 'zabbixAgentStatus',
            headerName: 'Zabbix',
            width: 100,
            renderCell: (params) => getStatusBadge(params.value)
        },
        { field: 'cloudWatchVersion', headerName: 'CW Ver', width: 100 },
        { field: 'crowdStrikeVersion', headerName: 'CS Ver', width: 100 },
        { field: 'qualysVersion', headerName: 'Q Ver', width: 100 },
        { field: 'zabbixAgentVersion', headerName: 'ZB Ver', width: 100 },
        { field: 'platform', headerName: 'Platform', width: 120 },
        { field: "date", headerName: "Date", width: 150 },
        { field: "error", headerName: "Error", width: 200 },
    ];

    const rows = tableData.map((data, index) => ({
        id: index + 1,
        serialNo: index + 1,
        instanceName: data?.instanceName || '--',
        instanceId: data?.instanceId || '--',
        ip: data?.ip || '--',
        os: data?.os || '--',
        state: data?.state || '--',
        cloudWatchStatus: data?.services?.cloudWatch || '--',
        crowdStrikeStatus: data?.services?.crowdStrike || '--',
        qualysStatus: data?.services?.qualys || '--',
        zabbixAgentStatus: data?.services?.zabbixAgent || '--',
        cloudWatchVersion: data?.versions?.cloudWatch || 'N/A',
        crowdStrikeVersion: data?.versions?.crowdStrike || 'N/A',
        qualysVersion: data?.versions?.qualys || 'N/A',
        zabbixAgentVersion: data?.versions?.zabbixAgent || 'N/A',
        platform: data?.platform || '--',
        date: data?.createdAt ? new Date(data.createdAt).toLocaleString() : new Date().toLocaleString(),
        error: data?.error || '--'
    }));

    const dynamicHeight = rows.length > 0 ? 600 : 200;

    const handleExport = () => {
        const selectedIDs = new Set(apiRef.current.getSelectedRows().keys());
        const exportRows = selectedIDs.size > 0
            ? rows.filter(row => selectedIDs.has(row.id))
            : rows;

        const csvContent = [
            columns.map(col => col.headerName).join(','),
            ...exportRows.map(row =>
                columns.map(col => {
                    const val = row[col.field as keyof typeof row];
                    return typeof val === 'string' ? `"${val}"` : val;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'statusInventory.csv');
    };

    return (
        <div>
            <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2} p={2}>
                <Button
                    variant="contained"
                    onClick={handleExport}
                    sx={{
                        background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                        color: 'white',
                        padding: '8px 20px',
                        borderRadius: '8px',
                        fontWeight: 500,
                        textTransform: 'none',
                        boxShadow: '0 2px 8px rgba(0, 115, 187, 0.3)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #005a92 0%, #0073bb 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0, 115, 187, 0.4)',
                        },
                        transition: 'all 0.3s ease'
                    }}
                >
                    Export to CSV
                </Button>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #e0e0e0'
                }}
            >
                <DataGrid
                    apiRef={apiRef}
                    rows={rows}
                    columns={columns}
                    loading={isLoading}
                    pagination
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 25, 50, 100]}
                    checkboxSelection
                    disableRowSelectionOnClick
                    autoHeight
                    sx={{
                        border: 0,
                        '& .MuiDataGrid-cell:focus': {
                            outline: 'none',
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: 'rgba(0, 115, 187, 0.04)',
                        },
                    }}
                />
            </Paper>
        </div>
    );
}
