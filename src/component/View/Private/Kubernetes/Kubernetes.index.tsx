import React, { useEffect, useState } from 'react'
import { Col, Container, Dropdown, Navbar, Row } from 'react-bootstrap'
import ImageData from "../../../../assets/IFF.png"
import CustomToggle from '../../../helpers/CustomToggle'
import { IoSettingsSharp } from 'react-icons/io5'
import { HiOutlineLogout } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import Kubernetes from './Kubernetes'
import { FaArrowLeft } from 'react-icons/fa'
import Select from 'react-select'
import { AdminService } from '../../../services/admin.service'


export default function KubernetesIndex() {

    const navigate = useNavigate();
    const [region, setRegion] = useState<any>();
    const [selectedRegion, setSelectedRegion] = useState<any>();


    const getAllAwsKeys = async () => {
        await AdminService.getAllAwsKey().then((res) => {
            if (res.status === 200) {
                setRegion(res.data.map((data: any) => {
                    return {
                        label: `${data.enviroment} (${data.region})`,
                        value: data._id
                    }
                }))
            }
        }).catch((err) => {
        })
    }

    const handleLogout = () => {
        sessionStorage.removeItem("authKey");
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("email");
        sessionStorage.removeItem("admin");
        sessionStorage.removeItem("role");
        navigate("/login")
    }


    useEffect(() => {
        getAllAwsKeys();
    }, [])



    return (
        <>
            <Navbar className="bg-body-tertiary">
                <Container>
                    <div className="d-flex align-items-center">
                        <Navbar.Brand
                            className="p-2"
                            style={{
                                borderRight: "1px solid black",
                            }}
                        >
                            <img
                                src={ImageData}
                                width="30"
                                height="30"
                                alt="IFF Logo"
                            />
                        </Navbar.Brand>
                        <p className="m-0 text-medium text-secondary" style={{ fontSize: 16 }}>My Apps</p>
                    </div>

                    <Dropdown align="end">
                        <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
                            <div
                                style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: "50%",
                                    backgroundColor: "#007bff",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                }}
                            >
                                {sessionStorage.getItem("username")?.substring(0, 2).toUpperCase()}
                            </div>
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="dropdown-bottom-left">
                            <Dropdown.Item>
                                <div className="d-flex align-items-center">
                                    <div
                                        style={{
                                            width: 25,
                                            height: 25,
                                            borderRadius: "50%",
                                            backgroundColor: "#007bff",
                                            color: "white",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "12px",
                                        }}
                                    >
                                        {sessionStorage.getItem("username")?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="ms-2">
                                        {sessionStorage.getItem("username")}
                                    </span>
                                </div>
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item className="d-flex align-items-center gap-2" onClick={() => navigate("/settings")}>
                                <IoSettingsSharp />
                                <span>Settings</span>
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                                className="d-flex align-items-center gap-2 text-danger"
                                onClick={handleLogout}
                            >
                                <HiOutlineLogout />
                                <span>Logout</span>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Container>
            </Navbar >
            <Container className="p-4 mt-5">
                <Row>
                    <Col>
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-2">
                                <FaArrowLeft onClick={() => navigate("/dashboard")} className="cursor-pointer mb-2" />
                                <h5>EKS Inventory</h5>
                            </div>
                            <div style={{ width: 300 }}>
                                <Select
                                    options={region}
                                    placeholder="Select Region"
                                    onChange={(e: any) => setSelectedRegion(e)}
                                    isClearable={true}
                                />
                            </div>
                        </div>
                        <Kubernetes selectedRegion={selectedRegion} />
                    </Col>
                </Row>
            </Container>
        </>
    )
}
