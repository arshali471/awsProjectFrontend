import React from "react";
import { useTable, useSortBy } from "react-table";
import { Resizable } from "react-resizable";
import moment from "moment";
import { Table, Badge, Spinner, Card, Row, Col } from "react-bootstrap";
import "react-resizable/css/styles.css"; // Required for column resizing styles

interface IStatusCheckTable {
    tableData: any[];
    pageNumber: number;
    pageSize: number;
    loading?: boolean;
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

const getStatusStyle = (status: string) => {
    if (!status || status === '--') return { backgroundColor: '#6c757d', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' };

    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'active' || lowerStatus === 'running' || lowerStatus === 'ok') {
        return { backgroundColor: ' #28a745', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' };
    } else if (lowerStatus === 'inactive' || lowerStatus === 'stopped' || lowerStatus === 'failed') {
        return { backgroundColor: ' #dc3545', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' };
    } else {
        return { backgroundColor: ' #6c757d', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' };
    }
};

export default function StatusCheckTable({ tableData, pageNumber, pageSize, loading }: IStatusCheckTable) {
    const columns = React.useMemo(
        () => [
            { Header: "Sr.No", accessor: "serialNo", sortType: "number" },
            { Header: "Instance Name", accessor: "instanceName" },
            { Header: "Instance ID", accessor: "instanceId" },
            { Header: "IP", accessor: "ip" },
            { Header: "OS", accessor: "os" },
            { Header: "State", accessor: "state" },
            { Header: "Cloud Watch Status", accessor: "cloudWatchStatus" },
            { Header: "Crowd Strike Status", accessor: "crowdStrikeStatus" },
            { Header: "Qualys Status", accessor: "qualysStatus" },
            { Header: "Zabbix Agent Status", accessor: "zabbixAgentStatus" },
            { Header: "Cloud Watch Version", accessor: "cloudWatchVersion" },
            { Header: "Crowd Strike Version", accessor: "crowdStrikeVersion" },
            { Header: "Qualys Version", accessor: "qualysVersion" },
            { Header: "Zabbix Agent Version", accessor: "zabbixAgentVersion" },
            { Header: "Platform", accessor: "platform" },
        ],
        []
    );

    const data = React.useMemo(() => {
        return tableData?.map((data, index) => ({
            serialNo: index + 1 + (pageNumber - 1) * pageSize,
            instanceName: data?.instanceName || "--",
            instanceId: data?.instanceId || "--",
            ip: data?.ip || "--",
            os: data?.os || "--",
            state:
                <Badge bg={data?.state === "stopped" ? "danger" : "success"}>
                    {data?.state || "--"}
                </Badge>,
            cloudWatchStatus: (
                <span style={getStatusStyle(data?.services?.cloudWatch)}>
                    {data?.services?.cloudWatch || "--"}
                </span>
            ),
            crowdStrikeStatus: (
                <span style={getStatusStyle(data?.services?.crowdStrike)}>
                    {data?.services?.crowdStrike || "--"}
                </span>
            ),
            qualysStatus: (
                <span style={getStatusStyle(data?.services?.qualys)}>
                    {data?.services?.qualys || "--"}
                </span>
            ),
            zabbixAgentStatus: (
                <span style={getStatusStyle(data?.services?.zabbixAgent)}>
                    {data?.services?.zabbixAgent || "--"}
                </span>
            ),
            cloudWatchVersion: data?.versions?.cloudWatch || "--",
            crowdStrikeVersion: data?.versions?.crowdStrike || "--",
            qualysVersion: data?.versions?.qualys || "--",
            zabbixAgentVersion: data?.versions?.zabbixAgent || "--",
            platform: data?.platform || "--",
        }));
    }, [tableData, pageNumber, pageSize]);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
        { columns, data },
        useSortBy
    );

    return (
        <Row className="d-flex justify-content-center align-items-center">
            <Col>
                <Card>
                    <Card.Body>
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
                            {loading ? (
                                    <tr>
                                        <td colSpan={15} style={{ textAlign: "center", fontSize: 14 }}>
                                            <Spinner animation="border" size="sm" /> Loading...
                                        </td>
                                    </tr>
                                ) :
                                rows.length > 0 ? (
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
                                        <td colSpan={15} style={{ textAlign: "center", fontSize: 14 }}>

                                                No data found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}
