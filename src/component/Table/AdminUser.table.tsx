import { Form, Table } from "react-bootstrap"
import { FaRegTrashAlt } from "react-icons/fa";
import { AdminService } from "../services/admin.service";
import toast from "react-hot-toast";
import { useState } from "react";
import ConfirmationModal from "../modal/Confirmation.modal";
import { TbPasswordFingerprint } from "react-icons/tb";
import ChangePaswordModal from "../modal/ChangePassword.modal";

interface IUsersTable {
    tableData: any,
    reload: any
}
export default function AdminUsersTable({ tableData, reload }: IUsersTable) {

    const [showConfirmationModal, setShowConfirmationModal] = useState<any | undefined>(undefined)
    const [selectedUser, setSelectedUser] = useState<any>(null)

    const [showChangePasswordModal, setShowChangePasswordModal] = useState<any>(undefined)


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
                toast.success("User Deleted")
                setShowConfirmationModal(false)
                setSelectedUser(null)
            }
        }).catch(err => {
            toast.error(err.response.data)
        })
    }

    const openDeleteModal = (user: any) => {
        setSelectedUser(user)
        setShowConfirmationModal(user._id)
    }


    return (
        <>
            <Table striped hover responsive>
                <thead>
                    <tr>
                        <th style={{ fontSize: 14 }}>Sr.No</th>
                        <th style={{ fontSize: 14 }}>Username</th>
                        <th style={{ fontSize: 14 }}>Active</th>
                        <th style={{ fontSize: 14 }}>Admin Access</th>
                        <th style={{ fontSize: 14 }}>Access AWS Key</th>
                        <th style={{ fontSize: 14 }}>Access Add Users</th>
                        <th style={{ fontSize: 14 }}>Action</th>
                    </tr>
                </thead>
                <tbody>

                    {tableData && tableData.length > 0 ? tableData.map((data: any, index: number) => {
                        return (
                            <tr style={{ opacity: data.isActive ? 1 : .5 }}>
                                <td style={{ fontSize: 12 }}>{index + 1}</td>
                                <td style={{ fontSize: 12 }}>{data?.isActive === false ? <del>{data?.username}</del> : <span>{data?.username}</span>}</td>
                                <td style={{ fontSize: 12 }}>
                                    <Form.Switch checked={data?.isActive} name="isActive" onChange={(e: any) => handleRoleChange(data._id, { "isActive": e.target.checked })} />
                                </td>
                                <td style={{ fontSize: 12 }}>
                                    <Form.Switch checked={data?.admin} onChange={(e: any) => handleRoleChange(data._id, { "admin": e.target.checked })} />
                                </td>
                                <td style={{ fontSize: 12 }}>
                                    <Form.Switch checked={data?.addAWSKey} onChange={(e: any) => handleRoleChange(data._id, { "addAWSKey": e.target.checked })} />
                                </td>
                                <td style={{ fontSize: 12 }}>
                                    <Form.Switch checked={data?.addUser} onChange={(e: any) => handleRoleChange(data._id, { "addUser": e.target.checked })} />
                                </td>
                                <td style={{ fontSize: 12 }}>
                                    <TbPasswordFingerprint className="text-primary me-3" size={18} onClick={() => setShowChangePasswordModal(data._id)} />
                                    <FaRegTrashAlt className="text-danger" onClick={() => openDeleteModal(data)} />
                                </td>
                            </tr>
                        )
                    }) : "Please select region to get data"}
                </tbody>
            </Table >

            <ConfirmationModal
                show={showConfirmationModal}
                handleClose={() => {
                    setShowConfirmationModal(undefined)
                    setSelectedUser(null)
                }}
                username={selectedUser?.username}
                onClick={handleDeleteUser}
            />

            <ChangePaswordModal 
            show = {showChangePasswordModal}
            handleClose={() => setShowChangePasswordModal(undefined)}
            />
        </>
    )
}