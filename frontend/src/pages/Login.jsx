import { useState } from "react";
import { Input, Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { useAuthActions } from "../hooks/useAuth.ts";
import { Menu, X, Moon, Sun } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthActions();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err?.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 flex items-center justify-center px-4 relative`}>
        
        {/* Header with Theme Toggle and Menu */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-40">
          <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">UniBoard</h2>
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
            >
              {isDarkMode ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-600" />
              )}
            </button>

            {/* Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              {isMenuOpen ? (
                <X size={20} className="text-gray-600 dark:text-white" />
              ) : (
                <Menu size={20} className="text-gray-600 dark:text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Info Menu Sidebar */}
        {isMenuOpen && (
          <div className="absolute top-16 right-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 w-80 z-50 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-2">🏠 About UniBoard</h3>
                <p className="text-sm text-gray-700 dark:text-slate-300">UniBoard connects students with landlords, making it easy to find verified boarding houses without physically moving around.</p>
              </div>

              <div>
                <h3 className="font-bold text-green-600 dark:text-green-400 mb-2">✨ Key Features</h3>
                <ul className="text-sm text-gray-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                  <li>Search by location, compound, or property name</li>
                  <li>Real-time bed availability</li>
                  <li>Direct WhatsApp/Call contact with landlords</li>
                  <li>Verified listings & landlords</li>
                  <li>Reviews & ratings from students</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-purple-600 dark:text-purple-400 mb-2">🎯 How It Works</h3>
                <p className="text-sm text-gray-700 dark:text-slate-300">1. Search for properties • 2. View full details (after login) • 3. Contact landlord via WhatsApp or Call • 4. Complete agreement offline</p>
              </div>

              <div>
                <h3 className="font-bold text-orange-600 dark:text-orange-400 mb-2">🤝 User Roles</h3>
                <p className="text-sm text-gray-700 dark:text-slate-300"><span className="font-semibold">Students:</span> Search & view listings<br/><span className="font-semibold">Landlords:</span> Create compounds, add properties<br/></p>
              </div>

              {/* More Info Section */}
              <div className="border-t border-gray-200 dark:border-slate-600 pt-4">
                <h3 className="font-bold text-indigo-600 dark:text-indigo-400 mb-3">ℹ️ More Info</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate("/")}
                    className="w-full text-left text-sm text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1"
                  >
                    🏠 Property Listings
                  </button>
                  <button
                    onClick={() => window.open('mailto:support@uniboard.com', '_blank')}
                    className="w-full text-left text-sm text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1"
                  >
                    📧 Contact Support
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full text-left text-sm text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1"
                  >
                    🔐 Login
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="w-full text-left text-sm text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1"
                  >
                    📝 Sign Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Form Container */}
        <div className="max-w-md w-full mt-16">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-2">Welcome Back</h1>
            <p className="text-gray-600 dark:text-slate-300 text-lg">Sign in to view full listing details and contact landlords</p>
          </div>

          {/* Login Card */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow animate-slide-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign in to UniBoard</h2>
              <p className="text-gray-600 dark:text-slate-400">Enter your credentials to continue</p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
                <div className="flex items-center">
                  <div className="text-red-400 mr-3">⚠️</div>
                  <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Email Address
                </label>
                <Input
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors duration-200"
                  classNames={{
                    input: "dark:bg-slate-800 dark:text-white",
                    inputWrapper: "dark:bg-slate-800"
                  }}
                  size="lg"
                  startContent={<span className="text-gray-400">📧</span>}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Password
                </label>
                <Input
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors duration-200"
                  classNames={{
                    input: "dark:bg-slate-800 dark:text-white",
                    inputWrapper: "dark:bg-slate-800"
                  }}
                  size="lg"
                  startContent={<span className="text-gray-400">🔒</span>}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  }
                  required
                />
              </div>

              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 w-full text-lg font-semibold"
                type="submit"
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-slate-300">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold underline transition-colors"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-500 dark:text-slate-400 text-sm">
            <p>Secure login powered by JWT authentication</p>
          </div>
        </div>
      </div>
    </div>
  );
}
