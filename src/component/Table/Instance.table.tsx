import moment from "moment";
import { Badge, Table } from "react-bootstrap";

interface IInstanceTable {
    tableData: any
}

export default function InstanceTable({ tableData }: IInstanceTable) {
    return (
        <Table striped hover responsive>
            <thead>
                <tr>
                    <th>Sr.No</th>
                    <th>Instance ID</th>
                    <th>Instance Name</th>
                    <th>Image ID</th>
                    <th>Instance Type</th>
                    <th>Key Name</th>
                    <th>Launch Time</th>
                    <th>Private IP Address</th>
                    <th>State</th>
                    <th>Subnet ID</th>
                    <th>VPC ID</th>
                    <th>Platform Details</th>
                    <th>Availability Zone</th>
                </tr>
            </thead>
            <tbody>

                {tableData && tableData.length > 0 ? tableData.map((data: any, index: number) => {
                    return (
                        <tr>
                            <td>{index + 1}</td>
                            <td>{data?.InstanceId || "--"}</td>
                            <td>{data?.Tags?.find((data: any) => data.Key === "Name").Value || "--"}</td>
                            <td>{data?.ImageId || "--"}</td>
                            <td>{data?.InstanceType || "--"}</td>
                            <td>{data?.KeyName || "--"}</td>
                            <td>{moment(data?.LaunchTime).format("DD MMM YY") || "--"}</td>
                            <td>{data?.PrivateIpAddress || "--"}</td>
                            <td>{data?.State?.Name === "stopped" ? <Badge bg="danger">{data?.State?.Name}</Badge> : <Badge bg="success">{data?.State?.Name}</Badge>}</td>
                            <td>{data?.SubnetId || "--"}</td>
                            <td>{data?.VpcId || "--"}</td>
                            <td>{data?.PlatformDetails || "--"}</td>
                            <td>{data?.Placement?.AvailabilityZone || "--"}</td>

                        </tr>
                    )
                }) : "Please select region to get data"}
            </tbody>
        </Table>
    )
}