import React from "react";
import { useTable, useSortBy } from "react-table";
import { Resizable } from "react-resizable";
import moment from "moment";
import { Table } from "react-bootstrap";
import "react-resizable/css/styles.css"; // Required for column resizing styles

interface IRDSTable {
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

export default function RDSTable({ tableData, pageNumber, pageSize }: IRDSTable) {
    const columns = React.useMemo(
        () => [
            { Header: "Sr.No", accessor: "serialNo", sortType: "number" },
            { Header: "Instance ID", accessor: "instanceId" },
            { Header: "Status", accessor: "status", sortType: "string" },
            { Header: "Engine", accessor: "engine" },
            { Header: "Engine Version", accessor: "engineVersion" },
            { Header: "Storage", accessor: "storage", sortType: "number" },
            { Header: "Instance Class", accessor: "instanceClass" },
            { Header: "VPC ID", accessor: "vpcId" },
            { Header: "Subnet Group", accessor: "subnetGroup" },
            { Header: "Availability Zone", accessor: "availabilityZone" },
            { 
                Header: "Created At", 
                accessor: "creationDate", 
                sortType: (rowA, rowB) => new Date(rowA.values.creationDate).getTime() - new Date(rowB.values.creationDate).getTime()
            },
            { Header: "Endpoint", accessor: "endpoint" },
            { Header: "Security Groups", accessor: "securityGroups" }
        ],
        []
    );

    const data = React.useMemo(() => {
        return tableData.map((data, index) => ({
            serialNo: index + 1 + (pageNumber - 1) * pageSize,
            instanceId: data?.instanceId || "--",
            status: data?.status || "--",
            engine: data?.engine || "--",
            engineVersion: data?.engineVersion || "--",
            storage: data?.storage || "--",
            instanceClass: data?.instanceClass || "--",
            vpcId: data?.vpcId || "--",
            subnetGroup: data?.subnetGroup || "--",
            availabilityZone: data?.availabilityZone || "--",
            creationDate: data?.createdAt ? moment(data?.createdAt, "YYYY-MM-DD").format("D MMM YYYY") : "--",
            endpoint: data?.endpoint || "--",
            securityGroups: data?.securityGroups || "--"
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
