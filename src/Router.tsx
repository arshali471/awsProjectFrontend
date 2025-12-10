import { Navigate, Route, Routes } from "react-router-dom";
import Auth from "./component/Auth/auth";
import PrivateRoutes from "./component/View/Private.index";
import DevOpsLayout from "./component/View/DevOps.layout";
import mainRoutes from "./component/routes/routes";
import IRouter from "./component/Interface/IRouter";
import Login from "./component/View/Public/Login";
import { LoadingContext, SelectedRegionContext } from "./component/context/context";
import { useState } from "react";
import IIFFRouter, { iffRoutes } from "./component/routes/iff.routes";
import IffDashboard from "./component/View/Private/IffDashboard/IffDashboard";
import Settings from "./component/View/Private/Settings/Settings";
import AdminIndex from "./component/View/Private/Account/Admin";
import AddUser from "./component/View/Private/Account/AddUser";
import AddAWSKey from "./component/View/Private/Account/AddAWSKey";
import SettingIndex from "./component/View/Private/Settings/Setting.index";
import ChangePassword from "./component/View/Private/ChangePassword/ChangePassword";
import Devops from "./component/View/Private/Devops/Devops";
import DevopsIndex from "./component/View/Private/Devops/Devops.index";
import AddEKSToken from "./component/View/Private/Account/AddEKSToken";
import Kubernetes from "./component/View/Private/Kubernetes/Kubernetes";
import KubernetesIndex from "./component/View/Private/Kubernetes/Kubernetes.index";
import SshKey from "./component/View/Private/Account/SshKey";
import TerminalPage from "./component/View/Private/terminal/terminalPage";
import RdpPage from "./component/View/Private/rdp/RdpPage";
import AIChat from "./component/View/Private/AIChat/AIChat";
import KubeBot from "./component/View/Private/KubeBot/KubeBot";
import SSHTerminal from "./component/View/Private/SSHTerminal/SSHTerminal";
import CompleteCostDashboard from "./component/View/Private/CostDashboard/CompleteCostDashboard";
import Documentation from "./component/View/Private/Documentation/Documentation";

function PrivateRouter({ children }: { children: React.ReactNode }) {
    const auth = Auth.checkAuth();
    if (!auth) {
        // Store the current location to redirect back after login
        const currentPath = window.location.pathname + window.location.search;
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        return <Navigate to="/login" />;
    }
    return <>{children}</>;
}


export default function Router() {
    const [selectedRegion, setSelectedRegion] = useState<any>();
    const [loading, setLoading] = useState<boolean>();

    return (
        <LoadingContext.Provider value={{ loading, setLoading }}>
            <SelectedRegionContext.Provider value={{ selectedRegion, setSelectedRegion }}>

                <Routes>
                    {/* Public route */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/terminal" element={<TerminalPage />} />
                    <Route path="/rdp" element={<RdpPage />} />

                    {/* Protected dashboard route */}
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRouter>
                                <IffDashboard />
                            </PrivateRouter>
                        }
                    />

                    <Route
                        path="/devops"
                        element={
                            <PrivateRouter>
                                <DevOpsLayout />
                            </PrivateRouter>
                        }

                    >
                        <Route index element={<DevopsIndex />} />
                    </Route>

                    {/* AI Chat route */}
                    <Route
                        path="/ai-chat"
                        element={
                            <PrivateRouter>
                                <AIChat />
                            </PrivateRouter>
                        }
                    />

                    {/* KubeBot route */}
                    <Route
                        path="/kubebot"
                        element={
                            <PrivateRouter>
                                <KubeBot />
                            </PrivateRouter>
                        }
                    />

                    {/* SSH Terminal route */}
                    <Route
                        path="/ssh-terminal"
                        element={
                            <PrivateRouter>
                                <SSHTerminal />
                            </PrivateRouter>
                        }
                    />

                    {/* Cost Dashboard route */}
                    <Route
                        path="/cost"
                        element={
                            <PrivateRouter>
                                <CompleteCostDashboard />
                            </PrivateRouter>
                        }
                    />

                    {/* Documentation routes */}
                    <Route
                        path="/documentation"
                        element={
                            <PrivateRouter>
                                <Documentation />
                            </PrivateRouter>
                        }
                    />
                    <Route
                        path="/documentation/:id"
                        element={
                            <PrivateRouter>
                                <Documentation />
                            </PrivateRouter>
                        }
                    />

                    {/* Protected settings routes */}
                    <Route
                        path="/settings"
                        element={
                            <PrivateRouter>
                                <Settings />
                            </PrivateRouter>
                        }
                    >
                        <Route index element={<SettingIndex />} />
                        <Route path="admin" element={<AdminIndex />} />
                        <Route path="addUser" element={<AddUser />} />
                        <Route path="addAWSKey" element={<AddAWSKey />} />
                        <Route path="addEKSToken" element={<AddEKSToken />} />
                        <Route path="ssh-key" element={<SshKey />} />
                        <Route path="change-password" element={<ChangePassword />} />
                    </Route>

                    {/* Other protected app routes */}
                    <Route
                        path="/"
                        element={
                            <PrivateRouter>
                                <PrivateRoutes />
                            </PrivateRouter>
                        }
                    >
                        {/* Optional: redirect root to dashboard */}
                        <Route index element={<Navigate to="/dashboard" />} />

                        {iffRoutes.map((data: IIFFRouter) => (
                            data.children ? (
                                <Route key={data.path} path={data.path}>
                                    {data.children.map((subData: IIFFRouter) => (
                                        <Route
                                            key={subData.path}
                                            path={subData.path}
                                            element={subData.element}
                                        />
                                    ))}
                                </Route>
                            ) : (
                                <Route
                                    key={data.path}
                                    path={data.path}
                                    element={data.element}
                                />
                            )
                        ))}
                    </Route>

                    {/* Catch-all route */}
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </SelectedRegionContext.Provider>
        </LoadingContext.Provider>
    );
}
