import * as React from 'react';
import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Button, Box } from '@mui/material';
import { saveAs } from 'file-saver';
import moment from 'moment';

interface IRDSTable {
    tableData: any[];
    loading?: boolean;
}

export default function RDSTable({ tableData, loading = false }: IRDSTable) {
    const apiRef = useGridApiRef();
    const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });

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

    const rows = tableData.map((data, index) => ({
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
        saveAs(blob, 'rds_databases.csv');
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
