import { Form, Table } from "react-bootstrap"
import { FaRegTrashAlt } from "react-icons/fa";
import { AdminService } from "../services/admin.service";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import ConfirmationModal from "../modal/Confirmation.modal";
import PermissionConfirmationModal from "../modal/PermissionConfirmation.modal";
import { TbPasswordFingerprint } from "react-icons/tb";
import ChangePaswordModal from "../modal/ChangePassword.modal";

interface IUsersTable {
    tableData: any,
    reload: any
}
export default function AdminUsersTable({ tableData, reload }: IUsersTable) {

    const [showConfirmationModal, setShowConfirmationModal] = useState<any | undefined>(undefined)
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [localTableData, setLocalTableData] = useState<any>(tableData)

    const [showChangePasswordModal, setShowChangePasswordModal] = useState<any>(undefined)

    // Permission change confirmation
    const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false)
    const [pendingPermissionChange, setPendingPermissionChange] = useState<any>(null)

    // Get current logged-in username
    const currentUsername = sessionStorage.getItem("username");

    // Update local data when tableData prop changes
    useEffect(() => {
        setLocalTableData(tableData)
    }, [tableData])

    const handlePermissionToggle = (userId: string, user: any, permissionType: string, newValue: boolean) => {
        // Store the pending change
        setPendingPermissionChange({
            userId,
            user,
            permissionType,
            payload: { [permissionType]: newValue },
            currentValue: !newValue
        });
        setShowPermissionModal(true);
    };

    const confirmPermissionChange = async () => {
        if (!pendingPermissionChange) return;

        const { userId, payload } = pendingPermissionChange;

        // Optimistically update the local state first
        setLocalTableData((prevData: any) =>
            prevData.map((user: any) =>
                user._id === userId ? { ...user, ...payload } : user
            )
        );

        await AdminService.updateUser(userId, payload).then(res => {
            if (res.status === 200) {
                toast.success('Permission Updated Successfully')
                // Optionally reload in the background to ensure sync
                // reload();
            }
        }).catch(e => {
            console.error(e)
            toast.error("Something went wrong while updating permission")
            // Revert on error
            setLocalTableData(tableData)
        });

        // Close modal and reset
        setShowPermissionModal(false);
        setPendingPermissionChange(null);
    };

    const cancelPermissionChange = () => {
        setShowPermissionModal(false);
        setPendingPermissionChange(null);
    };

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
                        <th style={{ fontSize: 14 }}>Upload Documentation</th>
                        <th style={{ fontSize: 14 }}>Action</th>
                    </tr>
                </thead>
                <tbody>

                    {localTableData && localTableData.length > 0 ? localTableData.map((data: any, index: number) => {
                        // Check if this is the current logged-in user
                        const isCurrentUser = data?.username === currentUsername;

                        return (
                            <tr key={data._id} style={{ opacity: data.isActive ? 1 : .5 }}>
                                <td style={{ fontSize: 12 }}>{index + 1}</td>
                                <td style={{ fontSize: 12 }}>{data?.isActive === false ? <del>{data?.username}</del> : <span>{data?.username}</span>}</td>
                                <td style={{ fontSize: 12 }}>
                                    <Form.Switch
                                        id={`active-${data._id}`}
                                        checked={data?.isActive}
                                        name="isActive"
                                        onChange={(e: any) => handlePermissionToggle(data._id, data, "isActive", e.target.checked)}
                                        disabled={isCurrentUser}
                                        title={isCurrentUser ? "You cannot modify your own active status" : ""}
                                    />
                                </td>
                                <td style={{ fontSize: 12 }}>
                                    <Form.Switch
                                        id={`admin-${data._id}`}
                                        checked={data?.admin}
                                        onChange={(e: any) => handlePermissionToggle(data._id, data, "admin", e.target.checked)}
                                        disabled={isCurrentUser}
                                        title={isCurrentUser ? "You cannot modify your own admin access" : ""}
                                    />
                                </td>
                                <td style={{ fontSize: 12 }}>
                                    <Form.Switch
                                        id={`awskey-${data._id}`}
                                        checked={data?.addAWSKey}
                                        onChange={(e: any) => handlePermissionToggle(data._id, data, "addAWSKey", e.target.checked)}
                                        disabled={isCurrentUser}
                                        title={isCurrentUser ? "You cannot modify your own AWS key access" : ""}
                                    />
                                </td>
                                <td style={{ fontSize: 12 }}>
                                    <Form.Switch
                                        id={`adduser-${data._id}`}
                                        checked={data?.addUser}
                                        onChange={(e: any) => handlePermissionToggle(data._id, data, "addUser", e.target.checked)}
                                        disabled={isCurrentUser}
                                        title={isCurrentUser ? "You cannot modify your own add user access" : ""}
                                    />
                                </td>
                                <td style={{ fontSize: 12 }}>
                                    <Form.Switch
                                        id={`adddocument-${data._id}`}
                                        checked={data?.addDocument}
                                        onChange={(e: any) => handlePermissionToggle(data._id, data, "addDocument", e.target.checked)}
                                        disabled={isCurrentUser}
                                        title={isCurrentUser ? "You cannot modify your own document upload access" : ""}
                                    />
                                </td>
                                <td style={{ fontSize: 12 }}>
                                    <TbPasswordFingerprint className="text-primary me-3" size={18} onClick={() => setShowChangePasswordModal(data._id)} />
                                    <FaRegTrashAlt
                                        className="text-danger"
                                        onClick={() => !isCurrentUser && openDeleteModal(data)}
                                        style={{
                                            opacity: isCurrentUser ? 0.3 : 1,
                                            cursor: isCurrentUser ? 'not-allowed' : 'pointer'
                                        }}
                                        title={isCurrentUser ? "You cannot delete your own account" : ""}
                                    />
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

            <PermissionConfirmationModal
                show={showPermissionModal}
                handleClose={cancelPermissionChange}
                onConfirm={confirmPermissionChange}
                permissionType={pendingPermissionChange?.permissionType || ''}
                username={pendingPermissionChange?.user?.username || ''}
                currentValue={pendingPermissionChange?.currentValue || false}
            />

            <ChangePaswordModal
            show = {showChangePasswordModal}
            handleClose={() => setShowChangePasswordModal(undefined)}
            />
        </>
    )
}