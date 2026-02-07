// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Navbar, Nav, Button, Dropdown } from "react-bootstrap";
import ImageData from "../../../../assets/IFF.png"
import { useNavigate } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";
import CustomToggle from "../../../helpers/CustomToggle";
import { IoSettingsSharp } from "react-icons/io5";
import { FiExternalLink } from "react-icons/fi";
import { AuthService } from "../../../services/auth.service";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

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

const defaultApps = [
  { id: 1, url: "/platform/agent-status", name: "IFF Inventory", icon: ImageData, isExternal: false, isIconComponent: false },
  { id: 2, url: "https://iffcloud-conductor.global.iff.com", name: "EKS Inventory", icon: EksInvImage, isExternal: true, isIconComponent: false },
  { id: 3, url: "https://monitoring.global.iff.com", name: "Monitoring", icon: EksImage, isExternal: true, isIconComponent: false },
  { id: 4, url: "/cost", name: "Cost", icon: CostImage, isExternal: false, isIconComponent: false },
  { id: 5, url: "/devops", name: "DevOps", icon: DevopsImage, isExternal: false, isIconComponent: false },
  { id: 6, url: "/kubebot", name: "Kubebot", icon: Kubebot, isExternal: false, isIconComponent: false },
  { id: 7, url: "/ai-chat", name: "CloudTrail AI Chat", icon: SmartToyIcon, isExternal: false, isIconComponent: true },
  { id: 8, url: "/ssh-terminal", name: "SSH Terminal", icon: TerminalIcon, isExternal: false, isIconComponent: true },
  { id: 9, url: "/documentation", name: "Documentation", icon: DescriptionIcon, isExternal: false, isIconComponent: true },
];

export default function IffDashboard() {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Load saved order and favorites from localStorage
  useEffect(() => {
    // Load favorites
    const savedFavorites = localStorage.getItem('dashboardFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Failed to parse favorites:', error);
      }
    }

    // Sort apps alphabetically
    const sortedApps = [...defaultApps].sort((a, b) => a.name.localeCompare(b.name));
    setApps(sortedApps);
  }, []);

  // Toggle favorite
  const toggleFavorite = (e, appId) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(appId)
      ? favorites.filter(id => id !== appId)
      : [...favorites, appId];
    setFavorites(newFavorites);
    localStorage.setItem('dashboardFavorites', JSON.stringify(newFavorites));
  };

  // Get favorite and other apps
  const favoriteApps = apps.filter(app => favorites.includes(app.id));
  const otherApps = apps.filter(app => !favorites.includes(app.id));

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
      <Container style={{ paddingBottom: '4rem', paddingTop: '70px' }}>
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Welcome back, {username.split(" ")[0]}!</h1>
            <p className="dashboard-subtitle">Access your cloud management tools and services</p>
          </div>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px', fontStyle: 'italic' }}>
            ⭐ Tip: Click the star icon to add apps to your favorites
          </p>
        </div>

        {/* Favorite Apps Section */}
        {favoriteApps.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StarIcon style={{ color: '#ffc107', fontSize: '24px' }} />
              My Favorite Apps
            </h2>
            <div className="apps-grid">
              {favoriteApps.map((app) => {
                const AppIcon = app.icon;
                return (
                  <div
                    key={app.id}
                    className="app-card"
                    onClick={() => handleNavigate(app.url, app.isExternal)}
                    style={{ 
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div
                      className="favorite-icon"
                      onClick={(e) => toggleFavorite(e, app.id)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        color: '#ffc107',
                        cursor: 'pointer',
                        zIndex: 10
                      }}
                    >
                      <StarIcon fontSize="small" />
                    </div>
                    {app.isExternal && (
                      <div className="external-badge">
                        <FiExternalLink size={10} />
                      </div>
                    )}
                    <div className="app-icon-container">
                      {app.isIconComponent ? (
                        <AppIcon className="app-icon" style={{ fontSize: 64 }} />
                      ) : (
                        <img src={app.icon} className="app-icon" alt={app.name} />
                      )}
                    </div>
                    <p className="app-name">{app.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Apps Section */}
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '1rem' }}>
            All Apps (A-Z)
          </h2>
          <div className="apps-grid">
            {otherApps.map((app) => {
              const AppIcon = app.icon;
              return (
                <div
                  key={app.id}
                  className="app-card"
                  onClick={() => handleNavigate(app.url, app.isExternal)}
                  style={{ 
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div
                    className="favorite-icon"
                    onClick={(e) => toggleFavorite(e, app.id)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      color: '#ddd',
                      cursor: 'pointer',
                      zIndex: 10,
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ffc107'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#ddd'}
                  >
                    <StarBorderIcon fontSize="small" />
                  </div>
                  {app.isExternal && (
                    <div className="external-badge">
                      <FiExternalLink size={10} />
                    </div>
                  )}
                  <div className="app-icon-container">
                    {app.isIconComponent ? (
                      <AppIcon className="app-icon" style={{ fontSize: 64 }} />
                    ) : (
                      <img src={app.icon} className="app-icon" alt={app.name} />
                    )}
                  </div>
                  <p className="app-name">{app.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </div>
  );
}
