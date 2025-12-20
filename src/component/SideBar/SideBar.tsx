import { useState, useEffect } from 'react';
import { Image, Nav } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import './sidebar.css';
import { useLocation } from 'react-router-dom';
import IRouter from '../Interface/IRouter';
import { iffRoutes } from '../routes/iff.routes';
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

    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    }, [isCollapsed]);



    const isActive = (path: string) => {
        const segments = location.pathname.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1];
        return lastSegment === path;
    };


    const handleLogout = () => {
        sessionStorage.removeItem("authKey");
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("email");
        sessionStorage.removeItem("admin");
        sessionStorage.removeItem("role");
        navigate("/login")
    }


    useEffect(() => {
        // Update main content class based on sidebar state
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.className = isCollapsed
                ? 'main-content sidebar-collapsed'
                : 'main-content sidebar-expanded';
        }
    }, [isCollapsed]);

    return (
        <>
            <div
                className={`sidebar d-flex flex-column text-white vh-100 p-3 sidebar-bg ${isCollapsed ? 'collapsed' : 'expanded'}`}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 1100
                }}
            >
                {/* Toggle Button - Chevron Design */}
                <div
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={{
                        position: 'absolute',
                        bottom: '80px',
                        left: '0',
                        right: '0',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        color: '#ffffff',
                        width: isCollapsed ? '50px' : '200px',
                        height: '40px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        zIndex: 1200,
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                >
                    {!isCollapsed && <span style={{ fontSize: '13px', fontWeight: 500 }}>Collapse</span>}
                    <div style={{
                        display: 'flex',
                        transition: 'transform 0.3s ease',
                        transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>

                <div>
                    <div
                        className={`mb-2 d-flex align-items-center ${isCollapsed ? 'justify-content-center' : 'ms-3'}`}
                        onClick={() => navigate("/dashboard")}
                        style={{
                            cursor: "pointer",
                            overflow: 'visible',
                            whiteSpace: 'nowrap',
                            gap: isCollapsed ? '0' : '12px'
                        }}
                    >
                        <Image src={LogoImage} width={isCollapsed ? 40 : 50} style={{ flexShrink: 0 }} />
                        {!isCollapsed && <span style={{ fontSize: '1rem', fontWeight: 600 }}>Cloud Inventory</span>}
                    </div>

                    <Nav className="flex-column mt-3" style={{ gap: '8px' }}>
                        {iffRoutes.map((route: any, index: number) => {
                            if (!route.navbarShow) return null;

                            return (
                                <Nav.Item key={route.path} className="d-flex align-items-center ms-1" title={isCollapsed ? route.name : ''} style={{ marginBottom: '4px' }}>
                                    <Nav.Link
                                        as="div"
                                        className={`d-flex align-items-center gap-3 ${isActive(route.path.split('/').pop()) ? 'active' : 'inactive'}`}
                                        onClick={() => {
                                            if (route.externalLink) {
                                                window.open(route.externalLink, '_blank', 'noopener,noreferrer');
                                            } else {
                                                navigate(route.path);
                                            }
                                        }}
                                        style={{
                                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                                            overflow: 'hidden',
                                            padding: '10px 12px'
                                        }}
                                    >
                                        {route.icon && <route.icon className="sidebar-icon" />}
                                        {!isCollapsed && <span style={{ fontSize: 14 }}>{route.name}</span>}
                                    </Nav.Link>
                                </Nav.Item>
                            );
                        })}
                    </Nav>
                </div>

                <div className="mt-auto">
                    <hr />
                    <div
                        className="d-flex align-items-center gap-3 h6 text-danger"
                        onClick={handleLogout}
                        style={{
                            cursor: "pointer",
                            justifyContent: isCollapsed ? 'center' : 'flex-start'
                        }}
                        title={isCollapsed ? 'Log out' : ''}
                    >
                        {!isCollapsed && <span>Log out</span>}
                        <HiOutlineLogout />
                    </div>
                </div>
            </div>

        </>
    )
}