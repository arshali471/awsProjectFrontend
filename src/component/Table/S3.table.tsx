import React from "react";
import { useTable, useSortBy } from "react-table";
import { Resizable } from "react-resizable";
import moment from "moment";
import { Table } from "react-bootstrap";
import "react-resizable/css/styles.css"; // Required for column resizing styles

interface IS3Table {
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

export default function S3Table({ tableData, pageNumber, pageSize }: IS3Table) {
    const columns = React.useMemo(
        () => [
            { Header: "Sr.No", accessor: "serialNo", sortType: "number" },
            { Header: "Bucket Name", accessor: "bucketName" },
            { 
                Header: "Creation Date", 
                accessor: "creationDate", 
                sortType: (rowA, rowB) => new Date(rowA.values.creationDate).getTime() - new Date(rowB.values.creationDate).getTime()
            },
            { Header: "Location", accessor: "location" },
            { Header: "Size (GB)", accessor: "size", sortType: "number" }
        ],
        []
    );

    const data = React.useMemo(() => {
        return tableData.map((data, index) => ({
            serialNo: index + 1 + (pageNumber - 1) * pageSize,
            bucketName: data?.bucketName || "--",
            creationDate: data?.creationDate ? moment(data?.creationDate).format("D MMM YYYY") : "--",
            location: data?.location || "--",
            size: data?.size || "--"
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
                        <td colSpan={5} style={{ textAlign: "center", fontSize: 14 }}>
                            Please select a region to get data
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    );
}
