import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Button, Box, Chip } from '@mui/material';
import { saveAs } from 'file-saver';
import moment from 'moment';

interface IVolumesTable {
    tableData: any[];
    loading?: boolean;
}

export default function VolumesTable({ tableData, loading = false }: IVolumesTable) {
    const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });

    const columns: GridColDef[] = [
        { field: 'serialNo', headerName: 'Sr No.', width: 70 },
        { field: 'volumeId', headerName: 'Volume ID', width: 200 },
        {
            field: 'state',
            headerName: 'State',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={params.value === 'in-use' ? 'success' : 'default'}
                    sx={{ fontWeight: 500 }}
                />
            )
        },
        { field: 'size', headerName: 'Size (GB)', width: 100 },
        { field: 'volumeType', headerName: 'Volume Type', width: 120 },
        { field: 'iops', headerName: 'IOPS', width: 100 },
        { field: 'throughput', headerName: 'Throughput', width: 120 },
        { field: 'snapshotId', headerName: 'Snapshot ID', width: 200 },
        { field: 'availabilityZone', headerName: 'Availability Zone', width: 150 },
        {
            field: 'encrypted',
            headerName: 'Encrypted',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Yes' : 'No'}
                    size="small"
                    color={params.value ? 'success' : 'default'}
                    sx={{ fontWeight: 500 }}
                />
            )
        },
        { field: 'createdAt', headerName: 'Created At', width: 150 },
        { field: 'attachedInstances', headerName: 'Attached Instances', width: 300 },
        {
            field: 'attachmentStatus',
            headerName: 'Attachment Status',
            width: 150,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={params.value === 'Attached' ? 'success' : 'error'}
                    sx={{ fontWeight: 500 }}
                />
            )
        },
    ];

    const rows = tableData.map((data, index) => ({
        id: index + 1,
        serialNo: index + 1,
        volumeId: data.volumeId || "--",
        state: data.state || "--",
        size: data.size || "--",
        volumeType: data.volumeType || "--",
        iops: data.iops || "--",
        throughput: data.throughput || "--",
        snapshotId: data.snapshotId || "--",
        availabilityZone: data.availabilityZone || "--",
        encrypted: data.encrypted || false,
        createdAt: data.createdAt ? moment(data.createdAt).format("DD MMM YY") : "--",
        attachedInstances: data.attachedInstances?.length > 0 ? data.attachedInstances.join(", ") : "--",
        attachmentStatus: data.attachedInstances?.length > 0 ? "Attached" : "Unattached",
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
        saveAs(blob, 'volumes.csv');
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

            <Paper elevation={0} sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
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
