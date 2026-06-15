import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle, Image as ImageIcon, X, Plus, Info, MapPin, Phone, MessageSquare, Bed, ShieldCheck } from "lucide-react";
import { api } from "../services/api";
import { useAuthStore } from "../stores/authStore";

export default function CreateProperty() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    distance_from_campus_minutes: 5,
    price: "",
    phone_number: user?.phone || "",
    whatsapp_number: user?.phone || "",
    room_type: "shared room",
    total_bedspaces: 1,
    occupied_bedspaces: 0,
    amenities: [],
    images: [],
  });

  const availableAmenities = [
    "Wi-Fi", "Electricity", "Water", "Security", "Kitchen", 
    "Laundry", "Parking", "Study Room", "Gym", "Air Conditioning"
  ];

  const totalBedsNum = Number(formData.total_bedspaces);
  const occupiedBedsNum = Number(formData.occupied_bedspaces);
  const hasBedValidationError =
    Number.isNaN(totalBedsNum) ||
    Number.isNaN(occupiedBedsNum) ||
    totalBedsNum < 1 ||
    occupiedBedsNum < 0 ||
    occupiedBedsNum > totalBedsNum;

  const isFormValid =
    Boolean(formData.name.trim()) &&
    Boolean(formData.description.trim()) &&
    Boolean(formData.location.trim()) &&
    Boolean(formData.price) &&
    Boolean(formData.phone_number.trim()) &&
    !hasBedValidationError &&
    formData.images.length > 0;

  const showFieldError = (fieldKey, condition) => touched[fieldKey] && condition;

  const checkAuth = useCallback(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "landlord" && user.role !== "admin") {
      setError("Only landlords can create properties");
      setTimeout(() => navigate("/"), 3000);
    }
    if (user.role === "landlord" && user.status !== "active") {
      setError("Your account must be verified by an admin before you can create listings.");
    }
  }, [navigate, user]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 12) {
      setError("Maximum 12 images allowed per property");
      return;
    }
    
    try {
      setUploadingImages(true);
      setError("");
      
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const body = new FormData();
          body.append("image", file);
          
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/upload`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
              body,
            }
          );
          
          if (!response.ok) throw new Error("Failed to upload image");
          const data = await response.json();
          return data.url;
        })
      );
      
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    } catch (uploadError) {
      setError(uploadError?.message || "Image upload failed");
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      description: true,
      location: true,
      price: true,
      phone_number: true,
      total_bedspaces: true,
      occupied_bedspaces: true,
    });

    if (!isFormValid) {
      if (formData.images.length === 0) setError("Please upload at least one image.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        total_bedspaces: parseInt(formData.total_bedspaces, 10),
        occupied_bedspaces: parseInt(formData.occupied_bedspaces, 10),
        distance_from_campus_minutes: parseInt(formData.distance_from_campus_minutes, 10),
      };
      
      await api.createProperty(propertyData);
      setSuccess("Property submitted for approval! Redirecting to dashboard...");
      setTimeout(() => navigate("/landlord"), 2500);
    } catch (err) {
      setError(err?.message || "Error creating property");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fade-in py-5 bg-light min-h-screen">
      <div className="container" style={{ maxWidth: "1000px" }}>
        {/* Page Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h1 className="fw-bold h2 mb-1">Create New Property</h1>
            <p className="text-muted mb-0">List your accommodation and manage bedspaces for students</p>
          </div>
          <button 
            type="button" 
            className="btn btn-outline-secondary"
            onClick={() => navigate("/landlord")}
          >
            Cancel
          </button>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-3 mb-4 shadow-sm border-0" role="alert">
            <AlertTriangle size={24} className="flex-shrink-0" /> 
            <div className="fw-semibold">{error}</div>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success d-flex align-items-center gap-3 mb-4 shadow-sm border-0" role="status">
            <CheckCircle size={24} className="flex-shrink-0" /> 
            <div className="fw-semibold">{success}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Left Column: Basic Details */}
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-2 mb-4">
                    <Info size={20} className="text-primary" />
                    <h5 className="fw-bold mb-0">Property Details</h5>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Property Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${showFieldError("name", !formData.name.trim()) ? "is-invalid" : ""}`}
                      placeholder="e.g., Sunrise Student Hostel"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                    />
                    <div className="form-text">A catchy name helps your listing stand out.</div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Description <span className="text-danger">*</span></label>
                    <textarea
                      className={`form-control ${showFieldError("description", !formData.description.trim()) ? "is-invalid" : ""}`}
                      rows={5}
                      placeholder="Tell students about the rooms, environment, and rules..."
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, description: true }))}
                    />
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Location <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0"><MapPin size={18} className="text-muted" /></span>
                        <input
                          type="text"
                          className={`form-control border-start-0 ${showFieldError("location", !formData.location.trim()) ? "is-invalid" : ""}`}
                          placeholder="Area, Street Name"
                          value={formData.location}
                          onChange={(e) => handleChange("location", e.target.value)}
                          onBlur={() => setTouched((p) => ({ ...p, location: true }))}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Walk to Campus (mins)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.distance_from_campus_minutes}
                        onChange={(e) => handleChange("distance_from_campus_minutes", e.target.value)}
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Monthly Rent (K) <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0 fw-bold text-muted">K</span>
                        <input
                          type="number"
                          className={`form-control form-control-lg border-start-0 ${showFieldError("price", !formData.price) ? "is-invalid" : ""}`}
                          placeholder="0.00"
                          value={formData.price}
                          onChange={(e) => handleChange("price", e.target.value)}
                          onBlur={() => setTouched((p) => ({ ...p, price: true }))}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Room Type</label>
                      <select
                        className="form-select form-select-lg"
                        value={formData.room_type}
                        onChange={(e) => handleChange("room_type", e.target.value)}
                      >
                        <option value="single">Single Room</option>
                        <option value="bankers room">Bankers Room</option>
                        <option value="shared room">Shared Room</option>
                        <option value="self-contained">Self-contained</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bedspace Management */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-2 mb-4">
                    <Bed size={20} className="text-primary" />
                    <h5 className="fw-bold mb-0">Bedspace Management</h5>
                  </div>

                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Total Bedspaces <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        className={`form-control form-control-lg ${showFieldError("total_bedspaces", Number.isNaN(totalBedsNum) || totalBedsNum < 1) ? "is-invalid" : ""}`}
                        value={formData.total_bedspaces}
                        onChange={(e) => handleChange("total_bedspaces", e.target.value)}
                        onBlur={() => setTouched((p) => ({ ...p, total_bedspaces: true }))}
                        min="1"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Occupied Bedspaces</label>
                      <input
                        type="number"
                        className={`form-control form-control-lg ${showFieldError("occupied_bedspaces", hasBedValidationError) ? "is-invalid" : ""}`}
                        value={formData.occupied_bedspaces}
                        onChange={(e) => handleChange("occupied_bedspaces", e.target.value)}
                        onBlur={() => setTouched((p) => ({ ...p, occupied_bedspaces: true }))}
                        min="0"
                      />
                    </div>
                  </div>
                  {!hasBedValidationError && (
                    <div className="mt-3 p-3 bg-primary-subtle rounded-3 text-primary d-flex align-items-center gap-2">
                      <Info size={18} />
                      <span className="fw-semibold">
                        {totalBedsNum - occupiedBedsNum} bedspaces will be shown as available to students.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amenities */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-4">Amenities & Features</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {availableAmenities.map((amenity) => (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`btn btn-sm rounded-pill px-3 py-2 transition-all ${
                          formData.amenities.includes(amenity)
                            ? "btn-primary shadow-sm"
                            : "btn-outline-secondary opacity-75"
                        }`}
                      >
                        {formData.amenities.includes(amenity) && <CheckCircle size={14} className="me-1" />}
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Images & Contact */}
            <div className="col-lg-5">
              {/* Image Upload */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <h5 className="fw-bold mb-0">Property Images</h5>
                    <span className="badge bg-light text-dark border">{formData.images.length}/12</span>
                  </div>

                  <div 
                    className="border-2 border-dashed border-primary-subtle rounded-4 p-4 text-center mb-4 bg-primary-subtle bg-opacity-10 position-relative"
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="position-absolute inset-0 opacity-0 w-100 h-100"
                      disabled={uploadingImages || formData.images.length >= 12}
                      style={{ cursor: "pointer" }}
                    />
                    <div className="py-3">
                      <div className="bg-primary text-white rounded-circle d-inline-flex p-3 mb-3">
                        <Plus size={24} />
                      </div>
                      <h6 className="fw-bold mb-1">Add Property Photos</h6>
                      <p className="small text-muted mb-0">Upload up to 12 high-quality photos</p>
                    </div>
                  </div>

                  {uploadingImages && (
                    <div className="text-center py-3">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                      <span className="small fw-semibold text-primary">Uploading photos...</span>
                    </div>
                  )}

                  <div className="row g-2">
                    {formData.images.map((url, index) => (
                      <div key={index} className="col-4">
                        <div className="position-relative ratio ratio-1x1 rounded-3 overflow-hidden shadow-sm group">
                          <img src={url} alt={`Property ${index + 1}`} className="object-fit-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle p-1"
                            style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <X size={14} />
                          </button>
                          {index === 0 && (
                            <div className="position-absolute bottom-0 start-0 w-100 bg-primary text-white text-center py-1 xsmall fw-bold">
                              COVER
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-4">Contact Information</h5>
                  
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Phone Number <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0"><Phone size={18} className="text-muted" /></span>
                      <input
                        type="tel"
                        className={`form-control border-start-0 ${showFieldError("phone_number", !formData.phone_number.trim()) ? "is-invalid" : ""}`}
                        placeholder="+260 XXX XXXXXX"
                        value={formData.phone_number}
                        onChange={(e) => handleChange("phone_number", e.target.value)}
                        onBlur={() => setTouched((p) => ({ ...p, phone_number: true }))}
                      />
                    </div>
                  </div>

                  <div className="mb-0">
                    <label className="form-label fw-semibold">WhatsApp Number</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0"><MessageSquare size={18} className="text-muted" /></span>
                      <input
                        type="tel"
                        className="form-control border-start-0"
                        placeholder="+260 XXX XXXXXX"
                        value={formData.whatsapp_number}
                        onChange={(e) => handleChange("whatsapp_number", e.target.value)}
                      />
                    </div>
                    <div className="form-text">Used for students to message you directly.</div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 py-3 shadow-sm fw-bold d-flex align-items-center justify-content-center gap-2"
                disabled={loading || uploadingImages}
              >
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm" role="status" />
                    <span>Submitting Property...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={22} />
                    <span>Submit for Approval</span>
                  </>
                )}
              </button>
              <p className="text-center text-muted small mt-3 px-4">
                By submitting, you agree to UniBoard's property listing guidelines. Your property will be visible once verified by our team.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
