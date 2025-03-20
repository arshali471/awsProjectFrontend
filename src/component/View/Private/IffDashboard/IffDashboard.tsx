import React, { useState } from "react";
import { Container, Row, Col, Card, Navbar, Nav, Button, Dropdown } from "react-bootstrap";
import ImageData from "../../../../assets/IFF.png"
import { useNavigate } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";
import CustomToggle from "../../../helpers/CustomToggle";
import { IoSettingsSharp } from "react-icons/io5";


const apps = [
  { url: "/platform/ec2", name: "IFF Inventory", icon: ImageData },
  { url: "/platform/eks", name: "EKS Inventory", icon: ImageData },
  { url: "/platform/ec2", name: "EKS-monitoring", icon: ImageData },
  { url: "/platform/ec2", name: "Report", icon: ImageData },
  { url: "/platform/ec2", name: "Ticketing", icon: ImageData },
  { url: "/platform/ec2", name: "Cost", icon: ImageData },
  { url: "/platform/ec2", name: "Devops", icon: ImageData },
];

export default function IffDashboard() {

  const navigate = useNavigate();

  const [hoverIndex, setHoverIndex] = useState(null);

  const handleNavigate = (url: string) => {
    window.open(url, "_blank");
  };


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
                  <span className="ms-2">
                    {sessionStorage.getItem("username")}
                  </span>
                </div>
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item className = "d-flex align-items-center gap-2" onClick={() => navigate("/settings")}>
              <IoSettingsSharp />
                <span>Settings</span>
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
