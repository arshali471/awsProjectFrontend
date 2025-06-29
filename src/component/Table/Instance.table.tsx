// import React from "react";
// import { useTable, useSortBy } from "react-table";
// import { Resizable } from "react-resizable";
// import moment from "moment";
// import { Table, Badge } from "react-bootstrap";
// import "react-resizable/css/styles.css"; // Required for column resizing styles

// interface IInstanceTable {
//     tableData: any[];
//     pageNumber: number;
//     pageSize: number;
// }

// const ResizableColumn = (props: any) => {
//     const { resizeHandler, isResizing, column } = props;
//     return (
//         <div className={`resizable ${isResizing ? "resizing" : ""}`}>
//             {props.children}
//             <div className="resize-handle" onMouseDown={resizeHandler}></div>
//         </div>
//     );
// };

// export default function InstanceTable({ tableData, pageNumber, pageSize }: IInstanceTable) {
//     const columns = React.useMemo(
//         () => [
//             { Header: "Sr.No", accessor: "serialNo", sortType: "number" },
//             { Header: "Instance ID", accessor: "instanceId" },
//             { Header: "Instance Name", accessor: "instanceName" },
//             { Header: "Image ID", accessor: "imageId" },
//             { Header: "Instance Type", accessor: "instanceType" },
//             { Header: "Key Name", accessor: "keyName" },
//             { 
//                 Header: "Launch Time", 
//                 accessor: "launchTime", 
//                 sortType: (rowA, rowB) => new Date(rowA.values.launchTime).getTime() - new Date(rowB.values.launchTime).getTime()
//             },
//             { Header: "Private IP Address", accessor: "privateIpAddress" },
//             { 
//                 Header: "State", 
//                 accessor: "state", 
//                 sortType: (rowA, rowB) => rowA.values.state.props.children.localeCompare(rowB.values.state.props.children)
//             },
//             { Header: "Subnet ID", accessor: "subnetId" },
//             { Header: "VPC ID", accessor: "vpcId" },
//             { Header: "Platform Details", accessor: "platformDetails" },
//             { Header: "Availability Zone", accessor: "availabilityZone" },
//             { Header: "Created At", accessor: "createdAt" },
//         ],
//         []
//     );

//     const data = React.useMemo(() => {
//         return tableData?.map((data, index) => ({
//             serialNo: index + 1 + (pageNumber - 1) * pageSize,
//             instanceId: data?.InstanceId || "--",
//             instanceName: data?.Tags?.find((tag: any) => tag.Key === "Name")?.Value || "--",
//             imageId: data?.ImageId || "--",
//             instanceType: data?.InstanceType || "--",
//             keyName: data?.KeyName || "--",
//             launchTime: data?.LaunchTime ? moment(data?.LaunchTime).format("D MMM YYYY") : "--",
//             privateIpAddress: data?.PrivateIpAddress || "--",
//             state: data?.State?.Name ? (
//                 <Badge bg={data?.State?.Name === "stopped" ? "danger" : "success"}>{data?.State?.Name}</Badge>
//             ) : "--",
//             subnetId: data?.SubnetId || "--",
//             vpcId: data?.VpcId || "--",
//             platformDetails: data?.PlatformDetails || "--",
//             availabilityZone: data?.Placement?.AvailabilityZone || "--",
//             createdAt: data?.createdAt ? moment(data?.createdAt).format("D MMM YYYY, hh:mm a") : "--",
//         }));
//     }, [tableData, pageNumber, pageSize]);

//     const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
//         { columns, data },
//         useSortBy
//     );

//     return (
//         <Table striped hover responsive {...getTableProps()}>
//             <thead>
//                 {headerGroups.map(headerGroup => (
//                     <tr {...headerGroup.getHeaderGroupProps()}>
//                         {headerGroup.headers.map(column => (
//                             <th
//                                 {...column.getHeaderProps(column.getSortByToggleProps())}
//                                 className="sortable-header"
//                                 style={{ fontSize: 14, cursor: "pointer" }}
//                             >
//                                 {column.render("Header")}
//                                 {column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}
//                                 <ResizableColumn column={column} />
//                             </th>
//                         ))}
//                     </tr>
//                 ))}
//             </thead>
//             <tbody {...getTableBodyProps()}>
//                 {rows.length > 0 ? (
//                     rows.map(row => {
//                         prepareRow(row);
//                         return (
//                             <tr {...row.getRowProps()}>
//                                 {row.cells.map(cell => (
//                                     <td {...cell.getCellProps()} style={{ fontSize: 12 }}>
//                                         {cell.render("Cell")}
//                                     </td>
//                                 ))}
//                             </tr>
//                         );
//                     })
//                 ) : (
//                     <tr>
//                         <td colSpan={13} style={{ textAlign: "center", fontSize: 14 }}>
//                             Please select a region to get data
//                         </td>
//                     </tr>
//                 )}
//             </tbody>
//         </Table>
//     );
// }



