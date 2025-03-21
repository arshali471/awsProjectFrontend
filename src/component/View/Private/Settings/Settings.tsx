import React from "react";
import { Container, Navbar, Dropdown } from "react-bootstrap";
import CustomToggle from "../../../helpers/CustomToggle";
import { RxAvatar } from "react-icons/rx";
import { IoSettingsSharp } from "react-icons/io5";
import ImageData from "../../../../assets/IFF.png";
import { useNavigate, Outlet } from "react-router-dom";
import { HiOutlineLogout } from "react-icons/hi";

export default function Settings() {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("authKey");
    sessionStorage.removeItem("username");
    navigate("/login")
}


  return (
    <>
      {/* Navbar Section */}
      <Navbar className="bg-body-tertiary">
        <Container>
          <div className="d-flex align-items-center">
            <Navbar.Brand
              href="/dashboard"
              className="p-2"
              style={{ borderRight: "1px solid black" }}
            >
              <img src={ImageData} width="30" height="30" alt="IFF Logo" />
            </Navbar.Brand>
            <p className="m-0 text-medium text-secondary" style={{ fontSize: 16 }}>
              My Apps
            </p>
          </div>

          {/* User Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
              <RxAvatar size={30} />
            </Dropdown.Toggle>

            <Dropdown.Menu className="dropdown-bottom-left">
              <Dropdown.Item>
                <div className="d-flex align-items-center">
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: "#007bff",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                    }}
                  >
                    {sessionStorage.getItem("username")?.charAt(0).toUpperCase()}
                  </div>
                  <span className="ms-2">{sessionStorage.getItem("username")}</span>
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

      {/* Render Child Components */}
      <div className="mt-3">
        <Outlet />
      </div>
    </>
  );
}

