import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Building2, ShieldCheck, User, FileText, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { BrandLogo } from "../BrandLogo";

export function AuthModal({ show, onClose, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState("role"); // role, student, landlord
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "student",
    university: "",
    gender: "",
    propertyName: "",
  });

  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    setMode(initialMode);
    setStep("role");
    setError("");
  }, [show, initialMode]);

  const handleClose = () => {
    onClose();
    setStep("role");
    setError("");
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "student",
      university: "",
      gender: "",
      propertyName: "",
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(formData.email, formData.password);
      handleClose();
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });
      handleClose();
      if (formData.role === "landlord") {
        navigate("/landlord");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    setStep(role === "student" ? "student" : "landlord");
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" className="auth-modal">
      <Modal.Body className="p-0">
        <div className="row g-0">
          {/* Left Side - Branding */}
          <div className="col-md-5 bg-primary text-white p-4 d-none d-md-flex flex-column justify-content-center">
            <div className="mb-3 align-self-start">
              <BrandLogo height={44} to="/" />
            </div>
            <h2 className="fw-bold mb-3">Welcome to UniBoard</h2>
            <p className="mb-0 opacity-75">
              Find your perfect bedspace near campus. Connect with verified landlords and students.
            </p>
            <div className="mt-auto pt-4">
              <p className="small mb-2 d-flex align-items-center gap-2">
                <GraduationCap size={16} aria-hidden /> For students
              </p>
              <p className="small mb-2 d-flex align-items-center gap-2">
                <Building2 size={16} aria-hidden /> For landlords
              </p>
              <p className="small mb-0 d-flex align-items-center gap-2">
                <ShieldCheck size={16} aria-hidden /> Secure and verified
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="col-md-7 p-4">
            <button
              type="button"
              className="btn-close position-absolute top-0 end-0 m-3"
              onClick={handleClose}
            />

            {mode === "login" ? (
              /* LOGIN FORM */
              <div className="pt-4">
                <h4 className="fw-bold mb-1">Welcome Back</h4>
                <p className="text-muted mb-4">Sign in to continue</p>

                {error && (
                  <div className="alert alert-danger py-2" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>

                <p className="text-center text-muted mb-0">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="btn btn-link p-0 text-primary fw-semibold"
                    onClick={() => {
                      setMode("register");
                      setStep("role");
                    }}
                  >
                    Register
                  </button>
                </p>
              </div>
            ) : (
              /* REGISTER FORM */
              <div className="pt-4">
                {step === "role" ? (
                  /* STEP 1: ROLE SELECTION */
                  <div>
                    <h4 className="fw-bold mb-1">Create Account</h4>
                    <p className="text-muted mb-4">Choose your account type</p>

                    <div className="row g-3">
                      {/* Student Card */}
                      <div className="col-6">
                        <div
                          className="card h-100 role-card text-center p-4"
                          onClick={() => handleRoleSelect("student")}
                        >
                          <div className="mb-3 text-primary d-flex justify-content-center">
                            <GraduationCap size={48} strokeWidth={1.5} aria-hidden />
                          </div>
                          <h5 className="fw-bold mb-2">Student</h5>
                          <p className="text-muted small mb-0">
                            Looking for accommodation
                          </p>
                        </div>
                      </div>

                      {/* Provider Card */}
                      <div className="col-6">
                        <div
                          className="card h-100 role-card text-center p-4"
                          onClick={() => handleRoleSelect("landlord")}
                        >
                          <div className="mb-3 text-primary d-flex justify-content-center">
                            <Building2 size={48} strokeWidth={1.5} aria-hidden />
                          </div>
                          <h5 className="fw-bold mb-2">Provider</h5>
                          <p className="text-muted small mb-0">
                            Landlord or Agent
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-center text-muted mt-4 mb-0">
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="btn btn-link p-0 text-primary fw-semibold"
                        onClick={() => setMode("login")}
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                ) : step === "student" ? (
                  /* STUDENT REGISTRATION */
                  <div>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-muted mb-2"
                      onClick={() => setStep("role")}
                    >
                      <span className="d-inline-flex align-items-center gap-1">
                        <ArrowLeft size={16} aria-hidden /> Back
                      </span>
                    </button>
                    <h4 className="fw-bold mb-1">Student Registration</h4>
                    <p className="text-muted mb-4">Find your perfect bedspace</p>

                    {error && (
                      <div className="alert alert-danger py-2" role="alert">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleRegister}>
                      <div className="row g-3">
                        {/* Full Name */}
                        <div className="col-12">
                          <label className="form-label">Full Name</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="John Chishya"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            required
                          />
                        </div>

                        {/* Email */}
                        <div className="col-12">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            placeholder="john@email.com"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            required
                          />
                        </div>

                        {/* Phone */}
                        <div className="col-12">
                          <label className="form-label">Phone</label>
                          <input
                            type="tel"
                            className="form-control"
                            placeholder="+260 97X XXX XXX"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                            required
                          />
                        </div>

                        {/* University */}
                        <div className="col-12">
                          <label className="form-label">University</label>
                          <select
                            className="form-select"
                            value={formData.university}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                university: e.target.value,
                              })
                            }
                            required
                          >
                            <option value="">Select University</option>
                            <option value="UNZA">University of Zambia (UNZA)</option>
                            <option value="CBU">Copperbelt University (CBU)</option>
                            <option value="MU">Mulungushi University (MU)</option>
                            <option value="ZN">Zambia Natural College</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        {/* Gender */}
                        <div className="col-12">
                          <label className="form-label">Gender</label>
                          <select
                            className="form-select"
                            value={formData.gender}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                gender: e.target.value,
                              })
                            }
                            required
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>

                        {/* Password */}
                        <div className="col-12">
                          <label className="form-label">Password</label>
                          <input
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                password: e.target.value,
                              })
                            }
                            required
                          />
                        </div>

                        {/* Confirm Password */}
                        <div className="col-12">
                          <label className="form-label">Confirm Password</label>
                          <input
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                confirmPassword: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary w-100 py-2 mt-4"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          "Create Account"
                        )}
                      </button>
                    </form>

                    <p className="text-center text-muted mt-3 mb-0">
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="btn btn-link p-0 text-primary fw-semibold"
                        onClick={() => setMode("login")}
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                ) : (
                  /* LANDLORD REGISTRATION */
                  <div>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-muted mb-2"
                      onClick={() => setStep("role")}
                    >
                      <span className="d-inline-flex align-items-center gap-1">
                        <ArrowLeft size={16} aria-hidden /> Back
                      </span>
                    </button>
                    <h4 className="fw-bold mb-1">Provider Registration</h4>
                    <p className="text-muted mb-4">List your properties</p>

                    {error && (
                      <div className="alert alert-danger py-2" role="alert">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleRegister}>
                      <div className="row g-3">
                        {/* Account Type */}
                        <div className="col-12">
                          <label className="form-label">Account Type</label>
                          <div className="d-flex gap-2">
                            <div
                              className={`flex-fill p-2 border rounded text-center cursor-pointer ${
                                formData.role === "landlord"
                                  ? "border-primary bg-light"
                                  : ""
                              }`}
                              onClick={() =>
                                setFormData({ ...formData, role: "landlord" })
                              }
                            >
                              <span className="d-inline-flex align-items-center justify-content-center gap-1">
                                <Building2 size={16} aria-hidden /> Landlord
                              </span>
                            </div>
                            <div
                              className={`flex-fill p-2 border rounded text-center cursor-pointer ${
                                formData.role === "agent"
                                  ? "border-primary bg-light"
                                  : ""
                              }`}
                              onClick={() =>
                                setFormData({ ...formData, role: "landlord" })
                              }
                            >
                              <span className="d-inline-flex align-items-center justify-content-center gap-1">
                                <User size={16} aria-hidden /> Agent
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Full Name */}
                        <div className="col-12">
                          <label className="form-label">Full Name</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Mwape Bwalya"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            required
                          />
                        </div>

                        {/* Email */}
                        <div className="col-12">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            placeholder="mwape@email.com"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            required
                          />
                        </div>

                        {/* Phone */}
                        <div className="col-12">
                          <label className="form-label">Phone</label>
                          <input
                            type="tel"
                            className="form-control"
                            placeholder="+260 97X XXX XXX"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                            required
                          />
                        </div>

                        {/* Password */}
                        <div className="col-12">
                          <label className="form-label">Password</label>
                          <input
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                password: e.target.value,
                              })
                            }
                            required
                          />
                        </div>

                        {/* Confirm Password */}
                        <div className="col-12">
                          <label className="form-label">Confirm Password</label>
                          <input
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                confirmPassword: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="alert alert-info mt-3 py-2 small d-flex align-items-start gap-2">
                        <FileText size={16} className="flex-shrink-0 mt-1" aria-hidden />
                        <span>Your account will be pending approval before you can list properties.</span>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary w-100 py-2 mt-2"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          "Create Account"
                        )}
                      </button>
                    </form>

                    <p className="text-center text-muted mt-3 mb-0">
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="btn btn-link p-0 text-primary fw-semibold"
                        onClick={() => setMode("login")}
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
