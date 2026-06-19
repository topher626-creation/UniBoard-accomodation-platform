import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Building2, ShieldCheck, User, Mail, Lock, Phone, Briefcase, School, Upload, CheckCircle, ArrowRight } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { BrandLogo } from "../BrandLogo";

export function AuthModal({ show, onClose, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState({ front: false, back: false });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "student",
    gender: "Male",
    university: "",
    business_name: "",
    nrc_front_url: "",
    nrc_back_url: "",
  });

  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  const universities = [
    "University of Zambia (UNZA)",
    "Copperbelt University (CBU)",
    "Mulungushi University",
    "ZCAS University",
    "Cavendish University",
    "Lusaka Apex Medical University",
    "Other"
  ];

  useEffect(() => {
    setMode(initialMode);
    setError("");
  }, [show, initialMode]);

  const handleClose = () => {
    onClose();
    setError("");
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "student",
      gender: "Male",
      university: "",
      business_name: "",
      nrc_front_url: "",
      nrc_back_url: "",
    });
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [type]: true }));
    setError("");
    const uploadData = new FormData();
    uploadData.append('image', file);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/upload?purpose=register`, {
        method: 'POST',
        body: uploadData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, [`nrc_${type}_url`]: data.url }));
      }
    } catch (err) {
      setError(`Failed to upload ${type} image.`);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(formData.email, formData.password);
      handleClose();
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (formData.role === 'landlord') {
      if (!formData.business_name) return setError("Business name required");
      if (!formData.nrc_front_url || !formData.nrc_back_url) return setError("NRC images required");
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        nrc_front: formData.nrc_front_url,
        nrc_back: formData.nrc_back_url
      };
      await register(payload);
      handleClose();
      if (formData.role === "landlord") navigate("/landlord");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" className="auth-modal">
      <Modal.Body className="p-0">
        <div className="row g-0">
          <div className="col-md-5 bg-primary text-white p-4 d-none d-md-flex flex-column justify-content-center">
            <div className="mb-3 align-self-start">
              <BrandLogo height={44} to="/" />
            </div>
            <h2 className="fw-bold mb-3">Welcome to UniBoard</h2>
            <p className="mb-0 opacity-75">Find your perfect bedspace near campus. Connect with verified landlords and students.</p>
            <div className="mt-auto pt-4">
              <p className="small mb-2 d-flex align-items-center gap-2"><GraduationCap size={16} /> For students</p>
              <p className="small mb-2 d-flex align-items-center gap-2"><Building2 size={16} /> For landlords</p>
              <p className="small mb-0 d-flex align-items-center gap-2"><ShieldCheck size={16} /> Secure and verified</p>
            </div>
          </div>

          <div className="col-md-7 p-4 position-relative">
            <button type="button" className="btn-close position-absolute top-0 end-0 m-3" onClick={handleClose} />

            {mode === "login" ? (
              <div className="pt-2">
                <h4 className="fw-bold mb-1">Welcome Back</h4>
                <p className="text-muted mb-4">Sign in to continue</p>
                {error && <div className="alert alert-danger py-2 small">{error}</div>}
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Email</label>
                    <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Password</label>
                    <input type="password" className="form-control" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 py-2 mb-3" disabled={loading}>{loading ? "Signing In..." : "Sign In"}</button>
                </form>
                <p className="text-center text-muted small">Don't have an account? <button type="button" className="btn btn-link p-0 small fw-bold" onClick={() => setMode("register")}>Register</button></p>
              </div>
            ) : (
              <div className="pt-2" style={{ maxHeight: '80vh', overflowY: 'auto', paddingRight: '10px' }}>
                <h4 className="fw-bold mb-1">Create Account</h4>
                <p className="text-muted mb-3 small">Fill in your details to get started</p>
                {error && <div className="alert alert-danger py-2 small">{error}</div>}
                
                <form onSubmit={handleRegister}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">I am a...</label>
                    <div className="row g-2">
                      <div className="col-6">
                        <div onClick={() => setFormData({...formData, role: 'student'})} className={`p-2 rounded border text-center cursor-pointer small ${formData.role === 'student' ? 'border-primary bg-primary-subtle' : 'border-light bg-light'}`}>
                          <GraduationCap size={20} className="mb-1" />
                          <div className="fw-bold">Student</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div onClick={() => setFormData({...formData, role: 'landlord'})} className={`p-2 rounded border text-center cursor-pointer small ${formData.role === 'landlord' ? 'border-primary bg-primary-subtle' : 'border-light bg-light'}`}>
                          <Building2 size={20} className="mb-1" />
                          <div className="fw-bold">Landlord</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row g-2">
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Full Name</label>
                      <input type="text" className="form-control form-control-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Email</label>
                      <input type="email" className="form-control form-control-sm" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Password</label>
                      <input type="password" minLength={8} className="form-control form-control-sm" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Confirm</label>
                      <input type="password" minLength={8} className="form-control form-control-sm" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Phone Number</label>
                      <input type="tel" className="form-control form-control-sm" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
                    </div>

                    {formData.role === 'student' ? (
                      <>
                        <div className="col-6">
                          <label className="form-label small fw-semibold">Gender</label>
                          <select className="form-select form-select-sm" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} required>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="col-6">
                          <label className="form-label small fw-semibold">University</label>
                          <select className="form-select form-select-sm" value={formData.university} onChange={(e) => setFormData({...formData, university: e.target.value})} required>
                            <option value="">Select University</option>
                            {universities.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-12">
                          <label className="form-label small fw-semibold">Business Name</label>
                          <input type="text" className="form-control form-control-sm" value={formData.business_name} onChange={(e) => setFormData({...formData, business_name: e.target.value})} required />
                        </div>
                        <div className="col-12">
                          <label className="form-label small fw-semibold">NRC Verification (Front & Back)</label>
                          <div className="row g-2">
                            <div className="col-6">
                              <div className="position-relative">
                                <input type="file" className="position-absolute opacity-0 w-100 h-100 cursor-pointer" onChange={(e) => handleFileUpload(e.target.files[0], 'front')} accept="image/*" />
                                <div className={`border rounded p-2 text-center small ${formData.nrc_front_url ? 'bg-success-subtle' : 'bg-light'}`}>
                                  {uploading.front ? <div className="spinner-border spinner-border-sm" /> : formData.nrc_front_url ? <CheckCircle size={16} className="text-success" /> : "Front"}
                                </div>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="position-relative">
                                <input type="file" className="position-absolute opacity-0 w-100 h-100 cursor-pointer" onChange={(e) => handleFileUpload(e.target.files[0], 'back')} accept="image/*" />
                                <div className={`border rounded p-2 text-center small ${formData.nrc_back_url ? 'bg-success-subtle' : 'bg-light'}`}>
                                  {uploading.back ? <div className="spinner-border spinner-border-sm" /> : formData.nrc_back_url ? <CheckCircle size={16} className="text-success" /> : "Back"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary w-100 py-2 mt-4 fw-bold" disabled={loading || uploading.front || uploading.back}>
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>
                </form>
                <p className="text-center text-muted small mt-3">Already have an account? <button type="button" className="btn btn-link p-0 small fw-bold" onClick={() => setMode("login")}>Sign In</button></p>
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
