import * as React from 'react';
import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Button, Box } from '@mui/material';
import { saveAs } from 'file-saver';
import moment from 'moment';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TableViewIcon from '@mui/icons-material/TableView';
import * as XLSX from 'xlsx';

interface IS3Table {
    tableData: any[];
    loading?: boolean;
}

export default function S3Table({ tableData, loading = false }: IS3Table) {
    const apiRef = useGridApiRef();
    const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });

    const columns: GridColDef[] = [
        {
            field: 'serialNo',
            headerName: 'Sr No.',
            width: 80,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'bucketName',
            headerName: 'Bucket Name',
            flex: 1,
            minWidth: 250
        },
        {
            field: 'creationDate',
            headerName: 'Creation Date',
            width: 180
        },
        {
            field: 'location',
            headerName: 'Region',
            width: 150
        },
        {
            field: 'size',
            headerName: 'Size',
            width: 120,
            align: 'right',
            headerAlign: 'right'
        },
    ];

    const rows = tableData.map((data, index) => ({
        id: data?.Name || index,
        serialNo: index + 1,
        bucketName: data?.Name || data?.bucketName || "N/A",
        creationDate: data?.CreationDate || data?.creationDate
            ? moment(data?.CreationDate || data?.creationDate).format("DD MMM YYYY")
            : "N/A",
        location: data?.LocationConstraint || data?.location || "us-east-1",
        size: data?.size || "N/A",
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
        saveAs(blob, `S3_Buckets_${timestamp}.csv`);
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
        XLSX.utils.book_append_sheet(workbook, worksheet, 'S3 Buckets');

        const colWidths = columnsToExport.map(col => ({ wch: Math.max(col.width / 10, 10) }));
        worksheet['!cols'] = colWidths;

        const timestamp = new Date().toISOString().split('T')[0];
        XLSX.writeFile(workbook, `S3_Buckets_${timestamp}.xlsx`);
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
                    width: '100%',
                    height: 'auto',
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
                    disableRowSelectionOnClick
                    pagination
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 25, 50, 100]}
                    autoHeight
                    sx={{
                        border: 'none',
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
