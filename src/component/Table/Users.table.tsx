import { Table } from "react-bootstrap"
import { FaUserCheck, FaCheckCircle } from "react-icons/fa";
import { FaUserXmark, FaCircleXmark } from "react-icons/fa6";

interface IUsersTable {
    tableData: any
}
export default function UsersTable({ tableData }: IUsersTable) {
    return (
        <Table striped hover responsive>
            <thead>
                <tr>
                    <th>Sr.No</th>
                    <th>Username</th>
                    <th>Active</th>
                    <th>Access AWS Key</th>
                    <th>Access Add Users</th>
                </tr>
            </thead>
            <tbody>

                {tableData && tableData.length > 0 ? tableData.map((data: any, index: number) => {
                    return (
                        <tr>
                            <td>{index + 1}</td>
                            <td>{data?.username || "--"}</td>
                            <td>{data?.isActive ? <FaUserCheck className="text-success" /> : <FaUserXmark className="text-danger" />}</td>
                            <td>{data?.addAWSKey ? <FaCheckCircle className="text-success" /> : <FaCircleXmark className="text-danger" />}</td>
                            <td>{data?.addUser ? <FaCheckCircle className="text-success" /> : <FaCircleXmark className="text-danger" />}</td>
                        </tr>
                    )
                }) : "Please select region to get data"}
            </tbody>
        </Table>
    )
}