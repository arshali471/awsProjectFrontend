import moment from "moment";
import { Badge, Container, Table } from "react-bootstrap";

interface IS3Table {
    tableData: any
}

export default function S3Table({ tableData }: IS3Table) {
    return (
        <Table striped hover responsive>
            <thead>
                <tr>
                    <th>Sr.No</th>
                    <th>Bucket Name</th>
                    <th>Creation Date</th>
                    <th>Location</th>
                    <th>Size</th>
                </tr>
            </thead>
            <tbody>

                {tableData && tableData.length > 0 ? tableData.map((data: any, index: number) => {
                    return (
                        <tr>
                            <td>{index + 1}</td>
                            <td>{data?.bucketName || "--"}</td>
                            <td>{moment(data?.creationDate).format("DD MMM YY") || "--"}</td>
                            <td>{data?.location || "--"}</td>
                            <td>{data?.size || "--"}</td>
                        </tr>
                    )
                }) : "Please select region to get data"}
            </tbody>
        </Table>
    )
}