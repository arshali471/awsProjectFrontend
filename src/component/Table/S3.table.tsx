import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Button, Box } from '@mui/material';
import { saveAs } from 'file-saver';
import moment from 'moment';

interface IS3Table {
    tableData: any[];
    loading?: boolean;
}

export default function S3Table({ tableData, loading = false }: IS3Table) {
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

    const handleExport = () => {
        const csvContent = [
            columns.map(col => col.headerName).join(','),
            ...rows.map(row =>
                columns.map(col => {
                    const val = row[col.field as keyof typeof row];
                    return typeof val === 'string' ? `"${val}"` : val;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 's3_buckets.csv');
    };

    return (
        <div>
            <Box display="flex" justifyContent="flex-end" p={2}>
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
                    width: '100%',
                    height: 'auto',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #e0e0e0'
                }}
            >
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    pagination
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 25, 50, 100]}
                    disableRowSelectionOnClick
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
