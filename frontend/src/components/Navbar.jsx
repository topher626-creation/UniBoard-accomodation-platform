import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.ts";
import { useAuthActions } from "../hooks/useAuth.ts";

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuthActions();
  const navigate = useNavigate();
  const location = useLocation();

  const [showMenu, setShowMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const dashboardRoute =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "landlord"
      ? "/landlord"
      : null;

  const goTo = (path) => {
    navigate(path);
    setShowMenu(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("bg-dark");
    document.body.classList.toggle("text-light");
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
        <div className="container-fluid px-4">

          {/* LOGO */}
          <button className="navbar-brand btn btn-link text-decoration-none fw-bold" onClick={() => goTo("/")}>
            UniBoard
          </button>

          {/* HAMBURGER */}
          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setShowMenu(true)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* DESKTOP MENU */}
          <div className="collapse navbar-collapse justify-content-center d-none d-lg-flex">

            <ul className="navbar-nav gap-3 align-items-center">

              <li className="nav-item">
                <button className="btn btn-link" onClick={() => goTo("/")}>
                  Home
                </button>
              </li>

              {!user && (
                <li className="nav-item">
                  <button className="btn btn-link" onClick={() => goTo("/register")}>
                    Register
                  </button>
                </li>
              )}

              {dashboardRoute && (
                <li className="nav-item">
                  <button className="btn btn-link" onClick={() => goTo(dashboardRoute)}>
                    Dashboard
                  </button>
                </li>
              )}

            </ul>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="d-none d-lg-flex gap-2 align-items-center">

            <button className="btn btn-outline-secondary btn-sm" onClick={toggleDarkMode}>
              {darkMode ? "Light" : "Dark"}
            </button>

            {user ? (
              <div className="dropdown">
                <button className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown">
                  {user.name || "Account"}
                </button>

                <ul className="dropdown-menu dropdown-menu-end">
                  {dashboardRoute && (
                    <li>
                      <button className="dropdown-item" onClick={() => goTo(dashboardRoute)}>
                        Dashboard
                      </button>
                    </li>
                  )}
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => goTo("/login")}>
                Login
              </button>
            )}

          </div>
        </div>
      </nav>

      {/* OFFCANVAS MENU (MOBILE) */}
      {showMenu && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" style={{ zIndex: 2000 }}>
          <div className="bg-white w-75 h-100 p-4">

            <h5 className="mb-4">Menu</h5>

            <button className="btn btn-link w-100 text-start" onClick={() => goTo("/")}>
              Home
            </button>

            {!user && (
              <button className="btn btn-link w-100 text-start" onClick={() => goTo("/register")}>
                Register
              </button>
            )}

            {dashboardRoute && (
              <button className="btn btn-link w-100 text-start" onClick={() => goTo(dashboardRoute)}>
                Dashboard
              </button>
            )}

            <hr />

            <button className="btn btn-outline-secondary w-100 mb-2" onClick={toggleDarkMode}>
              Toggle Dark Mode
            </button>

            {user ? (
              <button className="btn btn-danger w-100" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <button className="btn btn-primary w-100" onClick={() => goTo("/login")}>
                Login
              </button>
            )}

            <button className="btn btn-light w-100 mt-3" onClick={() => setShowMenu(false)}>
              Close
            </button>

          </div>
        </div>
      )}
    </>
  );
}