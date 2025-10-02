import { useEffect, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { AdminService } from "../../../services/admin.service";
import AdminUsersTable from "../../../Table/AdminUser.table";
import AWSKeyTable from "../../../Table/AWSKey.table";
import { TbError404Off } from "react-icons/tb";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
export default function AdminIndex() {

    const navigate = useNavigate();

    const [users, setUsers] = useState<any>();
    const [awsKeyData, setAwsKeyData] = useState<any>();

    const [isAllowed, setIsAllowed] = useState<boolean>(false)

    const getAllUsers = async () => {
        await AdminService.getAllUsers().then((res) => {
            setUsers(res.data)
        })
    }

    const getAllAWSKey = async () => {
        await AdminService.getAllAwsKey().then((res) => {
            setAwsKeyData(res.data)
        })
    }


    const getUserData = async () => {
        try {
            const res = await AdminService.getUserData();
            if (res.status === 200) {

                if (res.data.admin) {
                    setIsAllowed(true)
                }
                // if (res.data.addUser) {
                //   manageUsers.push("addUser");
                // }
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
        getAllAWSKey();
        getUserData();
    }, [])

    return (
        <>
            <Container className="p-4 mt-5">
                {isAllowed ?
                    <div>
                        <Row>
                            <Col>
                                <h4>
                                    <IoArrowBackCircleSharp className = "me-2 mb-1" onClick={() =>navigate(-1)} />
                                    Users
                                </h4>
                                <Card>
                                    <Card.Body>
                                        <AdminUsersTable tableData={users} reload={getAllUsers} />
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        <hr />
                        <Row className="mt-4">
                            <Col>
                                <h4>AWS Key</h4>
                                <Card>
                                    <Card.Body>
                                        <AWSKeyTable tableData={awsKeyData} reload={getAllAWSKey} />
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </div> :
                    <div className="d-flex justify-content-center align-items-center">
                        <div className="d-flex flex-column justify-content-center align-items-center">
                            <TbError404Off size={100} className="text-secondary" />
                            <p className="text-muted">You're not allowed, Please contact to the admin.</p>
                        </div>
                    </div>
                }
            </Container>
        </>
    )
}