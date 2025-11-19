import * as React from 'react';
import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Button, Box, CircularProgress } from '@mui/material';
import { saveAs } from 'file-saver';
import { Spinner } from 'react-bootstrap';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TableViewIcon from '@mui/icons-material/TableView';
import * as XLSX from 'xlsx';

interface IStatusCheckTable {
    tableData: any[];
    loading: boolean;
    fetchData: () => void;
    allRegionsMode?: boolean;
    regionName?: string;
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

export default function StatusCheckTable({ tableData, loading, fetchData, allRegionsMode = false, regionName = '' }: IStatusCheckTable) {
    const apiRef = useGridApiRef();
    const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
    const isLoading = loading;

    const columns: GridColDef[] = [
        { field: 'serialNo', headerName: 'Sr No.', width: 70, resizable: true },
        { field: 'instanceName', headerName: 'Name', width: 150 },
        { field: 'instanceId', headerName: 'ID', width: 200 },
        { field: 'region', headerName: 'Region', width: 150 },
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
        {
            field: 'alloyStatus',
            headerName: 'Alloy',
            width: 100,
            renderCell: (params) => getStatusBadge(params.value)
        },
        { field: 'cloudWatchVersion', headerName: 'CW Ver', width: 100 },
        { field: 'crowdStrikeVersion', headerName: 'CS Ver', width: 100 },
        { field: 'qualysVersion', headerName: 'Q Ver', width: 100 },
        { field: 'zabbixAgentVersion', headerName: 'ZB Ver', width: 100 },
        { field: 'alloyVersion', headerName: 'Alloy Ver', width: 100 },
        { field: 'platform', headerName: 'Platform', width: 120 },
        { field: "date", headerName: "Date", width: 150 },
        { field: "error", headerName: "Error", width: 200 },
    ];

    const rows = tableData.map((data, index) => ({
        id: index + 1,
        serialNo: index + 1,
        instanceName: data?.instanceName || '--',
        instanceId: data?.instanceId || '--',
        region: data?.regionInfo || data?.region || '--',
        ip: data?.ip || '--',
        os: data?.os || '--',
        state: data?.state || '--',
        cloudWatchStatus: data?.services?.cloudWatch || '--',
        crowdStrikeStatus: data?.services?.crowdStrike || '--',
        qualysStatus: data?.services?.qualys || '--',
        zabbixAgentStatus: data?.services?.zabbixAgent || '--',
        alloyStatus: data?.services?.alloy || '--',
        cloudWatchVersion: data?.versions?.cloudWatch || 'N/A',
        crowdStrikeVersion: data?.versions?.crowdStrike || 'N/A',
        qualysVersion: data?.versions?.qualys || 'N/A',
        zabbixAgentVersion: data?.versions?.zabbixAgent || 'N/A',
        alloyVersion: data?.versions?.alloy || 'N/A',
        platform: data?.platform || '--',
        date: data?.createdAt ? new Date(data.createdAt).toLocaleString() : new Date().toLocaleString(),
        error: data?.error || '--'
    }));

    const dynamicHeight = rows.length > 0 ? 600 : 200;

    const handleExportCSV = () => {
        const selectedIDs = new Set(apiRef.current.getSelectedRows().keys());
        const exportRows = selectedIDs.size > 0
            ? rows.filter(row => selectedIDs.has(row.id))
            : rows;

        // Get visible columns from the DataGrid
        const visibleColumns = columns.filter(col =>
            apiRef.current.getColumn(col.field)?.computedWidth > 0
        );
        const columnsToExport = visibleColumns.length > 0 ? visibleColumns : columns;

        const csvContent = [
            columnsToExport.map(col => col.headerName).join(','),
            ...exportRows.map(row =>
                columnsToExport.map(col => {
                    const val = row[col.field as keyof typeof row];
                    return typeof val === 'string' ? `"${val}"` : val;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const timestamp = new Date().toISOString().split('T')[0];
        const regionSuffix = allRegionsMode ? 'All_Regions' : (regionName || 'Single_Region');
        const filename = `Agent_Status_${regionSuffix}_${timestamp}.csv`;
        saveAs(blob, filename);
    };

    const handleExportExcel = () => {
        const selectedIDs = new Set(apiRef.current.getSelectedRows().keys());
        const exportRows = selectedIDs.size > 0
            ? rows.filter(row => selectedIDs.has(row.id))
            : rows;

        // Get visible columns from the DataGrid
        const visibleColumns = columns.filter(col =>
            apiRef.current.getColumn(col.field)?.computedWidth > 0
        );
        const columnsToExport = visibleColumns.length > 0 ? visibleColumns : columns;

        const workbook = XLSX.utils.book_new();

        if (allRegionsMode) {
            // Group data by region for separate sheets
            const dataByRegion: { [key: string]: any[] } = {};

            exportRows.forEach(row => {
                const region = row.region || 'Unknown';
                if (!dataByRegion[region]) {
                    dataByRegion[region] = [];
                }
                dataByRegion[region].push(row);
            });

            // Create a sheet for each region
            Object.keys(dataByRegion).sort().forEach(region => {
                const regionRows = dataByRegion[region];
                const excelData = regionRows.map(row => {
                    const rowData: any = {};
                    columnsToExport.forEach(col => {
                        rowData[col.headerName] = row[col.field as keyof typeof row];
                    });
                    return rowData;
                });

                const worksheet = XLSX.utils.json_to_sheet(excelData);

                // Set column widths
                const colWidths = columnsToExport.map(col => ({ wch: Math.max(col.width / 10, 10) }));
                worksheet['!cols'] = colWidths;

                // Sanitize sheet name (Excel has restrictions on sheet names)
                const sanitizedRegionName = region.replace(/[:\\/?*\[\]]/g, '_').substring(0, 31);
                XLSX.utils.book_append_sheet(workbook, worksheet, sanitizedRegionName);
            });

            // Add a summary sheet with all data
            const allData = exportRows.map(row => {
                const rowData: any = {};
                columnsToExport.forEach(col => {
                    rowData[col.headerName] = row[col.field as keyof typeof row];
                });
                return rowData;
            });
            const summarySheet = XLSX.utils.json_to_sheet(allData);
            const colWidths = columnsToExport.map(col => ({ wch: Math.max(col.width / 10, 10) }));
            summarySheet['!cols'] = colWidths;
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'All Regions Summary');
        } else {
            // Single region - create one sheet
            const excelData = exportRows.map(row => {
                const rowData: any = {};
                columnsToExport.forEach(col => {
                    rowData[col.headerName] = row[col.field as keyof typeof row];
                });
                return rowData;
            });

            const worksheet = XLSX.utils.json_to_sheet(excelData);

            // Set column widths
            const colWidths = columnsToExport.map(col => ({ wch: Math.max(col.width / 10, 10) }));
            worksheet['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(workbook, worksheet, 'Agent Status');
        }

        // Generate filename with timestamp and region info
        const timestamp = new Date().toISOString().split('T')[0];
        const regionSuffix = allRegionsMode ? 'All_Regions' : (regionName || 'Single_Region');
        const filename = `Agent_Status_${regionSuffix}_${timestamp}.xlsx`;

        // Export to Excel
        XLSX.writeFile(workbook, filename);
    };

    return (
        <div>
            <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2} p={2}>
                <Button
                    variant="contained"
                    onClick={fetchData}
                    disabled={loading}
                    startIcon={<RefreshIcon />}
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '8px 20px',
                        borderRadius: '8px',
                        fontWeight: 500,
                        textTransform: 'none',
                        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5568d3 0%, #6a3f92 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                        },
                        '&:disabled': {
                            background: 'rgba(0, 0, 0, 0.12)',
                            color: 'rgba(0, 0, 0, 0.26)',
                        },
                        transition: 'all 0.3s ease'
                    }}
                >
                    {loading ? 'Fetching...' : 'Fetch Agent Status'}
                </Button>
                <Button
                    variant="contained"
                    onClick={handleExportCSV}
                    startIcon={<FileDownloadIcon />}
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
                <Button
                    variant="contained"
                    onClick={handleExportExcel}
                    startIcon={<TableViewIcon />}
                    sx={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        padding: '8px 20px',
                        borderRadius: '8px',
                        fontWeight: 500,
                        textTransform: 'none',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                        },
                        transition: 'all 0.3s ease'
                    }}
                >
                    Export to Excel
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
