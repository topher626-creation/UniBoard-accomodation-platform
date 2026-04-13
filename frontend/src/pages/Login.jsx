import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, AlertTriangle } from "lucide-react";
import { BrandLogo } from "../components/BrandLogo";
import { useAuthStore } from "../stores/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err?.message || "Sign-in failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ub-auth-page">
      <div className="ub-auth-container">
        {/* Logo */}
        <div className="text-center mb-4">
          <Link to="/" className="d-inline-flex justify-content-center text-decoration-none">
            <BrandLogo height={52} />
          </Link>
          <h1 className="fs-2 fw-bold mt-3 mb-1">Welcome Back</h1>
          <p className="text-muted">Sign in to explore verified listings</p>
        </div>

        {/* Card */}
        <div className="card ub-auth-card">
          <div className="card-body p-4 p-md-5">
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-4" role="alert">
                <AlertTriangle size={20} className="flex-shrink-0" aria-hidden />
                <span className="flex-grow-1">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label fw-medium" htmlFor="login-email">
                  Email Address
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent">
                    <Mail size={16} className="text-muted" />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    className="form-control border-start-0"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="form-label fw-medium" htmlFor="login-password">
                  Password
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent">
                    <Lock size={16} className="text-muted" />
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    className="form-control border-start-0 border-end-0"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="input-group-text bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword
                      ? <EyeOff size={16} className="text-muted" />
                      : <Eye size={16} className="text-muted" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Signing in...
                  </>
                ) : "Sign In"}
              </button>
            </form>

            <hr className="my-4" />

            <p className="text-center text-muted mb-0">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-primary fw-semibold text-decoration-none">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-muted small mt-4 mb-0">
          Secure login powered by JWT authentication
        </p>
      </div>
    </div>
  );
}
