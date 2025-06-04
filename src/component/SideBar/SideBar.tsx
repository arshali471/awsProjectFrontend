import { useState } from 'react';
import { Accordion, Image, Nav, } from "react-bootstrap";
import { Link, useNavigate } from 'react-router-dom';
import './sidebar.css';
import { useLocation } from 'react-router-dom';
import IRouter from '../Interface/IRouter';
import { iffRoutes } from '../routes/iff.routes';
import { FaHome, FaSignOutAlt } from 'react-icons/fa';
import LogoImage from "../../assets/IFF.png"
import { HiOutlineLogout } from "react-icons/hi";
interface ISideBar {
    menuData?: IRouter[],
    panelName?: string,
    baseUrl?: string
}

export default function SideBar({ menuData }: ISideBar) {
    let navigate = useNavigate();
    const location = useLocation();

    const [close] = useState(true);



    const isActive = (path: string) => {
        const segments = location.pathname.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1];
        return lastSegment === path;
    };


    const handleLogout = () => {
        sessionStorage.removeItem("authKey");
        sessionStorage.removeItem("username");
        navigate("/login")
    }


    return (
        <>
            <div className="d-flex flex-column text-white vh-100 p-3 sidebar-bg" style={{ width: '250px' }}>
                <div>
                    <div className="mb-2 ms-3 d-flex align-items-center gap-3" onClick={ () => navigate("/dashboard") } style={{ cursor: "pointer" }}>
                        <Image src={LogoImage} width={50} />
                        Cloud Inventory
                    </div>

                    <Nav className="flex-column mt-3">
                        <Accordion className="custom-accordion">
                            {iffRoutes.map((route: any, index: number) => {
                                if (!route.navbarShow) return null;

                                return route.children ? (
                                    <Accordion.Item eventKey={index.toString()} key={route.path} style={{ background: "transparent" }}>
                                        <Accordion.Header className={`d-flex align-items-center me-2 ${isActive(route.path) ? 'active' : 'inactive'}`}>
                                            {route.icon && <route.icon className="sidebar-icon me-3" />}
                                            <span style={{ fontSize: 14 }}>{route.name}</span>
                                        </Accordion.Header>
                                        <Accordion.Body className="p-0">
                                            {route.children.map((subRoute: any) => (
                                                <Nav.Item key={subRoute.path}>
                                                    <Nav.Link
                                                        as={'div'}
                                                        className={`d-flex align-items-center gap-3 ps-4 ${isActive(subRoute.path) ? 'active' : 'inactive'}`}
                                                        onClick={() => navigate(`/${route.path}/${subRoute.path}`)}
                                                    >
                                                        {subRoute.icon && <subRoute.icon className="sidebar-icon me-3" />}
                                                        <span style={{ fontSize: 12 }}>{subRoute.name}</span>
                                                    </Nav.Link>
                                                </Nav.Item>
                                            ))}
                                        </Accordion.Body>
                                    </Accordion.Item>
                                ) : (
                                    <Nav.Item key={route.path} className="d-flex align-items-center ms-1">
                                        <Nav.Link
                                            as="div"
                                            className={`d-flex align-items-center gap-3 ${isActive(route.path) ? 'active' : 'inactive'}`}
                                            onClick={() => navigate(route.path)}
                                        >
                                            {route.icon && <route.icon className="sidebar-icon" />}
                                            <span style={{ fontSize: 14 }}>{route.name}</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                );
                            })}
                        </Accordion>
                    </Nav>
                </div>

                <div className="mt-auto">
                    <hr />
                    <div className="d-flex align-items-center gap-3 h6 text-danger" onClick={handleLogout} style={{ cursor: "pointer" }}>
                        <span>Log out</span>
                        <HiOutlineLogout />
                    </div>
                </div>
            </div>

        </>
    )
}