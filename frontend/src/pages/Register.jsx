import { useState } from "react";
import { Input, Button, Select, SelectItem } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { useAuthActions } from "../hooks/useAuth.ts";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "student"
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register } = useAuthActions();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      navigate("/");
    } catch (err) {
      setError(err?.message || "Sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gradient mb-2">Join UniBoard</h1>
          <p className="text-gray-600 dark:text-slate-300 text-lg">Create your account and start exploring verified listings</p>
        </div>

        {/* Register Card */}
        <div className="card p-8 animate-slide-in dark:bg-slate-900 dark:border-slate-700">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h2>
            <p className="text-gray-600 dark:text-slate-300">Fill in your details to get started</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
              <div className="flex items-center">
                <div className="text-red-400 mr-3">⚠️</div>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                Full Name
              </label>
              <Input
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors duration-200"
                size="lg"
                startContent={<span className="text-gray-400">👤</span>}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                Email Address
              </label>
              <Input
                placeholder="Enter your email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors duration-200"
                size="lg"
                startContent={<span className="text-gray-400">📧</span>}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                Phone Number <span className="text-gray-500">(optional)</span>
              </label>
              <Input
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors duration-200"
                size="lg"
                startContent={<span className="text-gray-400">📱</span>}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                I am a...
              </label>
              <Select
                placeholder="Select your role"
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className="input-primary"
                size="lg"
                startContent={<span className="text-gray-400">🎓</span>}
              >
                <SelectItem key="student" value="student">🎓 Student</SelectItem>
                <SelectItem key="landlord" value="landlord">🏠 Landlord/Property Manager</SelectItem>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                Password
              </label>
              <Input
                placeholder="Create a strong password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors duration-200"
                size="lg"
                startContent={<span className="text-gray-400">🔒</span>}
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                }
                required
              />
            </div>

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 w-full py-3 text-lg font-semibold"
              type="submit"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-slate-300">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:text-blue-700 font-semibold underline transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 dark:text-slate-400 text-sm">
          <p>By signing up, you agree to our terms of service.</p>
        </div>
      </div>
    </div>
  );
}