import * as React from 'react';
import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Button, Box } from '@mui/material';
import { saveAs } from 'file-saver';
import { Spinner } from 'react-bootstrap';
import moment from 'moment';

interface IInstanceTable {
    tableData: any[];
    loading: boolean;
    fetchData: () => void;
}



export default function InstanceTable({ tableData, loading, fetchData }: IInstanceTable) {
    const apiRef = useGridApiRef();
    const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });

    const columns: GridColDef[] = [
        { field: 'serialNo', headerName: 'Sr No.', width: 70 },
        { field: "account", headerName: "Account", width: 150 },
        { field: 'instanceName', headerName: 'Instance Name', width: 200 },
        { field: 'instanceId', headerName: 'Instance ID', width: 200 },
        { field: 'privateIp', headerName: 'Private IP', width: 150 },
        { field: 'instanceType', headerName: 'Instance Type', width: 150 },
        // { field: 'state', headerName: 'State', width: 100 },
        { field: 'state', headerName: 'State', width: 100, renderCell: (params) => (
        <span style={{
            backgroundColor: params.value?.toLowerCase() === 'running' ? '#28a745' : '#dc3545',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold'
        }}>{params.value}</span>
    ) },
        { field: 'imageId', headerName: 'Image ID', width: 200 },
        { field: 'keyName', headerName: 'Key Name', width: 150 },
        { field: 'launchTime', headerName: 'Launch Time', width: 150 },
        { field: 'platformDetails', headerName: 'Platform Details', width: 150 },
        { field: 'subnetId', headerName: 'Subnet ID', width: 200 },
        { field: 'vpcId', headerName: 'VPC ID', width: 200 },
        { field: 'availabilityZone', headerName: 'Availability Zone', width: 150 },
        { field: 'architecture', headerName: 'Architecture', width: 150 },
        { field: 'rootDeviceType', headerName: 'Root Device Type', width: 150 },
        { field: 'rootDeviceName', headerName: 'Root Device Name', width: 150 },
        { field: 'securityGroups', headerName: 'Security Groups', width: 200 },
        { field: 'ebsOptimized', headerName: 'EBS Optimized', width: 150 },
        { field: 'cpuCoreCount', headerName: 'CPU Core Count', width: 150 },
        { field: 'threadsPerCore', headerName: 'Threads Per Core', width: 150 },
        { field: 'volumeId', headerName: 'Volume IDs', width: 200 },
        { field: 'operatingSystem', headerName: 'Operating System', width: 150 },
        { field: 'environment', headerName: 'Environment', width: 150 },
        { field: 'application', headerName: 'Application', width: 150 },
        { field: "technical_L1_Owner", headerName: "Technical L1 Owner", width: 150 },
        { field: 'technical_L2_Owner', headerName: 'Technical L2 Owner', width: 150 },
        { field: 'itlTOwner', headerName: 'ITLT Owner', width: 150 },
        { field: 'businessOwner', headerName: 'Business Owner', width: 150 },
        { field: 'costCenter', headerName: 'Cost Center', width: 150 },
        { field: 'retentionDays', headerName: 'Retention Days', width: 150 },
        { field: 'shutdownSchedule', headerName: 'Shutdown Schedule', width: 150 },
        { field: 'startupSchedule', headerName: 'Startup Schedule', width: 150 },

    ];

    const rows = tableData.map((data, index) => ({
        id: index + 1,
        serialNo: index + 1,
        account: data?.environment || "N/A",
        instanceName: data?.Tags?.find((tag: any) => tag.Key === "Name")?.Value || "N/A",
        instanceId: data?.InstanceId,
        instanceType: data?.InstanceType,
        state: data?.State?.Name,
        imageId: data?.ImageId,
        keyName: data?.KeyName,
        launchTime: moment(data?.LaunchTime).format("DD MMM YYYY hh:mm A"),
        privateIp: data?.PrivateIpAddress,
        platformDetails: data?.PlatformDetails,
        subnetId: data?.SubnetId,
        vpcId: data?.VpcId,
        availabilityZone: data?.Placement?.AvailabilityZone,
        architecture: data?.Architecture,
        rootDeviceType: data?.RootDeviceType,
        rootDeviceName: data?.RootDeviceName,
        securityGroups: data?.SecurityGroups?.map((group: any) => group?.GroupName).join(", "),
        ebsOptimized: data?.EbsOptimized,
        cpuCoreCount: data?.CpuOptions?.CoreCount,
        threadsPerCore: data?.CpuOptions?.ThreadsPerCore,
        volumeId: data?.BlockDeviceMappings?.map((block: any) => block?.Ebs?.VolumeId).join(", "),
        operatingSystem: data?.Tags?.find((tag: any) => tag.Key === "Operating_System")?.Value || "N/A",
        environment: data?.Tags?.find((tag: any) => tag.Key === "Environment")?.Value || "N/A",
        application: data?.Tags?.find((tag: any) => tag.Key === "Application")?.Value || "N/A",
        technical_L1_Owner: data?.Tags?.find((tag: any) => tag.Key === "L1_Technical_Owner")?.Value || "N/A",
        technical_L2_Owner: data?.Tags?.find((tag: any) => tag.Key === "L2_Technical_Owner")?.Value || "N/A",
        itlTOwner: data?.Tags?.find((tag: any) => tag.Key === "ITLT_Owner")?.Value || "N/A",
        businessOwner: data?.Tags?.find((tag: any) => tag.Key === "Business_Owner")?.Value || "N/A",
        costCenter: data?.Tags?.find((tag: any) => tag.Key === "Cost_Center")?.Value || "N/A",
        retentionDays: data?.Tags?.find((tag: any) => tag.Key === "Retention")?.Value || "N/A",
        shutdownSchedule: data?.Tags?.find((tag: any) => tag.Key === "Shut_Down")?.Value || "N/A",
        startupSchedule: data?.Tags?.find((tag: any) => tag.Key === "Start_Up")?.Value || "N/A",
        stateBadge: data?.State?.Name ? `<span style='background-color:${data?.State?.Name.toLowerCase() === 'running' ? '#28a745' : '#dc3545'};color:white;padding:2px 6px;border-radius:4px;font-size:12px;font-weight:bold;'>${data?.State?.Name}</span>` : "N/A",
    }));



    // const instanceCSVData = instanceData.map((data: any) => ({
    //     InstanceName: data?.Tags?.find((tag: any) => tag.Key === "Name")?.Value || "N/A",
    //     InstanceId: data?.InstanceId,
    //     InstanceType: data?.InstanceType,
    //     State: data?.State?.Name,
    //     ImageId: data?.ImageId,
    //     KeyName: data?.KeyName,
    //     LaunchTime: moment(data?.LaunchTime).format("DD MMM YY"),
    //     PrivateIpAddress: data?.PrivateIpAddress,
    //     PlatformDetails: data?.PlatformDetails,
    //     SubnetId: data?.SubnetId,
    //     VpcId: data?.VpcId,
    //     AvailabilityZone: data?.Placement?.AvailabilityZone,

    //     // Newly added fields
    //     Architecture: data?.Architecture,
    //     RootDeviceType: data?.RootDeviceType,
    //     RootDeviceName: data?.RootDeviceName,
    //     SecurityGroups: data?.SecurityGroups?.map((group: any) => group?.GroupName).join(", "),
    //     EbsOptimized: data?.EbsOptimized,
    //     CpuCoreCount: data?.CpuOptions?.CoreCount,
    //     ThreadsPerCore: data?.CpuOptions?.ThreadsPerCore,

    //     // Extracting Volume ID
    //     VolumeId: data?.BlockDeviceMappings?.map((block: any) => block?.Ebs?.VolumeId).join(", "),

    //     // Extracting useful tags
    //     OperatingSystem: data?.Tags?.find((tag: any) => tag.Key === "Operating_System")?.Value || "N/A",
    //     Environment: data?.Tags?.find((tag: any) => tag.Key === "Environment")?.Value || "N/A",
    //     Application: data?.Tags?.find((tag: any) => tag.Key === "Application")?.Value || "N/A",
    //     ITLTOwner: data?.Tags?.find((tag: any) => tag.Key === "ITLT_Owner")?.Value || "N/A",
    //     BusinessOwner: data?.Tags?.find((tag: any) => tag.Key === "Business_Owner")?.Value || "N/A",
    //     CostCenter: data?.Tags?.find((tag: any) => tag.Key === "Cost_Center")?.Value || "N/A",
    //     RetentionDays: data?.Tags?.find((tag: any) => tag.Key === "Retention")?.Value || "N/A",
    //     ShutDownSchedule: data?.Tags?.find((tag: any) => tag.Key === "Shut_Down")?.Value || "N/A",
    //     StartUpSchedule: data?.Tags?.find((tag: any) => tag.Key === "Start_Up")?.Value || "N/A",
    // }));

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
        saveAs(blob, 'instanceData.csv');
    };



    return (
        <div>
            <Box display="flex" justifyContent="flex-end" p={1}>
                <Button variant="contained" onClick={fetchData} className='me-2' disabled={loading}>
                    {loading ? <span><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Loading...</span> : "Fetch"}
                </Button>
                <Button onClick={handleExport} variant="contained" color="primary">Export to CSV</Button>
            </Box>

            <Paper sx={{ width: '100%', position: 'relative', minHeight: rows.length === 0 || loading ? 300 : 'auto' }}>
                <DataGrid
                    apiRef={apiRef}
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    checkboxSelection
                    pagination
                    paginationMode="client"
                    paginationModel={paginationModel}
                    onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
                    pageSizeOptions={[10, 20, 50]}
                    sx={{
                        border: 0, width: '100%',
                        position: 'relative',
                        minHeight: rows.length === 0 || loading ? 300 : 'auto',
                    }}
                />
            </Paper>
        </div>
    );
}
