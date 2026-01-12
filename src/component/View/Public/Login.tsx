import { useState, useEffect } from "react";
import { AuthService } from "../../services/auth.service";
import { AzureService } from "../../services/azure.service";
import Auth from "../../Auth/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import iffLogo from "../../../assets/IFF.png";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaMicrosoft, FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./Login.css";

export default function Login() {
    const navigate = useNavigate();

    const [data, setData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [azureEnabled, setAzureEnabled] = useState(false);
    const [ssoLoading, setSsoLoading] = useState(false);
    const [showLocalLogin, setShowLocalLogin] = useState(false);

    const handleChange = (e: any) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleLoginSubmission = async (e: any) => {
        e.preventDefault();

        if (!data.username || !data.password) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);

        try {
            const res = await AuthService.login(data);
            if (res.status === 200) {
                Auth.authenticate();
                sessionStorage.setItem("authKey", res.data.token);
                sessionStorage.setItem("username", res.data.username);
                sessionStorage.setItem("email", res.data.email);
                sessionStorage.setItem("admin", res.data.admin ? 'true' : 'false');
                sessionStorage.setItem("addUser", res.data.addUser ? 'true' : 'false');
                sessionStorage.setItem("addAWSKey", res.data.addAWSKey ? 'true' : 'false');
                sessionStorage.setItem("addDocument", res.data.addDocument ? 'true' : 'false');
                sessionStorage.setItem("ssoProvider", "local"); // Mark as local login

                // Set role for admin users (required by some components like AddUser)
                if (res.data.admin) {
                    sessionStorage.setItem("role", "admin");
                }

                if (rememberMe) {
                    localStorage.setItem("rememberedUsername", data.username);
                }

                toast.success("Login Successful! Redirecting...");

                // Check if there's a redirect URL stored
                const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
                sessionStorage.removeItem('redirectAfterLogin');

                setTimeout(() => {
                    navigate(redirectUrl || '/dashboard');
                }, 500);
            }
        } catch (err: any) {
            console.log(err);
            toast.error(err.response?.data || err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: any) => {
        if (e.key === "Enter") {
            handleLoginSubmission(e);
        }
    };

    // Check if Azure AD is configured
    useEffect(() => {
        const checkAzureConfig = async () => {
            try {
                const res = await AzureService.getAzureConfig();
                setAzureEnabled(res.data?.enabled || false);
            } catch (error) {
                console.error('Failed to check Azure config:', error);
            }
        };
        checkAzureConfig();
    }, []);

    const handleMicrosoftLogin = async () => {
        setSsoLoading(true);
        try {
            const result = await AzureService.completeSSOFlow();

            if (result.success && result.token) {
                Auth.authenticate();
                sessionStorage.setItem("authKey", result.token);
                sessionStorage.setItem("username", result.username || '');
                sessionStorage.setItem("email", result.email || '');
                sessionStorage.setItem("admin", result.admin ? 'true' : 'false');
                sessionStorage.setItem("addUser", result.addUser ? 'true' : 'false');
                sessionStorage.setItem("addAWSKey", result.addAWSKey ? 'true' : 'false');
                sessionStorage.setItem("addDocument", result.addDocument ? 'true' : 'false');
                sessionStorage.setItem("ssoProvider", "azure"); // Mark as SSO login

                if (result.admin) {
                    sessionStorage.setItem("role", "admin");
                }

                toast.success("Microsoft SSO successful! Redirecting...");

                const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
                sessionStorage.removeItem('redirectAfterLogin');

                setTimeout(() => {
                    navigate(redirectUrl || '/dashboard');
                }, 500);
            } else {
                toast.error(result.error || "Microsoft login failed");
            }
        } catch (err: any) {
            toast.error(err.message || "Microsoft login failed");
        } finally {
            setSsoLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Animated Particles */}
            <div className="particles">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="particle" />
                ))}
            </div>

            {/* Login Card */}
            <div className="login-card">
                {/* Header Section */}
                <div className="login-header">
                    <div className="login-logo">
                        <img src={iffLogo} width="50" alt="IFF Logo" />
                    </div>
                    <h1 className="login-title">Welcome Back</h1>
                    <p className="login-subtitle">Sign in to access Cloud Inventory</p>
                </div>

                {/* Login Form */}
                <div className="login-form">
                    {/* Primary: Microsoft SSO Login */}
                    {azureEnabled && (
                        <div className="primary-login-section">
                            <p className="sso-description">
                                Sign in with your organization account
                            </p>
                            <button
                                type="button"
                                className="microsoft-button-primary"
                                onClick={handleMicrosoftLogin}
                                disabled={ssoLoading || loading}
                            >
                                <FaMicrosoft className="microsoft-icon-large" />
                                <div className="microsoft-button-content">
                                    <span className="microsoft-button-title">
                                        {ssoLoading ? "Signing in..." : "Continue with Microsoft"}
                                    </span>
                                    <span className="microsoft-button-subtitle">
                                        Recommended for organization users
                                    </span>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Divider with "or" */}
                    {azureEnabled && (
                        <div className="login-divider-modern">
                            <div className="divider-line"></div>
                            <span className="divider-text">or</span>
                            <div className="divider-line"></div>
                        </div>
                    )}

                    {/* Secondary: Local Login (Collapsible) */}
                    <div className="local-login-section">
                        <button
                            type="button"
                            className="local-login-toggle"
                            onClick={() => setShowLocalLogin(!showLocalLogin)}
                        >
                            <span className="local-login-toggle-text">
                                Sign in with local account
                            </span>
                            {showLocalLogin ? <FaChevronUp /> : <FaChevronDown />}
                        </button>

                        {/* Collapsible Local Login Form */}
                        <div className={`local-login-form ${showLocalLogin ? 'expanded' : 'collapsed'}`}>
                            <form onSubmit={handleLoginSubmission}>
                                {/* Username Field */}
                                <div className="form-group-modern">
                                    <label className="form-label-modern" htmlFor="username">
                                        Username
                                    </label>
                                    <div className="form-input-wrapper">
                                        <FaUser className="form-input-icon" />
                                        <input
                                            id="username"
                                            type="text"
                                            name="username"
                                            className="form-control-modern"
                                            placeholder="Enter your username"
                                            onChange={handleChange}
                                            onKeyPress={handleKeyPress}
                                            disabled={loading}
                                            autoComplete="username"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="form-group-modern">
                                    <label className="form-label-modern" htmlFor="password">
                                        Password
                                    </label>
                                    <div className="form-input-wrapper">
                                        <FaLock className="form-input-icon" />
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            className="form-control-modern"
                                            placeholder="Enter your password"
                                            onChange={handleChange}
                                            onKeyPress={handleKeyPress}
                                            disabled={loading}
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember Me & Forgot Password */}
                                <div className="remember-forgot">
                                    <div className="remember-me">
                                        <input
                                            type="checkbox"
                                            id="rememberMe"
                                            className="custom-checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <label htmlFor="rememberMe" className="remember-label">
                                            Remember me
                                        </label>
                                    </div>
                                    <a href="#" className="forgot-password">
                                        Forgot password?
                                    </a>
                                </div>

                                {/* Login Button */}
                                <button
                                    type="submit"
                                    className="login-button"
                                    disabled={loading}
                                >
                                    {loading && <span className="button-spinner" />}
                                    {loading ? "Signing in..." : "Sign In"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="login-footer">
                    Don't have an account?{" "}
                    <a href="#" className="signup-link">
                        Contact Administrator
                    </a>
                </div>
            </div>
        </div>
    );
}