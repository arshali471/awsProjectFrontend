import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Button, Box, Chip } from '@mui/material';
import { saveAs } from 'file-saver';
import moment from 'moment';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface IEC2AllRegionsTable {
    tableData: any[];
    loading?: boolean;
}

export default function EC2AllRegionsTable({ tableData, loading }: IEC2AllRegionsTable) {
    const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 25 });

    const columns: GridColDef[] = [
        { field: 'serialNo', headerName: 'Sr No.', width: 70 },
        {
            field: 'State',
            headerName: 'State',
            width: 110,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={params.value?.toLowerCase() === 'running' ? 'success' : 'error'}
                    size="small"
                    sx={{ fontWeight: 'bold', fontSize: '11px' }}
                />
            )
        },
        { field: 'InstanceName', headerName: 'Instance Name', width: 200 },
        { field: 'InstanceId', headerName: 'Instance ID', width: 180 },
        { field: 'InstanceType', headerName: 'Instance Type', width: 120 },
        { field: 'PrivateIpAddress', headerName: 'Private IP', width: 130 },
        { field: 'PublicIpAddress', headerName: 'Public IP', width: 130 },
        { field: 'AvailabilityZone', headerName: 'Availability Zone', width: 150 },
        { field: 'LaunchTime', headerName: 'Launch Time', width: 160 },
        { field: 'Platform', headerName: 'Platform', width: 120 },
        { field: 'VpcId', headerName: 'VPC ID', width: 200 },
        { field: 'SubnetId', headerName: 'Subnet ID', width: 200 },
        { field: 'KeyName', headerName: 'Key Name', width: 150 },
        {
            field: 'Environment',
            headerName: 'Environment',
            width: 130,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    variant="outlined"
                    size="small"
                    color="primary"
                />
            )
        },
        {
            field: 'Region',
            headerName: 'Region',
            width: 130,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    variant="outlined"
                    size="small"
                    color="secondary"
                />
            )
        },
    ];

    const rows = tableData.map((data, index) => ({
        id: index + 1,
        serialNo: index + 1,
        InstanceName: data?.InstanceName || 'N/A',
        InstanceId: data?.InstanceId || 'N/A',
        InstanceType: data?.InstanceType || 'N/A',
        State: data?.State || 'N/A',
        PrivateIpAddress: data?.PrivateIpAddress || 'N/A',
        PublicIpAddress: data?.PublicIpAddress || 'N/A',
        AvailabilityZone: data?.AvailabilityZone || 'N/A',
        LaunchTime: data?.LaunchTime ? moment(data.LaunchTime).format("DD MMM YYYY, hh:mm A") : 'N/A',
        Platform: data?.Platform || 'N/A',
        VpcId: data?.VpcId || 'N/A',
        SubnetId: data?.SubnetId || 'N/A',
        KeyName: data?.KeyName || 'N/A',
        Environment: data?.Environment || 'N/A',
        Region: data?.Region || 'N/A',
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
        const filename = `EC2_All_Regions_${moment().format('YYYY-MM-DD_HHmmss')}.csv`;
        saveAs(blob, filename);
    };

    return (
        <div>
            <Box display="flex" justifyContent="flex-end" p={2}>
                <Button
                    onClick={handleExport}
                    variant="contained"
                    startIcon={<FileDownloadIcon />}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        background: 'linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5a32a3 0%, #4a2885 100%)',
                        },
                    }}
                >
                    Export to CSV
                </Button>
            </Box>

            <Paper sx={{
                width: '100%',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }} elevation={0}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    pagination
                    paginationMode="client"
                    paginationModel={paginationModel}
                    onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
                    pageSizeOptions={[10, 25, 50, 100]}
                    autoHeight
                    sx={{
                        border: 0,
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid #f0f0f0',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f8f9fa',
                            borderBottom: '2px solid #e0e0e0',
                            fontWeight: 'bold',
                        },
                    }}
                />
            </Paper>
        </div>
    );
}
