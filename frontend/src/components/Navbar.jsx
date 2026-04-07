import { useState } from "react";
import { Button } from "@nextui-org/react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.ts";
import { useAuthActions } from "../hooks/useAuth.ts";

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthActions();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const navButtonClass = (active) =>
    `text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium px-4 py-2 rounded-lg transition-colors duration-200 ${active ? "bg-blue-100 text-blue-700" : ""}`;

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-custom sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 md:gap-6">
        <div className="flex items-center justify-between w-full md:w-auto">
          <h2
            className="text-2xl font-bold text-gradient cursor-pointer hover:scale-105 transition-transform"
            onClick={() => {
              navigate("/");
              setMenuOpen(false);
            }}
          >
            🏠 UniBoard
          </h2>

          <button
            type="button"
            className="md:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className="block w-6 h-0.5 bg-slate-800 mb-1"></span>
            <span className="block w-6 h-0.5 bg-slate-800 mb-1"></span>
            <span className="block w-6 h-0.5 bg-slate-800"></span>
          </button>
        </div>

        <div className={`flex-col md:flex-row md:flex md:items-center md:justify-end w-full md:w-auto gap-3 ${menuOpen ? "flex" : "hidden md:flex"}`}>
          <Button className={navButtonClass(isActive("/"))} onClick={() => { navigate("/"); setMenuOpen(false); }}>
            Home
          </Button>

          {user ? (
            <>
              <span className="text-gray-700 font-medium px-3 py-2 rounded-lg bg-slate-50 md:bg-transparent md:px-0 md:py-0">
                Welcome, {user.name}!
              </span>
              <Button className={navButtonClass(isActive("/my-bookings"))} onClick={() => { navigate("/my-bookings"); setMenuOpen(false); }}>
                My Bookings
              </Button>
              {user.role === "landlord" && (
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200" onClick={() => { navigate("/create-listing"); setMenuOpen(false); }}>
                  Add Property
                </Button>
              )}
              {user.role === "admin" && (
                <Button className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors" onClick={() => { navigate("/admin"); setMenuOpen(false); }}>
                  Admin Panel
                </Button>
              )}
              <Button className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button className={navButtonClass(isActive("/login"))} onClick={() => { navigate("/login"); setMenuOpen(false); }}>
                Login
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200" onClick={() => { navigate("/register"); setMenuOpen(false); }}>
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}