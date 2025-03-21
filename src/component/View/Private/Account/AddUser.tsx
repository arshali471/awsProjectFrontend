import { useEffect, useState } from "react";
import { Button, Card, Container } from "react-bootstrap";
import { AdminService } from "../../../services/admin.service";
import UsersTable from "../../../Table/Users.table";
import AddUserModal from "../../../modal/addUser.modal";
import { TbError404Off } from "react-icons/tb";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function AddUser() {

    const navigate = useNavigate();

    const [usersData, setusersData] = useState<any>();
    const [showAddUser, setShowAddUser] = useState<boolean>(false)
    const [isAllowed, setIsAllowed] = useState<boolean>(false)


    const getAllUsers = async () => {
        await AdminService.getAllUsers().then((res) => {
            if (res.status === 200) {
                setusersData(res.data)
            }
        })
    }

    const getUserData = async () => {
        try {
            const res = await AdminService.getUserData();
            if (res.status === 200) {

                if (res.data.addUser) {
                    setIsAllowed(true);
                }
                // if (res.data.addAWSKey) {
                //   manageUsers.push("addAWSKey");
                // }
            } else {
                console.error(`Failed to fetch user data. Status: ${res.status}`);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    useEffect(() => {
        getAllUsers();
        getUserData();
    }, [])

    return (
        <>
            <Container className="p-4 mt-5">
                {isAllowed ?
                    <div>
                        <div className="d-flex justify-content-between align-items-center">
                            <h4>
                                <IoArrowBackCircleSharp className="me-2 mb-1" onClick={() => navigate(-1)} />
                                Users
                            </h4>
                            <Button size="sm" onClick={() => setShowAddUser(true)}>Add User</Button>
                        </div>
                        <hr />
                        <div>
                            <Card>
                                <Card.Body>
                                    <UsersTable tableData={usersData} />
                                </Card.Body>
                            </Card>
                        </div>
                    </div> :
                    <div className="d-flex justify-content-center align-items-center">
                        <div className="d-flex flex-column justify-content-center align-items-center">
                            <TbError404Off size={100} className="text-secondary" />
                            <p className="text-muted">You're not allowed, Please contact to the admin.</p>
                        </div>
                    </div>
                }
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