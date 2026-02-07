import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Button, Box } from '@mui/material';
import { saveAs } from 'file-saver';
import moment from 'moment';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TableViewIcon from '@mui/icons-material/TableView';
import * as XLSX from 'xlsx';

interface IRDSTable {
    data?: any[];
    tableData?: any[];
    loading?: boolean;
    searchText?: string;
    setSearchText?: (text: string) => void;
    onRowClick?: (instance: any) => void;
}

export default function RDSTable({ data, tableData, loading = false, searchText, setSearchText, onRowClick }: IRDSTable) {
    const navigate = useNavigate();
    const apiRef = useGridApiRef();
    const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });

    // Support both 'data' and 'tableData' props for backward compatibility
    const actualData = data || tableData || [];

    const columns: GridColDef[] = [
        { field: 'serialNo', headerName: 'Sr No.', width: 70 },
        { field: 'instanceId', headerName: 'Instance ID', width: 250 },
        { field: 'status', headerName: 'Status', width: 120 },
        { field: 'engine', headerName: 'Engine', width: 120 },
        { field: 'engineVersion', headerName: 'Engine Version', width: 140 },
        { field: 'storage', headerName: 'Storage (GB)', width: 120 },
        { field: 'instanceClass', headerName: 'Instance Class', width: 150 },
        { field: 'vpcId', headerName: 'VPC ID', width: 200 },
        { field: 'subnetGroup', headerName: 'Subnet Group', width: 200 },
        { field: 'availabilityZone', headerName: 'Availability Zone', width: 150 },
        { field: 'createdAt', headerName: 'Created At', width: 150 },
        { field: 'endpoint', headerName: 'Endpoint', width: 300 },
        { field: 'securityGroups', headerName: 'Security Groups', width: 250 },
    ];

    const rows = actualData.map((data, index) => ({
        id: index + 1,
        serialNo: index + 1,
        instanceId: data.instanceId || "--",
        status: data.status || "--",
        engine: data.engine || "--",
        engineVersion: data.engineVersion || "--",
        storage: data.storage || "--",
        instanceClass: data.instanceClass || "--",
        vpcId: data.vpcId || "--",
        subnetGroup: data.subnetGroup || "--",
        availabilityZone: data.availabilityZone || "--",
        createdAt: data.createdAt ? moment(data.createdAt).format("DD MMM YYYY") : "--",
        endpoint: data.endpoint || "--",
        securityGroups: Array.isArray(data.securityGroups) ? data.securityGroups.join(", ") : (data.securityGroups || "--"),
    }));

    const handleExportCSV = () => {
        const selectedIDs = new Set(apiRef.current.getSelectedRows().keys());
        const exportRows = selectedIDs.size > 0
            ? rows.filter(row => selectedIDs.has(row.id))
            : rows;

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
        saveAs(blob, `RDS_Instances_${timestamp}.csv`);
    };

    const handleExportExcel = () => {
        const selectedIDs = new Set(apiRef.current.getSelectedRows().keys());
        const exportRows = selectedIDs.size > 0
            ? rows.filter(row => selectedIDs.has(row.id))
            : rows;

        const visibleColumns = columns.filter(col =>
            apiRef.current.getColumn(col.field)?.computedWidth > 0
        );
        const columnsToExport = visibleColumns.length > 0 ? visibleColumns : columns;

        const excelData = exportRows.map(row => {
            const rowData: any = {};
            columnsToExport.forEach(col => {
                rowData[col.headerName] = row[col.field as keyof typeof row];
            });
            return rowData;
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'RDS Instances');

        const colWidths = columnsToExport.map(col => ({ wch: Math.max(col.width / 10, 10) }));
        worksheet['!cols'] = colWidths;

        const timestamp = new Date().toISOString().split('T')[0];
        XLSX.writeFile(workbook, `RDS_Instances_${timestamp}.xlsx`);
    };

    return (
        <div>
            <Box display="flex" justifyContent="flex-end" gap={2} p={2}>
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
                    Export CSV
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
                    Export Excel
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
                    loading={loading}
                    checkboxSelection
                    pagination
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 25, 50, 100]}
                    autoHeight
                    onRowClick={(params) => {
                        const instanceData = actualData.find(item => item.instanceId === params.row.instanceId);
                        if (instanceData) {
                            // Use custom onRowClick if provided (for modal), otherwise navigate to detail page
                            if (onRowClick) {
                                onRowClick(instanceData);
                            } else {
                                navigate(`/platform/rds/instance/${params.row.instanceId}`, {
                                    state: { instance: instanceData }
                                });
                            }
                        }
                    }}
                    sx={{
                        border: 0,
                        '& .MuiDataGrid-cell:focus': {
                            outline: 'none',
                        },
                        '& .MuiDataGrid-row': {
                            cursor: 'pointer',
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
