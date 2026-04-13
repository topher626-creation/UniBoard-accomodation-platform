import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone, Upload, Building2, IdCard, GraduationCap, AlertTriangle, CheckCircle } from "lucide-react";
import { BrandLogo } from "../components/BrandLogo";
import { useAuthStore } from "../stores/authStore";
import { useDropzone } from 'react-dropzone';
import './Register.jsx.css';

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "student",
    business_name: "",
    verification_document_url: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nrcFile, setNrcFile] = useState(null);
  const navigate = useNavigate();
  const { register: authRegister } = useAuthStore();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setNrcFile(file);
      setError('');
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/upload?purpose=register`, {
          method: 'POST',
          body: formDataUpload,
        });
        if (!res.ok) {
          throw new Error(`Upload failed: ${res.statusText}`);
        }
        const data = await res.json();
        if (data.url) {
          setFormData(prev => ({ ...prev, verification_document_url: data.url }));
        }
      } catch {
        setError('Upload failed. Please try again.');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png'], 'application/pdf': ['.pdf'] },
    maxSize: 5 * 1024 * 1024,
  });

  const handleNext = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword || formData.password.length < 8) {
      setError("Passwords don't match or too short.");
      return;
    }
    if (formData.role === 'landlord' && formData.name && formData.email) {
      setCurrentStep(2);
    } else {
      handleSubmit();
    }
  };

  const handleBusinessNext = (e) => {
    e.preventDefault();
    if (!formData.business_name.trim()) {
      setError('Business/Compound name required.');
      return;
    }
    setCurrentStep(3);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await authRegister(formData);
      navigate("/");
    } catch (err) {
      setError(err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ub-auth-page" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
      <div className="ub-auth-container" style={{ maxWidth: "500px" }}>
        <div className="text-center mb-4">
          <Link to="/" className="d-inline-flex justify-content-center text-decoration-none">
            <BrandLogo height={52} />
          </Link>
          <h1 className="fs-2 fw-bold mt-3 mb-1">Join UniBoard</h1>
          <p className="text-muted">Create your account and start exploring</p>
        </div>

        <div className="card ub-auth-card">
          <div className="card-body p-4 p-md-5">
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-4" role="alert">
                <AlertTriangle size={20} className="flex-shrink-0" aria-hidden />
                <span className="flex-grow-1">{error}</span>
              </div>
            )}

            <div className="step-indicator mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <div className={`step-circle ${currentStep >= 1 ? 'active' : ''}`}>1</div>
                {formData.role === 'landlord' && (
                  <>
                    <div className={`step-line ${currentStep > 1 ? 'active' : ''}`}></div>
                    <div className={`step-circle ${currentStep >= 2 ? 'active' : ''}`}>2</div>
                    <div className={`step-line ${currentStep > 2 ? 'active' : ''}`}></div>
                    <div className={`step-circle ${currentStep >= 3 ? 'active' : ''}`}>3</div>
                  </>
                )}
              </div>
            </div>

            <style>{`.step-indicator {
                  margin-bottom: 2rem;
                }
                .step-circle {
                  width: 32px;
                  height: 32px;
                  border-radius: 50%;
                  background: #e9ecef;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  font-size: 14px;
                  color: #6c757d;
                  transition: all 0.3s;
                }
                .step-circle.active {
                  background: #0d6efd;
                  color: white;
                  box-shadow: 0 0 0 3px rgba(13,110,253,.25);
                }
                .step-line {
                  flex: 1;
                  height: 2px;
                  background: #e9ecef;
                  margin: 0 8px;
                  transition: background 0.3s;
                }
                .step-line.active {
                  background: #0d6efd;
                }
                .role-card {
                  transition: all 0.2s;
                  cursor: pointer;
                }
                .role-card:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .dropzone {
                  transition: all 0.2s;
                  border: 2px dashed #dee2e6 !important;
                }
                .dropzone:hover {
                  border-color: #0d6efd !important;
                  background-color: rgba(13,110,253,0.05);
                }`}</style>

            {currentStep === 1 && (
              <form onSubmit={handleNext}>
                <h5 className="fw-bold mb-4"><User /> Account Details</h5>
                <div className="mb-3">
                  <label className="form-label fw-medium" htmlFor="reg-name">
                    Full Name
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent">
                      <User size={16} className="text-muted" />
                    </span>
                    <input
                      id="reg-name"
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium" htmlFor="reg-email">
                    Email Address
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent">
                      <Mail size={16} className="text-muted" />
                    </span>
                    <input
                      id="reg-email"
                      type="email"
                      className="form-control border-start-0"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium" htmlFor="reg-phone">
                    Phone Number <span className="text-muted fw-normal">(optional)</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent">
                      <Phone size={16} className="text-muted" />
                    </span>
                    <input
                      id="reg-phone"
                      type="tel"
                      className="form-control border-start-0"
                      placeholder="+260 97X XXX XXX"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold mb-3 d-block">Choose Role</label>
                  <div className="row g-3">
                    <div className="col-6">
                      <div
                        className={`role-card card border-3 p-4 text-center cursor-pointer h-100 ${formData.role === "student" ? "border-primary bg-primary-subtle shadow-lg" : "border-secondary"}`}
                        style={{minHeight: '120px'}}
                        onClick={() => {
                          handleChange("role", "student");
                          setCurrentStep(1);
                        }}
                      >
                        <div className="mb-3 text-primary d-flex justify-content-center">
                          <GraduationCap size={48} strokeWidth={1.5} aria-hidden />
                        </div>
                        <div className="h5 fw-bold mb-2">Student</div>
                        <div className="text-muted">Find accommodation</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div
                        className={`role-card card border-3 p-4 text-center cursor-pointer h-100 ${formData.role === "landlord" ? "border-primary bg-primary-subtle shadow-lg" : "border-secondary"}`}
                        style={{minHeight: '120px'}}
                        onClick={() => handleChange("role", "landlord")}
                      >
                        <div className="mb-3 text-primary d-flex justify-content-center">
                          <Building2 size={48} strokeWidth={1.5} aria-hidden />
                        </div>
                        <div className="h5 fw-bold mb-2">Landlord</div>
                        <div className="text-muted">Rent out bedspaces</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium" htmlFor="reg-password">
                    Create Password
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent">
                      <Lock size={16} className="text-muted" />
                    </span>
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      className="form-control border-start-0"
                      placeholder="Min. 8 characters"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      required
                    />
                    <button type="button" className="input-group-text bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-medium" htmlFor="reg-confirm">
                    Confirm Password
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent">
                      <Lock size={16} className="text-muted" />
                    </span>
                    <input
                      id="reg-confirm"
                      type={showConfirm ? "text" : "password"}
                      className="form-control border-start-0"
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      required
                    />
                    <button type="button" className="input-group-text bg-transparent" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <Link to="/login" className="btn btn-outline-secondary flex-grow-1">
                    Have Account?
                  </Link>
                  <button type="submit" className="btn btn-primary flex-grow-1 fw-bold" disabled={loading}>
                    {loading ? 'Loading...' : formData.role === 'landlord' ? 'Next' : 'Create Account'}
                  </button>
                </div>
              </form>
            )}

            {currentStep === 2 && formData.role === 'landlord' && (
              <div>
                <h5 className="fw-bold mb-4"><Building2 /> Business Details</h5>
                <form onSubmit={handleBusinessNext}>
                  <div className="mb-4">
                    <label className="form-label fw-medium" htmlFor="business-name">
                      Register your Property / Business / Compound Name
                    </label>
                    <input
                      id="business-name"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Halawa Compound"
                      value={formData.business_name}
                      onChange={(e) => handleChange("business_name", e.target.value)}
                      required
                    />
                    <div className="form-text">
                      This name will appear on your dashboard
                    </div>
                  </div>
                  <div className="d-flex gap-3">
                    <button type="button" className="btn btn-outline-secondary flex-grow-1" onClick={() => setCurrentStep(1)}>
                      Back
                    </button>
                    <button type="submit" className="btn btn-primary flex-grow-1 fw-bold" disabled={loading || !formData.business_name.trim()}>
                      Next
                    </button>
                  </div>
                </form>
              </div>
            )}

            {currentStep === 3 && formData.role === 'landlord' && (
              <div>
                <h5 className="fw-bold mb-4"><IdCard /> Verification</h5>
                <div {...getRootProps()} className={`dropzone border-3 p-6 text-center mb-4 rounded-3 ${isDragActive ? 'border-primary bg-primary-subtle' : 'border-dashed border-secondary'}`} style={{minHeight: '200px', cursor: 'pointer'}}>
                  <input {...getInputProps()} />
                  <Upload size={48} className="text-muted mb-3" />
                  <h6 className="mb-1">Upload NRC / ID Card</h6>
                  <p className="text-muted mb-0">
                    Max 5MB. JPG, PNG, PDF
                  </p>
                  {nrcFile && (
                    <div className="mt-3">
                      <small className="text-success d-inline-flex align-items-center gap-1">
                        <CheckCircle size={14} aria-hidden /> {nrcFile.name} uploaded
                      </small>
                    </div>
                  )}
                  {formData.verification_document_url && (
                    <div className="mt-3 p-2 bg-success-subtle rounded">
                      <small>Cloud URL ready</small>
                    </div>
                  )}
                </div>
                <div className="d-flex gap-3">
                  <button type="button" className="btn btn-outline-secondary flex-grow-1" onClick={() => setCurrentStep(2)}>
                    Back
                  </button>
                  <button onClick={handleSubmit} className="btn btn-primary flex-grow-1 fw-bold" disabled={loading || !formData.verification_document_url}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Creating Account...
                      </>
                    ) : 'Create Account'}
                  </button>
                </div>
              </div>
            )}

            <hr className="my-4" />

            <p className="text-center text-muted mb-0">
              Already have an account?{" "}
              <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-muted small mt-4 mb-0">
          By signing up, you agree to our terms of service.
        </p>
      </div>
    </div>
  );
}

