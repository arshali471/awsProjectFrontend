import React from "react";
import { useTable, useSortBy } from "react-table";
import { Resizable } from "react-resizable";
import moment from "moment";
import { Table, Badge } from "react-bootstrap";
import "react-resizable/css/styles.css"; // Required for column resizing styles

interface IInstanceTable {
    tableData: any[];
    pageNumber: number;
    pageSize: number;
}

const ResizableColumn = (props: any) => {
    const { resizeHandler, isResizing, column } = props;
    return (
        <div className={`resizable ${isResizing ? "resizing" : ""}`}>
            {props.children}
            <div className="resize-handle" onMouseDown={resizeHandler}></div>
        </div>
    );
};

export default function InstanceTable({ tableData, pageNumber, pageSize }: IInstanceTable) {
    const columns = React.useMemo(
        () => [
            { Header: "Sr.No", accessor: "serialNo", sortType: "number" },
            { Header: "Instance ID", accessor: "instanceId" },
            { Header: "Instance Name", accessor: "instanceName" },
            { Header: "Image ID", accessor: "imageId" },
            { Header: "Instance Type", accessor: "instanceType" },
            { Header: "Key Name", accessor: "keyName" },
            { 
                Header: "Launch Time", 
                accessor: "launchTime", 
                sortType: (rowA, rowB) => new Date(rowA.values.launchTime).getTime() - new Date(rowB.values.launchTime).getTime()
            },
            { Header: "Private IP Address", accessor: "privateIpAddress" },
            { 
                Header: "State", 
                accessor: "state", 
                sortType: (rowA, rowB) => rowA.values.state.props.children.localeCompare(rowB.values.state.props.children)
            },
            { Header: "Subnet ID", accessor: "subnetId" },
            { Header: "VPC ID", accessor: "vpcId" },
            { Header: "Platform Details", accessor: "platformDetails" },
            { Header: "Availability Zone", accessor: "availabilityZone" },
            { Header: "Created At", accessor: "createdAt" },
        ],
        []
    );

    const data = React.useMemo(() => {
        return tableData?.map((data, index) => ({
            serialNo: index + 1 + (pageNumber - 1) * pageSize,
            instanceId: data?.InstanceId || "--",
            instanceName: data?.Tags?.find((tag: any) => tag.Key === "Name")?.Value || "--",
            imageId: data?.ImageId || "--",
            instanceType: data?.InstanceType || "--",
            keyName: data?.KeyName || "--",
            launchTime: data?.LaunchTime ? moment(data?.LaunchTime).format("D MMM YYYY") : "--",
            privateIpAddress: data?.PrivateIpAddress || "--",
            state: data?.State?.Name ? (
                <Badge bg={data?.State?.Name === "stopped" ? "danger" : "success"}>{data?.State?.Name}</Badge>
            ) : "--",
            subnetId: data?.SubnetId || "--",
            vpcId: data?.VpcId || "--",
            platformDetails: data?.PlatformDetails || "--",
            availabilityZone: data?.Placement?.AvailabilityZone || "--",
            createdAt: data?.createdAt ? moment(data?.createdAt).format("D MMM YYYY, hh:mm a") : "--",
        }));
    }, [tableData, pageNumber, pageSize]);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
        { columns, data },
        useSortBy
    );

    return (
        <Table striped hover responsive {...getTableProps()}>
            <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th
                                {...column.getHeaderProps(column.getSortByToggleProps())}
                                className="sortable-header"
                                style={{ fontSize: 14, cursor: "pointer" }}
                            >
                                {column.render("Header")}
                                {column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}
                                <ResizableColumn column={column} />
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.length > 0 ? (
                    rows.map(row => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => (
                                    <td {...cell.getCellProps()} style={{ fontSize: 12 }}>
                                        {cell.render("Cell")}
                                    </td>
                                ))}
                            </tr>
                        );
                    })
                ) : (
                    <tr>
                        <td colSpan={13} style={{ textAlign: "center", fontSize: 14 }}>
                            Please select a region to get data
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    );
}