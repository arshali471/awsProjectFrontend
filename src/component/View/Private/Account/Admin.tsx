import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { AdminService } from "../../../services/admin.service";
import AdminUsersTable from "../../../Table/AdminUser.table";
import AWSKeyTable from "../../../Table/AWSKey.table";

export default function AdminIndex() {

    const [users, setUsers] = useState<any>();
    const [awsKeyData, setAwsKeyData] = useState<any>();

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

    useEffect(() => {
        getAllUsers();
        getAllAWSKey();
    }, [])

    return (
        <>
            <Container>
                <Row>
                    <Col>
                        <h4>Users</h4>
                        <div>
                            <AdminUsersTable tableData={users} reload={getAllUsers} />
                        </div>
                    </Col>
                </Row>
                <hr />
                <Row className="mt-4">
                    <Col>
                        <h4>AWS Key</h4>
                        <div>
                            <AWSKeyTable tableData={awsKeyData} reload={getAllAWSKey} />
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    )
}