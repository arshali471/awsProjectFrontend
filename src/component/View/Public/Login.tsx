import { useState } from "react";
import { AuthService } from "../../services/auth.service";
import Auth from "../../Auth/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import iffLogo from "../../../assets/IFF.png";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";

export default function Login() {
    const navigate = useNavigate();

    const [data, setData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

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
                <form className="login-form" onSubmit={handleLoginSubmission}>
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