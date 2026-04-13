import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { AuthModal } from "../auth/AuthModal";
import "./Navbar.css";

function Navbar() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const openLogin = () => {
    setAuthMode("login");
    setShowAuthModal(true);
    setShowOffcanvas(false);
  };

  const openRegister = () => {
    setAuthMode("register");
    setShowAuthModal(true);
    setShowOffcanvas(false);
  };

  const handleLogout = () => {
    logout();
    setShowOffcanvas(false);
    navigate("/");
  };

  const getThemeIcon = () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    return isDark ? "🌙" : "☀️";
  };

  const toggleTheme = () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg sticky-top">
        <div className="container">
          {/* Logo */}
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <span className="fs-4 fw-bold">🏠 UniBoard</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="d-none d-lg-flex align-items-center gap-4">
            <Link to="/" className="nav-link text-dark">
              Home
            </Link>
            <Link to="/about" className="nav-link text-dark">
              About Us
            </Link>
            {(user?.role === "landlord" || user?.role === "admin") && (
              <Link to="/create-listing" className="nav-link text-dark">
                List Property
              </Link>
            )}
          </div>

          {/* Right Side - Desktop */}
          <div className="d-none d-lg-flex align-items-center gap-3">
            {/* Theme Toggle */}
            <button
              className="btn btn-link text-dark p-2"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              {getThemeIcon()}
            </button>

            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-primary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  {user.name || user.email}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link to="/profile" className="dropdown-item">
                      Profile
                    </Link>
                  </li>
                  {user.role === "landlord" && (
                    <li>
                      <Link to="/landlord" className="dropdown-item">
                        Landlord Dashboard
                      </Link>
                    </li>
                  )}
                  {user.role === "admin" && (
                    <li>
                      <Link to="/admin" className="dropdown-item">
                        Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <button className="btn btn-outline-primary" onClick={openLogin}>
                  Login
                </button>
                <button className="btn btn-primary" onClick={openRegister}>
                  Register
                </button>
              </>
            )}
          </div>

          {/* Hamburger Menu - Mobile */}
          <button
            className="btn d-lg-none"
            type="button"
            onClick={() => setShowOffcanvas(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Offcanvas Menu */}
      <div
        className={`offcanvas offcanvas-end ${showOffcanvas ? "show" : ""}`}
        tabIndex="-1"
        style={{ visibility: showOffcanvas ? "visible" : "hidden" }}
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">
            <span className="fw-bold text-primary">🏠 UniBoard</span>
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowOffcanvas(false)}
          />
        </div>
        <div className="offcanvas-body">
          <ul className="nav flex-column gap-2">
            <li className="nav-item">
              <Link
                to="/"
                className="nav-link text-dark py-2"
                onClick={() => setShowOffcanvas(false)}
              >
                🏠 Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/about"
                className="nav-link text-dark py-2"
                onClick={() => setShowOffcanvas(false)}
              >
                ℹ️ About Us
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/help"
                className="nav-link text-dark py-2"
                onClick={() => setShowOffcanvas(false)}
              >
                ❓ Help
              </Link>
            </li>

            {(user?.role === "landlord" || user?.role === "admin") && (
              <li className="nav-item">
                <Link
                  to="/create-listing"
                  className="nav-link text-dark py-2"
                  onClick={() => setShowOffcanvas(false)}
                >
                  ➕ List Property
                </Link>
              </li>
            )}

            <li className="nav-item">
              <Link
                to="/properties"
                className="nav-link text-dark py-2"
                onClick={() => setShowOffcanvas(false)}
              >
                🔍 Browse Bedspaces
              </Link>
            </li>
          </ul>

          <hr />

          {/* Theme Toggle */}
          <button
            className="btn btn-link text-dark w-100 text-start py-2"
            onClick={toggleTheme}
          >
            {getThemeIcon()} {getThemeIcon() === "🌙" ? "Light Mode" : "Dark Mode"}
          </button>

          <hr />

          {user ? (
            <div className="d-flex flex-column gap-2">
              <Link
                to="/profile"
                className="btn btn-outline-primary"
                onClick={() => setShowOffcanvas(false)}
              >
                👤 Profile
              </Link>
              {(user.role === "landlord" || user.role === "admin") && (
                <Link
                  to="/landlord"
                  className="btn btn-outline-primary"
                  onClick={() => setShowOffcanvas(false)}
                >
                  📊 Dashboard
                </Link>
              )}
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="btn btn-outline-primary"
                  onClick={() => setShowOffcanvas(false)}
                >
                  ⚙️ Admin
                </Link>
              )}
              <button
                className="btn btn-outline-danger"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={openLogin}
              >
                🔐 Login
              </button>
              <button
                className="btn btn-primary w-100"
                onClick={openRegister}
              >
                📝 Register
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
}

export default Navbar;
