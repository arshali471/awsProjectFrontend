import React from "react";
import { useTable, useSortBy } from "react-table";
import { Resizable } from "react-resizable";
import { Button, Table } from "react-bootstrap";
import "react-resizable/css/styles.css"; // Required for column resizing styles
import { MdOutlineContentCopy } from "react-icons/md";
import toast from "react-hot-toast";

interface IEksTable {
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

export default function EksTable({ tableData, pageNumber, pageSize }: IEksTable) {
    const columns = React.useMemo(
        () => [
            { Header: "Sr.No", accessor: "serialNo", sortType: "number" },
            { Header: "Cluster Name", accessor: "name" },
            { Header: "Version", accessor: "version" },
            { Header: "Node", accessor: "nodes", sortType: "number" },
            { Header: "Provider", accessor: "provider" },
            {
                Header: "Status",
                accessor: "status",
                sortType: (rowA, rowB) => rowA.values.status.localeCompare(rowB.values.status)
            },
            { Header: "Token", accessor: "token" },
            { Header: "Connect", accessor: "connect" },

        ],
        []
    );

    const copyToClipboard = (text: any) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                toast.success("Copied to clipboard!");
            })
            .catch((err) => {
                toast.error("Failed to copy:", err);
            });
    };


    const handleNavigate = (url: string) => {
        window.open(url, "_blank");
      };


    const data = React.useMemo(() => {
        return tableData.map((data, index) => ({
            serialNo: index + 1 + (pageNumber - 1) * pageSize,
            name: data?.name || "--",
            version: data?.version || "--",
            nodes: data?.nodes?.length || "--",
            provider: data?.provider || "--",
            status: (
                <span className={data?.status === "ACTIVE" ? "text-success" : "text-danger"}>
                    {data?.status || "--"}
                </span>
            ),
            token: data?.token ? <MdOutlineContentCopy className="text-success" style={{ cursor: "pointer" }} onClick={() => copyToClipboard(data.token)} /> : "--",
            connect: data?.connectUrl ? <span style = {{cursor: "pointer"}} className ="text-decoration-underline text-primary" onClick={() => handleNavigate(data?.connectUrl)}>Connect</span>: "--",
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
                        <td colSpan={8} style={{ textAlign: "center", fontSize: 14 }}>
                            No data found
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    );
}
