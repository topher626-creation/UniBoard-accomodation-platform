import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle, Image as ImageIcon } from "lucide-react";
import { apiClient } from "../lib/api";
import { useAuthStore } from "../stores/authStore";

export default function CreateProperty() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  const [compounds, setCompounds] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [selectedCompound, setSelectedCompound] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    price: "",
    phone: "",
    whatsapp: "",
    room_type: "single",
    total_beds: 1,
    occupied_beds: 0,
    features: [],
    images: [],
  });

  const availableFeatures = ["water", "electricity", "wifi", "security", "kitchen", "toilet"];
  const totalBedsNum = Number(formData.total_beds);
  const occupiedBedsNum = Number(formData.occupied_beds);
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
    Boolean(formData.phone.trim()) &&
    Boolean(formData.whatsapp.trim()) &&
    Boolean(selectedBuilding) &&
    !hasBedValidationError;

  const showFieldError = (fieldKey, condition) => touched[fieldKey] && condition;

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) {
      navigate("/login");
      return;
    }
    if (user.role !== "landlord" && user.role !== "admin") {
      setError("Only landlords can create properties");
    }
  }, [navigate, user]);

  useEffect(() => {
    checkAuth();
    fetchCompounds();
  }, [checkAuth]);

  useEffect(() => {
    if (selectedCompound) {
      fetchBuildings(selectedCompound);
    } else {
      setBuildings([]);
      setSelectedBuilding("");
    }
  }, [selectedCompound]);

  const fetchCompounds = async () => {
    try {
      const response = await apiClient.get("/compounds");
      setCompounds(response);
    } catch (err) {
      console.error("Error fetching compounds:", err);
    }
  };

  const fetchBuildings = async (compoundId) => {
    try {
      const response = await apiClient.get(`/buildings/compound/${compoundId}`);
      setBuildings(response);
    } catch (err) {
      console.error("Error fetching buildings:", err);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (feature, checked) => {
    setFormData((prev) => ({
      ...prev,
      features: checked
        ? [...prev.features, feature]
        : prev.features.filter((f) => f !== feature),
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 8) {
      setError("Maximum 8 images allowed per property");
      return;
    }
    try {
      setUploadingImages(true);
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
      phone: true,
      whatsapp: true,
      building: true,
      total_beds: true,
      occupied_beds: true,
    });
    if (!isFormValid) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const propertyData = {
        ...formData,
        building_id: selectedBuilding,
        price: parseFloat(formData.price),
        total_beds: parseInt(formData.total_beds, 10),
        occupied_beds: parseInt(formData.occupied_beds, 10),
      };
      await apiClient.post("/properties", propertyData);
      setSuccess("Property created successfully! Redirecting...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err?.message || "Error creating property");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fade-in py-4">
      <div className="container" style={{ maxWidth: "900px" }}>
        {/* Page Header */}
        <div className="mb-4">
          <h1 className="fw-bold mb-1">Create New Listing</h1>
          <p className="text-muted">Add a building-linked listing with availability and contact details</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
            <AlertTriangle size={20} className="flex-shrink-0" aria-hidden /> {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="status">
            <CheckCircle size={20} className="flex-shrink-0" aria-hidden /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Left Column */}
            <div className="col-lg-6">
              {/* Basic Info */}
              <div className="card mb-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-4">Basic Information</h5>

                  <div className="mb-3">
                    <label className="form-label fw-medium">Property Name *</label>
                    <input
                      type="text"
                      className={`form-control ${showFieldError("name", !formData.name.trim()) ? "is-invalid" : ""}`}
                      placeholder="e.g., Room 101"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                      required
                    />
                    {showFieldError("name", !formData.name.trim()) && (
                      <div className="invalid-feedback">Listing name is required.</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium">Description *</label>
                    <textarea
                      className={`form-control ${showFieldError("description", !formData.description.trim()) ? "is-invalid" : ""}`}
                      rows={3}
                      placeholder="Describe the property..."
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, description: true }))}
                      required
                    />
                    {showFieldError("description", !formData.description.trim()) && (
                      <div className="invalid-feedback">Description is required.</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium">Location *</label>
                    <input
                      type="text"
                      className={`form-control ${showFieldError("location", !formData.location.trim()) ? "is-invalid" : ""}`}
                      placeholder="e.g., Near University Gate"
                      value={formData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, location: true }))}
                      required
                    />
                    {showFieldError("location", !formData.location.trim()) && (
                      <div className="invalid-feedback">Location is required.</div>
                    )}
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-medium">Price (K/month) *</label>
                      <input
                        type="number"
                        className={`form-control ${showFieldError("price", !formData.price || Number(formData.price) < 0) ? "is-invalid" : ""}`}
                        placeholder="e.g., 1500"
                        value={formData.price}
                        onChange={(e) => handleChange("price", e.target.value)}
                        onBlur={() => setTouched((p) => ({ ...p, price: true }))}
                        min="0"
                        required
                      />
                      {showFieldError("price", !formData.price) && (
                        <div className="invalid-feedback">Enter a valid price.</div>
                      )}
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-medium">Room Type</label>
                      <select
                        className="form-select"
                        value={formData.room_type}
                        onChange={(e) => handleChange("room_type", e.target.value)}
                      >
                        <option value="single">Single Room</option>
                        <option value="bedsitter">Bedsitter</option>
                        <option value="self-contained">Self-contained</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label fw-medium">Total Beds *</label>
                      <input
                        type="number"
                        className={`form-control ${showFieldError("total_beds", Number.isNaN(totalBedsNum) || totalBedsNum < 1) ? "is-invalid" : ""}`}
                        value={formData.total_beds}
                        onChange={(e) => handleChange("total_beds", e.target.value)}
                        onBlur={() => setTouched((p) => ({ ...p, total_beds: true }))}
                        min="1"
                        required
                      />
                      {showFieldError("total_beds", Number.isNaN(totalBedsNum) || totalBedsNum < 1) && (
                        <div className="invalid-feedback">Must be at least 1.</div>
                      )}
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-medium">Occupied Beds</label>
                      <input
                        type="number"
                        className={`form-control ${showFieldError("occupied_beds", hasBedValidationError) ? "is-invalid" : ""}`}
                        value={formData.occupied_beds}
                        onChange={(e) => handleChange("occupied_beds", e.target.value)}
                        onBlur={() => setTouched((p) => ({ ...p, occupied_beds: true }))}
                        min="0"
                        required
                      />
                      {!hasBedValidationError && (
                        <div className="form-text">
                          {Math.max(totalBedsNum - occupiedBedsNum, 0)} beds available
                        </div>
                      )}
                      {showFieldError("occupied_beds", hasBedValidationError) && (
                        <div className="invalid-feedback">Must be between 0 and total beds.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="card">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-4">Contact Information</h5>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Phone Number *</label>
                    <input
                      type="tel"
                      className={`form-control ${showFieldError("phone", !formData.phone.trim()) ? "is-invalid" : ""}`}
                      placeholder="+260 97X XXX XXX"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                      required
                    />
                    {showFieldError("phone", !formData.phone.trim()) && (
                      <div className="invalid-feedback">Phone number is required.</div>
                    )}
                  </div>
                  <div className="mb-0">
                    <label className="form-label fw-medium">WhatsApp Number *</label>
                    <input
                      type="tel"
                      className={`form-control ${showFieldError("whatsapp", !formData.whatsapp.trim()) ? "is-invalid" : ""}`}
                      placeholder="+260 97X XXX XXX"
                      value={formData.whatsapp}
                      onChange={(e) => handleChange("whatsapp", e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, whatsapp: true }))}
                      required
                    />
                    {showFieldError("whatsapp", !formData.whatsapp.trim()) && (
                      <div className="invalid-feedback">WhatsApp number is required.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-lg-6">
              {/* Compound & Building */}
              <div className="card mb-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-4">Compound &amp; Building</h5>

                  <div className="mb-3">
                    <label className="form-label fw-medium">Select Compound</label>
                    <select
                      className="form-select"
                      value={selectedCompound}
                      onChange={(e) => {
                        setSelectedCompound(e.target.value);
                        setSelectedBuilding("");
                      }}
                    >
                      <option value="">-- Choose a compound --</option>
                      {compounds.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedCompound && (
                    <div className="mb-0">
                      <label className="form-label fw-medium">Select Building *</label>
                      <select
                        className={`form-select ${showFieldError("building", !selectedBuilding) ? "is-invalid" : ""}`}
                        value={selectedBuilding}
                        onChange={(e) => setSelectedBuilding(e.target.value)}
                        onBlur={() => setTouched((p) => ({ ...p, building: true }))}
                        required
                      >
                        <option value="">-- Choose a building --</option>
                        {buildings.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                      {showFieldError("building", !selectedBuilding) && (
                        <div className="invalid-feedback">Please select a building.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="card mb-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-4">Features &amp; Amenities</h5>
                  <div className="row g-2">
                    {availableFeatures.map((feature) => (
                      <div key={feature} className="col-6">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`feature-${feature}`}
                            checked={formData.features.includes(feature)}
                            onChange={(e) => handleFeatureChange(feature, e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor={`feature-${feature}`}>
                            {feature.charAt(0).toUpperCase() + feature.slice(1)}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="card">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-1">Property Images</h5>
                  <p className="text-muted small mb-3">
                    Upload up to 8 images ({formData.images.length}/8)
                  </p>

                  <label
                    className="d-block border border-dashed rounded p-3 text-center text-muted"
                    style={{ cursor: formData.images.length >= 8 ? "not-allowed" : "pointer", borderStyle: "dashed" }}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="d-none"
                      onChange={handleImageUpload}
                      disabled={formData.images.length >= 8 || uploadingImages}
                    />
                    {uploadingImages ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Uploading...
                      </>
                    ) : (
                      <span className="d-inline-flex align-items-center gap-2">
                        <ImageIcon size={20} aria-hidden /> Click to upload images
                      </span>
                    )}
                  </label>
                  <p className="form-text mt-1">JPG, PNG or WEBP. Max 5MB each.</p>

                  {formData.images.length > 0 && (
                    <div className="row g-2 mt-2">
                      {formData.images.map((img, index) => (
                        <div key={index} className="col-4 position-relative">
                          <img
                            src={img}
                            alt={`Upload ${index + 1}`}
                            className="w-100 rounded"
                            style={{ height: "80px", objectFit: "cover" }}
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle p-0"
                            style={{ width: "22px", height: "22px", fontSize: "12px", lineHeight: 1 }}
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="d-flex justify-content-end gap-3 mt-4 pt-2 border-top">
            <button
              type="button"
              className="btn btn-outline-secondary px-4"
              onClick={() => navigate("/")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary px-5 fw-semibold"
              disabled={loading || uploadingImages}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Creating...
                </>
              ) : "Create Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
