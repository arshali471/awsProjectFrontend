import { Outlet, useNavigate } from 'react-router-dom';
import { Container, Navbar, Dropdown } from "react-bootstrap";
import CustomToggle from "../helpers/CustomToggle";
import { IoSettingsSharp } from "react-icons/io5";
import { HiOutlineLogout } from "react-icons/hi";
import ImageData from "../../assets/IFF.png";
import "../View/Private/IffDashboard/IffDashboard.css";

export default function DevOpsLayout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem("authKey");
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("role");
        navigate("/login");
    };

    const username = sessionStorage.getItem("username") || "User";

    return (
        <div className="dashboard-wrapper">
            {/* Modern Navbar - Same as IffDashboard */}
            <Navbar className="dashboard-navbar">
                <Container>
                    <div className="navbar-brand-section">
                        <img src={ImageData} className="navbar-logo" alt="IFF Logo" />
                        <p className="navbar-title">My Apps</p>
                    </div>

                    <Dropdown align="end">
                        <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
                            <div className="user-avatar">
                                {username.substring(0, 2).toUpperCase()}
                            </div>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="user-avatar" style={{ width: 28, height: 28, fontSize: "12px" }}>
                                        {username.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="fw-semibold">{username}</span>
                                </div>
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                                className="d-flex align-items-center gap-2"
                                onClick={() => navigate("/settings")}
                            >
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
            </Navbar>

            {/* Content */}
            <Outlet />
        </div>
    );
}
