import * as React from 'react';
import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Button, Box, Chip } from '@mui/material';
import { saveAs } from 'file-saver';
import moment from 'moment';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TableViewIcon from '@mui/icons-material/TableView';
import * as XLSX from 'xlsx';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';

interface IS3ObjectsTable {
    tableData?: any[];
    loading?: boolean;
    currentPage?: number;
    pageSize?: number;
    onObjectClick?: (object: any) => void;
}

export default function S3ObjectsTable({ tableData, loading = false, currentPage = 1, pageSize = 10, onObjectClick }: IS3ObjectsTable) {
    const apiRef = useGridApiRef();

    // Handle undefined tableData
    const actualData = tableData || [];
    
    // Calculate starting serial number for current page
    const startingSerialNo = (currentPage - 1) * pageSize;

    const formatBytes = (bytes: number | string) => {
        const numBytes = typeof bytes === "string" ? parseFloat(bytes) : bytes;
        if (isNaN(numBytes) || numBytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
        if (numBytes < k) return Math.round(numBytes * 100) / 100 + " B";
        const i = Math.floor(Math.log(Math.max(numBytes, 1)) / Math.log(k));
        const value = numBytes / Math.pow(k, i);
        return (Math.round(value * 100) / 100).toFixed(2) + " " + sizes[Math.min(i, sizes.length - 1)];
    };

    const getStorageClassColor = (storageClass: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
        switch (storageClass) {
            case "STANDARD":
                return "primary";
            case "STANDARD_IA":
            case "ONEZONE_IA":
                return "warning";
            case "GLACIER":
            case "GLACIER_IR":
                return "info";
            case "DEEP_ARCHIVE":
                return "error";
            case "INTELLIGENT_TIERING":
                return "success";
            default:
                return "default";
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'serialNo',
            headerName: 'Sr No.',
            width: 80,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'objectName',
            headerName: 'Object Name',
            flex: 1,
            minWidth: 300,
            renderCell: (params) => (
                <Box display="flex" alignItems="center" gap={1}>
                    {params.row.isFolder ? 
                        <FolderIcon sx={{ color: "#ff9900", fontSize: 20 }} /> : 
                        <DescriptionIcon sx={{ color: "#0073bb", fontSize: 20 }} />
                    }
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {params.value}
                    </span>
                </Box>
            )
        },
        {
            field: 'size',
            headerName: 'Size',
            width: 120,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'storageClass',
            headerName: 'Storage Class',
            width: 180,
            renderCell: (params) => (
                <Chip 
                    label={params.value} 
                    size="small" 
                    color={getStorageClassColor(params.value)}
                    variant="outlined"
                />
            )
        },
        {
            field: 'lastModified',
            headerName: 'Last Modified',
            width: 200
        },
        {
            field: 'etag',
            headerName: 'ETag',
            width: 200,
            renderCell: (params) => (
                <span style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.8rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {params.value}
                </span>
            )
        },
    ];

    const rows = actualData.map((data, index) => ({
        id: data?.Key || data?.name || index,
        serialNo: startingSerialNo + index + 1,
        objectName: data?.Key || data?.name || "N/A",
        size: formatBytes(data?.Size || data?.size || 0),
        storageClass: data?.StorageClass || data?.storageClass || "STANDARD",
        lastModified: data?.LastModified || data?.lastModified
            ? moment(data?.LastModified || data?.lastModified).format("DD MMM YYYY HH:mm:ss")
            : "N/A",
        etag: data?.ETag || data?.etag || "N/A",
        isFolder: data?.isFolder || false
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
        saveAs(blob, `S3_Objects_${timestamp}.csv`);
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
        XLSX.utils.book_append_sheet(workbook, worksheet, 'S3 Objects');

        const colWidths = columnsToExport.map(col => ({ wch: Math.max(col.width ? col.width / 10 : 15, 10) }));
        worksheet['!cols'] = colWidths;

        const timestamp = new Date().toISOString().split('T')[0];
        XLSX.writeFile(workbook, `S3_Objects_${timestamp}.xlsx`);
    };

    return (
        <div>
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
                    hideFooter
                    autoHeight
                    onRowClick={(params) => {
                        if (onObjectClick) {
                            const actualIndex = params.row.serialNo - startingSerialNo - 1;
                            onObjectClick(actualData[actualIndex]);
                        }
                    }}
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-cell:focus': {
                            outline: 'none',
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: 'rgba(255, 153, 0, 0.04)',
                            cursor: 'pointer',
                        },
                    }}
                />
            </Paper>
        </div>
    );
}
