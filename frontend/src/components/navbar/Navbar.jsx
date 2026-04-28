import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  Home,
  Info,
  HelpCircle,
  Plus,
  Search,
  User,
  LayoutDashboard,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
  Heart,
  Download,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { AuthModal } from "../auth/AuthModal";
import { BrandLogo } from "../BrandLogo";
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

  const [themeDark, setThemeDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "dark"
  );

  const toggleTheme = () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    setThemeDark(newTheme === "dark");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg sticky-top ub-navbar">
        <div className="container-fluid">
          {/* Logo */}
          <Link className="navbar-brand py-1" to="/">
<BrandLogo height={52} />
          </Link>

          {/* Desktop Navigation - Always visible */}
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">
                About Us
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/help">
                Help
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/properties">
                Browse bedspaces
              </Link>
            </li>
            {(user?.role === "landlord" || user?.role === "admin") && (
              <li className="nav-item">
                <Link className="nav-link" to="/create-listing">
                  List Property
                </Link>
              </li>
            )}
          </ul>

          {/* Right Side */}
          <div className="d-flex align-items-center gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={toggleTheme}
              title={themeDark ? "Light Mode" : "Dark Mode"}
            >
              {themeDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-primary dropdown-toggle btn-sm"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Hi, {user.name}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      Profile
                    </Link>
                  </li>
                  {(user.role === "landlord" || user.role === "admin") && (
                    <li>
                      <Link className="dropdown-item" to="/landlord">
                        Dashboard
                      </Link>
                    </li>
                  )}
                  {user.role === "admin" && (
                    <li>
                      <Link className="dropdown-item" to="/admin">
                        Admin
                      </Link>
                    </li>
                  )}
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm me-2"
                  onClick={openLogin}
                >
                  Login
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={openRegister}
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* Hamburger Menu - Always Visible */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar"
            aria-controls="offcanvasNavbar"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
      </nav>

      {/* Offcanvas */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="offcanvasNavbar"
        aria-labelledby="offcanvasNavbarLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
            <BrandLogo height={36} />
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <ul className="navbar-nav flex-grow-1 menu-items">
            <li className="nav-item">
              <Link className="nav-link" to="/" data-bs-dismiss="offcanvas">
                <Home size={18} className="me-2" /> Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/properties" data-bs-dismiss="offcanvas">
                <Search size={18} className="me-2" /> Search
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/saved" data-bs-dismiss="offcanvas">
                <Heart size={18} className="me-2" /> Saved Properties
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/create-listing" data-bs-dismiss="offcanvas">
                <Plus size={18} className="me-2" /> List a Property
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/download" data-bs-dismiss="offcanvas">
                <Download size={18} className="me-2" /> Download the App
              </Link>
            </li>
          </ul>
          <hr />
          {/* Authentication Buttons */}
          {!user ? (
            <div className="d-grid gap-2">
              <button
                className="btn btn-outline-primary"
                onClick={openLogin}
                data-bs-dismiss="offcanvas"
              >
                <LogIn size={18} className="me-2" /> Log In
              </button>
              <button
                className="btn btn-primary"
                onClick={openRegister}
                data-bs-dismiss="offcanvas"
              >
                <UserPlus size={18} className="me-2" /> Sign Up
              </button>
            </div>
          ) : (
            <div className="d-grid gap-2">
              <Link
                className="btn btn-outline-primary"
                to="/profile"
                data-bs-dismiss="offcanvas"
              >
                <User size={18} className="me-2" /> Profile
              </Link>
              {(user.role === "landlord" || user.role === "admin") && (
                <Link
                  className="btn btn-outline-primary"
                  to="/landlord"
                  data-bs-dismiss="offcanvas"
                >
                  <LayoutDashboard size={18} className="me-2" /> Dashboard
                </Link>
              )}
              <button
                className="btn btn-danger"
                onClick={handleLogout}
                data-bs-dismiss="offcanvas"
              >
                <LogOut size={18} className="me-2" /> Logout
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

