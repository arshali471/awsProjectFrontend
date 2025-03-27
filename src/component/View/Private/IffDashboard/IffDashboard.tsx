import React, { useState } from "react";
import { Container, Row, Col, Card, Navbar, Nav, Button, Dropdown } from "react-bootstrap";
import ImageData from "../../../../assets/IFF.png"
import { useNavigate } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";
import CustomToggle from "../../../helpers/CustomToggle";
import { IoSettingsSharp } from "react-icons/io5";

import DevopsImage from "../../../../assets/devops.png";
import EksImage from "../../../../assets/eks.png";
import EksInvImage from "../../../../assets/eks_invntory.png";

import ReportImage from "../../../../assets/report.png";
import CostImage from "../../../../assets/cost.png";
import TicktImage from "../../../../assets/ticketing.png";
import { HiOutlineLogout } from "react-icons/hi";


const apps = [
  { url: "/platform/ec2", name: "IFF Inventory", icon: ImageData },
  { url: "/platform/eks", name: "EKS Inventory", icon: EksInvImage },
  { url: "https://monitoring.global.iff.com", name: "Monitoring", icon: EksImage },
  { url: "https://app.powerbi.com/groups/me/reports/df62f352-c99d-45a2-bd91-8c81aab7dff9/8bcc73231b0292ec0810?ctid=a2a9bf31-fc44-425c-a6d2-3ae9379573ea&openReportSource=ReportInvitation&experience=power-bi&bookmarkGuid=fa287e5ead9a1908e0a6", name: "Report", icon: ReportImage },
  { url: "/platform/ec2", name: "Ticketing", icon: TicktImage },
  { url: "https://app.finout.io/app/dashboards/50c3fb57-3fac-4b47-9ad5-8a3fc8e16fc4", name: "Cost", icon: CostImage },
  { url: "/devops", name: "Devops", icon: DevopsImage },
];

export default function IffDashboard() {

  const navigate = useNavigate();

  const [hoverIndex, setHoverIndex] = useState(null);

  const handleNavigate = (url: string) => {
    if(url === "/devops"){
      navigate(url)
    }else{
      window.open(url, "_blank");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authKey");
    sessionStorage.removeItem("username");
    navigate("/login")
  }



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
        <Row className="mb-3">
          <Col>
            <h5>Apps dashboard</h5>
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
                onClick={() => handleNavigate(app.url)}
              >
                <Card.Img
                  variant="top"
                  src={app.icon}
                  style={{ width: "50px", height: "50px", margin: "0 auto" }}
                />
                <Card.Body>
                  <Card.Title style={{ fontSize: "0.9rem" }}>{app.name}</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}
