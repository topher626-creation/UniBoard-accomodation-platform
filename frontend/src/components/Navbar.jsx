import { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
    window.location.reload(); // Refresh to update listings
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-custom sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h2
          className="text-2xl font-bold text-gradient cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate("/")}
        >
          🏠 UniBoard
        </h2>

        <div className="flex gap-3 items-center">
          <Button
            className={`text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium px-4 py-2 rounded-lg transition-colors duration-200 ${isActive("/") ? "bg-blue-100 text-blue-700" : ""}`}
            onClick={() => navigate("/")}
          >
            Home
          </Button>

          {user ? (
            <>
              <span className="text-gray-700 font-medium">Welcome, {user.name}!</span>
              <Button
                className={`text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium px-4 py-2 rounded-lg transition-colors duration-200 ${isActive("/my-bookings") ? "bg-blue-100 text-blue-700" : ""}`}
                onClick={() => navigate("/my-bookings")}
              >
                My Bookings
              </Button>
              {user.role === "landlord" && (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200"
                  onClick={() => navigate("/create-listing")}
                >
                  Add Property
                </Button>
              )}
              {user.role === "admin" && (
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                  onClick={() => navigate("/admin")}
                >
                  Admin Panel
                </Button>
              )}
              <Button
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                className={`text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium px-4 py-2 rounded-lg transition-colors duration-200 ${isActive("/login") ? "bg-blue-100 text-blue-700" : ""}`}
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200"
                onClick={() => navigate("/register")}
              >
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}