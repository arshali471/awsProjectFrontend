import moment from "moment";
import { Table } from "react-bootstrap";

interface IS3Table {
    tableData: any
}

export default function S3Table({ tableData }: IS3Table) {
    return (
        <Table striped hover responsive>
            <thead>
                <tr>
                    <th style={{fontSize: 14}}>Sr.No</th>
                    <th style={{fontSize: 14}}>Bucket Name</th>
                    <th style={{fontSize: 14}}>Creation Date</th>
                    <th style={{fontSize: 14}}>Location</th>
                    <th style={{fontSize: 14}}>Size (GB)</th>
                </tr>
            </thead>
            <tbody>

                {tableData && tableData.length > 0 ? tableData.map((data: any, index: number) => {
                    return (
                        <tr>
                            <td style = {{fontSize: 12}}>{index + 1}</td>
                            <td style = {{fontSize: 12}}>{data?.bucketName || "--"}</td>
                            <td style = {{fontSize: 12}}>{moment(data?.creationDate).format("DD MMM YY") || "--"}</td>
                            <td style = {{fontSize: 12}}>{data?.location || "--"}</td>
                            <td style = {{fontSize: 12}}>{data?.size || "--"}</td>
                        </tr>
                    )
                }) : "Please select region to get data"}
            </tbody>
        </Table>
    )
}