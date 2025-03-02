import moment from "moment";
import { Badge, Table } from "react-bootstrap";

interface IInstanceTable {
    tableData: any
    pageNumber: any
    pageSize: any
}

export default function InstanceTable({ tableData, pageNumber, pageSize }: IInstanceTable) {
    return (
        <Table striped hover responsive>
            <thead>
                <tr>
                    <th style = {{fontSize: 14}}>Sr.No</th>
                    <th style = {{fontSize: 14}}>Instance ID</th>
                    <th style = {{fontSize: 14}}>Instance Name</th>
                    <th style = {{fontSize: 14}}>Image ID</th>
                    <th style = {{fontSize: 14}}>Instance Type</th>
                    <th style = {{fontSize: 14}}>Key Name</th>
                    <th style = {{fontSize: 14}}>Launch Time</th>
                    <th style = {{fontSize: 14}}>Private IP Address</th>
                    <th style = {{fontSize: 14}}>State</th>
                    <th style = {{fontSize: 14}}>Subnet ID</th>
                    <th style = {{fontSize: 14}}>VPC ID</th>
                    <th style = {{fontSize: 14}}>Platform Details</th>
                    <th style = {{fontSize: 14}}>Availability Zone</th>
                </tr>
            </thead>
            <tbody>

                {tableData && tableData.length > 0 ? tableData.map((data: any, index: number) => {
                    const actualIndex = index + 1 + (pageNumber - 1) * pageSize;
                    return (
                        <tr>
                            <td style = {{fontSize: 12}}>{actualIndex}</td>
                            <td style = {{fontSize: 12}}>{data?.InstanceId || "--"}</td>
                            <td style = {{fontSize: 12}}>{data?.Tags?.find((data: any) => data.Key === "Name").Value || "--"}</td>
                            <td style = {{fontSize: 12}}>{data?.ImageId || "--"}</td>
                            <td style = {{fontSize: 12}}>{data?.InstanceType || "--"}</td>
                            <td style = {{fontSize: 12}}>{data?.KeyName || "--"}</td>
                            <td style = {{fontSize: 12}}>{moment(data?.LaunchTime).format("DD MMM YY") || "--"}</td>
                            <td style = {{fontSize: 12}}>{data?.PrivateIpAddress || "--"}</td>
                            <td style = {{fontSize: 12}}>{data?.State?.Name === "stopped" ? <Badge bg="danger">{data?.State?.Name}</Badge> : <Badge bg="success">{data?.State?.Name}</Badge>}</td>
                            <td style = {{fontSize: 12}}>{data?.SubnetId || "--"}</td>
                            <td style = {{fontSize: 12}}>{data?.VpcId || "--"}</td>
                            <td style = {{fontSize: 12}}>{data?.PlatformDetails || "--"}</td>
                            <td style = {{fontSize: 12}}>{data?.Placement?.AvailabilityZone || "--"}</td>

                        </tr>
                    )
                }) : "Please select region to get data"}
            </tbody>
        </Table>
    )
}