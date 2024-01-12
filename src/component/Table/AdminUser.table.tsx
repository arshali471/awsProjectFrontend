import { Form, Table } from "react-bootstrap"
import { FaRegTrashAlt } from "react-icons/fa";
import { AdminService } from "../services/admin.service";
import toast from "react-hot-toast";
interface IUsersTable {
    tableData: any,
    reload: any
}
export default function AdminUsersTable({ tableData, reload }: IUsersTable) {

    const handleRoleChange = async (userId: string, payload: any) => {
        await AdminService.updateUser(userId, payload).then(res => {
            if (res.status === 200) {
                reload();
                toast.success('Role Updated')
            }
        }).catch(e => {
            console.error(e)
            toast.error("Something went wrong while updating roles")
        })
    }

    const handleDeleteUser = async (userId: any) => {
        await AdminService.deleteUser(userId).then((res) => {
            if (res.status === 200) {
                reload();
                toast.success("User Deletd")
            }
        }).catch(err => {
            toast.error(err.response.data)
        })
    }


    return (
        <Table striped hover responsive>
            <thead>
                <tr>
                    <th>Sr.No</th>
                    <th>Username</th>
                    <th>Active</th>
                    <th>Admin Access</th>
                    <th>Access AWS Key</th>
                    <th>Access Add Users</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>

                {tableData && tableData.length > 0 ? tableData.map((data: any, index: number) => {
                    return (
                        <tr style={{ opacity: data.isActive ? 1 : .5 }}>
                            <td>{index + 1}</td>
                            <td>{data?.isActive === false ? <del>{data?.username}</del> : <span>{data?.username}</span>}</td>
                            <td>
                                <Form.Switch checked={data?.isActive} name="isActive" onChange={(e: any) => handleRoleChange(data._id, { "isActive": e.target.checked })} />
                            </td>
                            <td>
                                <Form.Switch checked={data?.admin} onChange={(e: any) => handleRoleChange(data._id, { "admin": e.target.checked })} />
                            </td>
                            <td>
                                <Form.Switch checked={data?.addAWSKey} onChange={(e: any) => handleRoleChange(data._id, { "addAWSKey": e.target.checked })} />
                            </td>
                            <td>
                                <Form.Switch checked={data?.addUser} onChange={(e: any) => handleRoleChange(data._id, { "addUser": e.target.checked })} />
                            </td>
                            <td>
                                <FaRegTrashAlt className="text-danger" onClick={() => handleDeleteUser(data._id)} />
                            </td>
                        </tr>
                    )
                }) : "Please select region to get data"}
            </tbody>
        </Table >
    )
}