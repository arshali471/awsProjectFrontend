import moment from "moment";
import { Table } from "react-bootstrap";

interface IS3Table {
    tableData: any
}

export default function EksTable({ tableData }: IS3Table) {
    return (
        <Table striped hover responsive>
            <thead>
                <tr>
                    <th style={{fontSize: 14}}>Sr.No</th>
                    <th style={{fontSize: 14}}>Cluster Name</th>
                    <th style={{fontSize: 14}}>Version</th>
                    <th style={{fontSize: 14}}>Node</th>
                    <th style={{fontSize: 14}}>Provider</th>
                    <th style={{fontSize: 14}}>Status</th>
                </tr>
            </thead>
            <tbody>

                {tableData && tableData.length > 0 ? tableData.map((data: any, index: number) => {
                    return (
                        <tr>
                            <td style = {{fontSize: 12}}>{index + 1}</td>
                            <td style = {{fontSize: 12}}>{data?.name || "--"}</td>
                            <td style = {{fontSize: 12}}>{data?.version || "--"}</td>
                            <td style = {{fontSize: 12}}>{data?.nodes?.length || "--"}</td>
                            <td style = {{fontSize: 12}}>{data?.provider || "--"}</td>
                            <td style = {{fontSize: 12}} className = {data?.status === "ACTIVE" ? "text-success": "text-danger"}>{data?.status || "--"}</td>
                        </tr>
                    )
                }) : "No data found"}
            </tbody>
        </Table>
    )
}