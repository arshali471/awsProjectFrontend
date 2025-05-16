import * as React from 'react';
import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Button, Box, CircularProgress } from '@mui/material';
import { saveAs } from 'file-saver';

interface IStatusCheckTable {
    tableData: any[];
    loading: boolean;
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

export default function StatusCheckTable({ tableData, loading }: IStatusCheckTable) {
    const apiRef = useGridApiRef();
    // Using the loading prop instead of inferring from tableData
    const isLoading = loading;

    const columns: GridColDef[] = [
        { field: 'serialNo', headerName: 'Sr#', width: 70, resizable: true },
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
            <Box display="flex" justifyContent="flex-end" p={1}>
                <Button onClick={handleExport} variant="contained" color="primary">
                    Export to CSV
                </Button>
            </Box>

            <Paper sx={{
                width: '100%',
                position: 'relative',
                minHeight: rows.length === 0 || isLoading ? 300 : 'auto', // fallback height only if no data
            }}>
                <DataGrid
                    apiRef={apiRef}
                    rows={rows}
                    columns={columns}
                    loading={isLoading}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                page: 0,
                                pageSize: tableData.length || 10
                            }
                        }
                    }}

                    pageSizeOptions={[10, 20, 50]}
                    checkboxSelection
                    sx={{
                        border: 0, width: '100%',
                        position: 'relative',
                        minHeight: rows.length === 0 || isLoading ? 300 : 'auto',
                    }}
                />
            </Paper>
        </div>

    );
}
