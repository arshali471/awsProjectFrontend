import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import { IoSettingsSharp } from 'react-icons/io5'
import { FaShieldAlt } from 'react-icons/fa'

import AdminImage from "../../../../assets/admin.png"
import UserImage from "../../../../assets/UsersAdd.png"
import PasswordImage from "../../../../assets/password.png"
import AwsImage from "../../../../assets/awsKey.png"
import EksTokenImage from "../../../../assets/ekstoken.png"

import "./Settings.css"

export default function SettingIndex() {
    const navigate = useNavigate();

    const apps = [
        { url: "/settings/admin", name: "Admin", icon: AdminImage, isAdmin: true, description: "Manage administrators" },
        { url: "/settings/addUser", name: "Add Users", icon: UserImage, isAdmin: true, description: "Create new users" },
        { url: "/settings/addAWSKey", name: "AWS Keys", icon: AwsImage, isAdmin: true, description: "Manage AWS credentials" },
        { url: "/settings/addEKSToken", name: "EKS Token", icon: EksTokenImage, isAdmin: true, description: "Configure EKS access" },
        { url: "/settings/ssh-key", name: "SSH Keys", icon: EksTokenImage, isAdmin: true, description: "Manage SSH keys" },
        { url: "/settings/change-password", name: "Password", icon: PasswordImage, isAdmin: false, description: "Change your password" },
    ];

    return (
        <div className="settings-wrapper">
            <Container>
                <div className="settings-header">
                    <h1 className="settings-title">
                        <div className="settings-title-icon">
                            <IoSettingsSharp />
                        </div>
                        Settings & Configuration
                    </h1>
                    <p className="settings-subtitle">Manage your account, security, and system preferences</p>
                </div>

                {/* Settings Grid */}
                <div className="settings-grid">
                    {apps.map((app, index) => (
                        <div
                            key={index}
                            className="settings-card"
                            onClick={() => navigate(app.url)}
                        >
                            {app.isAdmin && (
                                <div className="admin-badge">
                                    <FaShieldAlt size={8} /> ADMIN
                                </div>
                            )}
                            <div className="settings-icon-container">
                                <img src={app.icon} className="settings-icon" alt={app.name} />
                            </div>
                            <p className="settings-name">{app.name}</p>
                            <p className="settings-description">{app.description}</p>
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    )
}
