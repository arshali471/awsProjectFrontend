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
                    <th style = {{fontSize: 14}}>Sr.No</th>
                    <th style = {{fontSize: 14}}>Username</th>
                    <th style = {{fontSize: 14}}>Active</th>
                    <th style = {{fontSize: 14}}>Access AWS Key</th>
                    <th style = {{fontSize: 14}}>Access Add Users</th>
                </tr>
            </thead>
            <tbody>

                {tableData && tableData.length > 0 ? tableData.map((data: any, index: number) => {
                    return (
                        <tr>
                            <td style = {{fontSize: 12}}>{index + 1}</td>
                            <td style = {{fontSize: 12}}>{data?.username || "--"}</td>
                            <td style = {{fontSize: 12}}>{data?.isActive ? <FaUserCheck className="text-success" /> : <FaUserXmark className="text-danger" />}</td>
                            <td style = {{fontSize: 12}}>{data?.addAWSKey ? <FaCheckCircle className="text-success" /> : <FaCircleXmark className="text-danger" />}</td>
                            <td style = {{fontSize: 12}}>{data?.addUser ? <FaCheckCircle className="text-success" /> : <FaCircleXmark className="text-danger" />}</td>
                        </tr>
                    )
                }) : "Please select region to get data"}
            </tbody>
        </Table>
    )
}