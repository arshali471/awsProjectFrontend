import { useEffect, useState } from "react";
import { Button, Card, Container, Form } from "react-bootstrap";
import { AdminService } from "../../../services/admin.service";
import UsersTable from "../../../Table/Users.table";
import AddUserModal from "../../../modal/addUser.modal";

export default function AddUser() {

    const [usersData, setusersData] = useState<any>();
    const [showAddUser, setShowAddUser] = useState<boolean>(false)


    const getAllUsers = async () => {
        await AdminService.getAllUsers().then((res) => {
            if (res.status === 200) {
                setusersData(res.data)
            }
        })
    }

    useEffect(() => {
        getAllUsers();
    }, [])

    return (
        <>
            <Container>
                <div className="d-flex justify-content-between align-items-center">
                    <h4>Users</h4>
                    <Button size="sm" onClick={() => setShowAddUser(true)}>Add User</Button>
                </div>
                <hr />
                <div>
                    <UsersTable tableData={usersData} />
                </div>
            </Container>
            <AddUserModal
                show={showAddUser}
                handleClose={() => {
                    setShowAddUser(false);
                    getAllUsers();
                }}
            />
        </>
    )
}