import React, { useState } from 'react'
import SideBar from '../../../SideBar/SideBar'
import mainRoutes from '../../../routes/routes'
import { Outlet, useNavigate } from 'react-router-dom'
import TopBar from '../../../TopBar/TopBar'
import { RiAdminFill } from 'react-icons/ri'
import { FaUsersGear } from 'react-icons/fa6'
import { IoKeySharp } from 'react-icons/io5'
import { Card, Col, Container, Row } from 'react-bootstrap'

import AdminImage from "../../../../assets/admin.png"
import UserImage from "../../../../assets/UsersAdd.png"
import PasswordImage from "../../../../assets/password.png"
import AwsImage from "../../../../assets/awsKey.png"

export default function SettingIndex() {
    const navigate = useNavigate();

    const [hoverIndex, setHoverIndex] = useState(null);



    const apps = [
        { url: "/settings/admin", name: "Admin", icon: AdminImage },
        { url: "/settings/addUser", name: "Add Users", icon: UserImage },
        { url: "/settings/addAWSKey", name: "Add AWS Key", icon: AwsImage },
        { url: "/settings/change-password", name: "Change Password", icon: PasswordImage },
    ];

    return (
        <>
            <Container className="p-4 mt-5">

                <Row className="mb-3">
                    <Col>
                        <h5>Settings</h5>
                    </Col>
                </Row>

                <Row xs={2} sm={3} md={4} lg={5} xl={6} className="g-3 mt-4">
                    {apps.map((app, index) => (
                        <Col key={index}>
                            <Card
                                className={`text-center p-3 transition`}
                                onMouseEnter={() => setHoverIndex(index)}
                                onMouseLeave={() => setHoverIndex(null)}
                                style={{
                                    cursor: "pointer",
                                    boxShadow: hoverIndex === index ? "0px 4px 12px rgba(0, 0, 0, 0.2)" : "none",
                                    transform: hoverIndex === index ? "scale(1.05)" : "scale(1)",
                                    transition: "all 0.3s ease-in-out",
                                }}
                                onClick={() => navigate(app.url)}
                            >
                                <Card.Img
                                    variant="top"
                                    src={app.icon}
                                    style={{ width: "50px", height: "50px", margin: "0 auto" }}
                                />
                                {/* <app.icon 
                            style={{ width: "50px", height: "50px", margin: "0 auto" }}
                            /> */}
                                <Card.Body>
                                    <Card.Title style={{ fontSize: "0.9rem" }}>{app.name}</Card.Title>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container >
        </>
    )
}
