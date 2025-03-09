import React from "react";
import { useTable, useSortBy } from "react-table";
import { Resizable } from "react-resizable";
import moment from "moment";
import { Badge, Table } from "react-bootstrap";
import "react-resizable/css/styles.css"; // Required for column resizing styles

interface IVolumesTable {
    tableData: any[];
    pageNumber: number;
    pageSize: number;
}

// Resizable Column Component
const ResizableColumn = (props: any) => {
    const { resizeHandler, isResizing, column } = props;
    return (
        <div className={`resizable ${isResizing ? "resizing" : ""}`}>
            {props.children}
            <div className="resize-handle" onMouseDown={resizeHandler}></div>
        </div>
    );
};

export default function VolumesTable({ tableData, pageNumber, pageSize }: IVolumesTable) {
    const columns = React.useMemo(
        () => [
            { Header: "Sr.No", accessor: "serialNo" },
            { Header: "Volume ID", accessor: "volumeId" },
            { Header: "State", accessor: "state" },
            { Header: "Size (GB)", accessor: "size" },
            { Header: "Volume Type", accessor: "volumeType" },
            { Header: "IOPS", accessor: "iops" },
            { Header: "Throughput", accessor: "throughput" },
            { Header: "Snapshot ID", accessor: "snapshotId" },
            { Header: "Availability Zone", accessor: "availabilityZone" },
            { Header: "Encrypted", accessor: "encrypted" },
            { Header: "Created At", accessor: "createdAt" },
            { Header: "Attached Instances", accessor: "attachedInstances" },
            { Header: "Attached Status", accessor: "attachedVolumeStatus" }
        ],
        []
    );

    const data = React.useMemo(() => {
        return tableData.map((data, index) => ({
            serialNo: index + 1 + (pageNumber - 1) * pageSize,
            volumeId: data.volumeId || "--",
            state: data.state || "--",
            size: data.size || "--",
            volumeType: data.volumeType || "--",
            iops: data.iops || "--",
            throughput: data.throughput || "--",
            snapshotId: data.snapshotId || "--",
            availabilityZone: data.availabilityZone || "--",
            encrypted: data.encrypted || "--",
            createdAt: data.createdAt ? moment(data.createdAt).format("DD MMM YY") : "--",
            attachedInstances: data.attachedInstances?.length > 0 ? data.attachedInstances.join(", ") : "--",
            attachedVolumeStatus: data.attachedInstances?.length > 0 ? (
                <Badge bg={ "success" }>Attached</Badge>
            ) : <Badge bg={"danger"}>UnAttached</Badge>
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
                        <td colSpan={14} style={{ textAlign: "center", fontSize: 14 }}>
                            Please select a region to get data
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    );
}
