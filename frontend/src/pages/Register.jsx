import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Eye, EyeOff, Mail, Lock, User, Phone, Upload, 
  Building2, IdCard, GraduationCap, AlertTriangle, 
  CheckCircle, ArrowRight, ArrowLeft, Briefcase, 
  School, Users
} from "lucide-react";
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
    gender: "Male",
    university: "",
    business_name: "",
    nrc_front_url: "",
    nrc_back_url: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState({ front: false, back: false });
  
  const navigate = useNavigate();
  const { register: authRegister } = useAuthStore();

  const universities = [
    "University of Zambia (UNZA)",
    "Copperbelt University (CBU)",
    "Mulungushi University",
    "ZCAS University",
    "Cavendish University",
    "Lusaka Apex Medical University",
    "Other"
  ];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    
    setUploading(prev => ({ ...prev, [type]: true }));
    setError("");
    
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataUpload,
      });
      
      if (!res.ok) throw new Error('Upload failed');
      
      const data = await res.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, [`nrc_${type}_url`]: data.url }));
      }
    } catch (err) {
      setError(`Failed to upload ${type} image. Please try again.`);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError("");
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (formData.role === 'landlord') {
      setCurrentStep(2);
    } else {
      setCurrentStep(2); // Students go to university/gender step
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await authRegister(formData);
      navigate(formData.role === 'landlord' ? "/landlord" : "/");
    } catch (err) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ub-auth-page py-5 bg-light min-h-screen">
      <div className="container" style={{ maxWidth: "550px" }}>
        <div className="text-center mb-4">
          <Link to="/" className="d-inline-flex justify-content-center text-decoration-none">
            <BrandLogo height={48} />
          </Link>
          <h1 className="h3 fw-bold mt-3 mb-1">Create Your Account</h1>
          <p className="text-muted">Join the UniBoard community today</p>
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          {/* Progress Bar */}
          <div className="progress rounded-0" style={{ height: "4px" }}>
            <div 
              className="progress-bar bg-primary transition-all" 
              style={{ width: `${(currentStep / (formData.role === 'landlord' ? 3 : 2)) * 100}%` }}
            />
          </div>

          <div className="card-body p-4 p-md-5">
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 rounded-3 py-3 mb-4" role="alert">
                <AlertTriangle size={20} className="flex-shrink-0" />
                <span className="small fw-semibold">{error}</span>
              </div>
            )}

            {/* Step 1: Basic Info & Role */}
            {currentStep === 1 && (
              <form onSubmit={handleNext}>
                <div className="mb-4">
                  <label className="form-label fw-bold small text-uppercase tracking-wider text-muted">Account Type</label>
                  <div className="row g-3">
                    <div className="col-6">
                      <div 
                        onClick={() => handleChange("role", "student")}
                        className={`p-3 rounded-3 border-2 text-center cursor-pointer transition-all ${formData.role === 'student' ? 'border-primary bg-primary-subtle bg-opacity-10' : 'border-light bg-light opacity-75'}`}
                      >
                        <GraduationCap size={32} className={`mb-2 ${formData.role === 'student' ? 'text-primary' : 'text-muted'}`} />
                        <div className={`fw-bold small ${formData.role === 'student' ? 'text-primary' : 'text-dark'}`}>Student</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div 
                        onClick={() => handleChange("role", "landlord")}
                        className={`p-3 rounded-3 border-2 text-center cursor-pointer transition-all ${formData.role === 'landlord' ? 'border-primary bg-primary-subtle bg-opacity-10' : 'border-light bg-light opacity-75'}`}
                      >
                        <Building2 size={32} className={`mb-2 ${formData.role === 'landlord' ? 'text-primary' : 'text-muted'}`} />
                        <div className={`fw-bold small ${formData.role === 'landlord' ? 'text-primary' : 'text-dark'}`}>Landlord</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0"><User size={18} className="text-muted" /></span>
                    <input
                      type="text"
                      className="form-control bg-light border-0"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0"><Mail size={18} className="text-muted" /></span>
                    <input
                      type="email"
                      className="form-control bg-light border-0"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0"><Lock size={18} className="text-muted" /></span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control bg-light border-0"
                        placeholder="••••••"
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Confirm</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0"><Lock size={18} className="text-muted" /></span>
                      <input
                        type={showConfirm ? "text" : "password"}
                        className="form-control bg-light border-0"
                        placeholder="••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold mt-2 d-flex align-items-center justify-content-center gap-2">
                  Continue <ArrowRight size={20} />
                </button>
              </form>
            )}

            {/* Step 2: Student Specific (Gender/University) */}
            {currentStep === 2 && formData.role === 'student' && (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-bold small text-uppercase tracking-wider text-muted">Gender</label>
                  <div className="row g-2">
                    {["Male", "Female", "Other"].map(g => (
                      <div key={g} className="col-4">
                        <button
                          type="button"
                          onClick={() => handleChange("gender", g)}
                          className={`btn w-100 py-2 fw-semibold ${formData.gender === g ? 'btn-primary' : 'btn-outline-light text-dark'}`}
                        >
                          {g}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small">University</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0"><School size={18} className="text-muted" /></span>
                    <select 
                      className="form-select bg-light border-0"
                      value={formData.university}
                      onChange={(e) => handleChange("university", e.target.value)}
                      required
                    >
                      <option value="">Select your university</option>
                      {universities.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small">Phone Number</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0"><Phone size={18} className="text-muted" /></span>
                    <input
                      type="tel"
                      className="form-control bg-light border-0"
                      placeholder="+260 XXX XXXXXX"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <button type="button" onClick={() => setCurrentStep(1)} className="btn btn-light btn-lg flex-grow-1 fw-bold">
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary btn-lg flex-grow-1 fw-bold" disabled={loading}>
                    {loading ? 'Creating...' : 'Finish Registration'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Landlord Specific (Business Name) */}
            {currentStep === 2 && formData.role === 'landlord' && (
              <form onSubmit={(e) => { e.preventDefault(); setCurrentStep(3); }}>
                <div className="mb-4 text-center py-3">
                  <div className="bg-primary-subtle text-primary rounded-circle d-inline-flex p-3 mb-3">
                    <Briefcase size={32} />
                  </div>
                  <h5 className="fw-bold">Business Information</h5>
                  <p className="text-muted small">Tell us about your property management business</p>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small">Business or Compound Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0"><Building2 size={18} className="text-muted" /></span>
                    <input
                      type="text"
                      className="form-control bg-light border-0"
                      placeholder="e.g., Sunrise Accommodations"
                      value={formData.business_name}
                      onChange={(e) => handleChange("business_name", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small">Business Phone Number</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0"><Phone size={18} className="text-muted" /></span>
                    <input
                      type="tel"
                      className="form-control bg-light border-0"
                      placeholder="+260 XXX XXXXXX"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <button type="button" onClick={() => setCurrentStep(1)} className="btn btn-light btn-lg flex-grow-1 fw-bold">
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary btn-lg flex-grow-1 fw-bold">
                    Next Step
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Landlord Specific (NRC Verification) */}
            {currentStep === 3 && formData.role === 'landlord' && (
              <form onSubmit={handleSubmit}>
                <div className="mb-4 text-center py-3">
                  <div className="bg-warning-subtle text-warning rounded-circle d-inline-flex p-3 mb-3">
                    <IdCard size={32} />
                  </div>
                  <h5 className="fw-bold">Identity Verification</h5>
                  <p className="text-muted small">Upload your NRC for account verification</p>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <label className="form-label fw-semibold small d-block text-center">NRC Front</label>
                    <div className="position-relative">
                      <input 
                        type="file" 
                        className="position-absolute opacity-0 w-100 h-100 cursor-pointer" 
                        onChange={(e) => handleFileUpload(e.target.files[0], 'front')}
                        disabled={uploading.front}
                      />
                      <div className={`border-2 border-dashed rounded-3 p-3 text-center ${formData.nrc_front_url ? 'border-success bg-success-subtle bg-opacity-10' : 'border-light bg-light'}`}>
                        {uploading.front ? (
                          <div className="spinner-border spinner-border-sm text-primary" />
                        ) : formData.nrc_front_url ? (
                          <CheckCircle className="text-success" />
                        ) : (
                          <Upload size={20} className="text-muted" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold small d-block text-center">NRC Back</label>
                    <div className="position-relative">
                      <input 
                        type="file" 
                        className="position-absolute opacity-0 w-100 h-100 cursor-pointer" 
                        onChange={(e) => handleFileUpload(e.target.files[0], 'back')}
                        disabled={uploading.back}
                      />
                      <div className={`border-2 border-dashed rounded-3 p-3 text-center ${formData.nrc_back_url ? 'border-success bg-success-subtle bg-opacity-10' : 'border-light bg-light'}`}>
                        {uploading.back ? (
                          <div className="spinner-border spinner-border-sm text-primary" />
                        ) : formData.nrc_back_url ? (
                          <CheckCircle className="text-success" />
                        ) : (
                          <Upload size={20} className="text-muted" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <button type="button" onClick={() => setCurrentStep(2)} className="btn btn-light btn-lg flex-grow-1 fw-bold">
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary btn-lg flex-grow-1 fw-bold" disabled={loading || uploading.front || uploading.back}>
                    {loading ? 'Verifying...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-4 text-center">
              <p className="small text-muted mb-0">
                Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Log In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
