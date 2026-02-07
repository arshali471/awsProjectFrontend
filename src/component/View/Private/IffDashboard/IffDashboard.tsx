// @ts-nocheck
import React, { useState } from "react";
import { Container, Row, Col, Card, Navbar, Nav, Button, Dropdown } from "react-bootstrap";
import ImageData from "../../../../assets/IFF.png"
import { useNavigate } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";
import CustomToggle from "../../../helpers/CustomToggle";
import { IoSettingsSharp } from "react-icons/io5";
import { FiExternalLink } from "react-icons/fi";
import { AuthService } from "../../../services/auth.service";

import DevopsImage from "../../../../assets/devops.png";
import EksImage from "../../../../assets/eks.png";
import EksInvImage from "../../../../assets/eks_invntory.png";

import ReportImage from "../../../../assets/report.png";
import CostImage from "../../../../assets/cost.png";
import TicktImage from "../../../../assets/ticketing.png";
import Kubebot from "../../../../assets/kubebot.png";
import { HiOutlineLogout } from "react-icons/hi";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import TerminalIcon from '@mui/icons-material/Terminal';
import DescriptionIcon from '@mui/icons-material/Description';

import "./IffDashboard.css";

const apps = [
  { url: "/platform/agent-status", name: "IFF Inventory", icon: ImageData, isExternal: false, isIconComponent: false },
  { url: "https://iffcloud-conductor.global.iff.com", name: "EKS Inventory", icon: EksInvImage, isExternal: true, isIconComponent: false },
  { url: "https://monitoring.global.iff.com", name: "Monitoring", icon: EksImage, isExternal: true, isIconComponent: false },
  { url: "/cost", name: "Cost", icon: CostImage, isExternal: false, isIconComponent: false },
  { url: "/devops", name: "DevOps", icon: DevopsImage, isExternal: false, isIconComponent: false },
  { url: "/kubebot", name: "Kubebot", icon: Kubebot, isExternal: false, isIconComponent: false },
  { url: "/ai-chat", name: "CloudTrail AI Chat", icon: SmartToyIcon, isExternal: false, isIconComponent: true },
  { url: "/ssh-terminal", name: "SSH Terminal", icon: TerminalIcon, isExternal: false, isIconComponent: true },
  { url: "/documentation", name: "Documentation", icon: DescriptionIcon, isExternal: false, isIconComponent: true },
];

export default function IffDashboard() {
  const navigate = useNavigate();

  const handleNavigate = (url: string, isExternal: boolean) => {
    if (isExternal || url.startsWith("http")) {
      window.open(url, "_blank");
    } else {
      navigate(url);
    }
  };

  const handleLogout = async () => {
    try {
      // Call backend to track logout time
      console.log('[Frontend] Calling logout API...');
      const response = await AuthService.logout();
      console.log('[Frontend] Logout API response:', response);
    } catch (error) {
      console.error("[Frontend] Logout error:", error);
    } finally {
      // Clear session storage regardless of API call success
      sessionStorage.removeItem("authKey");
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("email");
      sessionStorage.removeItem("admin");
      sessionStorage.removeItem("addUser");
      sessionStorage.removeItem("addAWSKey");
      sessionStorage.removeItem("addDocument");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("ssoProvider");
      navigate("/login");
    }
  };

  const username = sessionStorage.getItem("username") || "User";

  return (
    <div className="dashboard-wrapper">
      {/* Modern Navbar */}
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

      {/* Dashboard Content */}
      <Container>
        <div className="dashboard-header">
          <h1 className="dashboard-title">Welcome back, {username.split(" ")[0]}!</h1>
          <p className="dashboard-subtitle">Access your cloud management tools and services</p>
        </div>

        {/* Apps Grid */}
        <div className="apps-grid">
          {apps.map((app) => {
            const IconComponent = app.isIconComponent ? app.icon : null;
            return (
              <div
                key={app.url}
                className="app-card"
                onClick={() => handleNavigate(app.url, app.isExternal)}
                style={{ cursor: 'pointer', position: 'relative' }}
              >
                {app.isExternal && (
                  <div className="external-badge">
                    <FiExternalLink size={10} />
                  </div>
                )}
                <div className="app-icon-container">
                  {app.isIconComponent && IconComponent ? (
                    <IconComponent className="app-icon" style={{ fontSize: 64 }} />
                  ) : (
                    <img src={app.icon} className="app-icon" alt={app.name} />
                  )}
                </div>
                <p className="app-name">{app.name}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
