import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Heart,
  Check,
  Phone,
  MessageCircle,
  Star,
  ChevronLeft,
} from "lucide-react";
import { api } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import { ReviewSection } from "../components/ReviewSection";

const HERO_PLACEHOLDER =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80";

function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  const fetchProperty = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getProperty(id);
      setProperty(data);
    } catch (err) {
      setError(err.message || "Failed to load property");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  const handleBooking = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (window.confirm("Do you want to request a booking for this bedspace?")) {
      api.createBooking({ property_id: id })
        .then(() => {
          alert("Booking request submitted! The landlord will review it.");
        })
        .catch((err) => {
          alert(err.message || "Failed to create booking");
        });
    }
  };

  const handleFavorite = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    api.addFavorite(id)
      .then(() => {
        alert("Added to favorites!");
      })
      .catch((err) => {
        alert(err.message || "Failed to add to favorites");
      });
  };

  const getAvailabilityBadge = () => {
    const status = property?.availability_status;
    if (status === "AVAILABLE") {
      return <span className="badge badge-availability badge-available">Available</span>;
    } else if (status === "LOW") {
      return <span className="badge badge-availability badge-low">Limited Beds</span>;
    } else {
      return <span className="badge badge-availability badge-full">Full</span>;
    }
  };

  const getRoomTypeLabel = (type) => {
    const labels = {
      "single": "Single Room",
      "bedsitter": "Bedsitter",
      "self-contained": "Self-contained",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container py-5 text-center">
        <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-primary mb-3" style={{ width: 80, height: 80 }}>
          <Search size={40} aria-hidden />
        </div>
        <h3 className="mt-3">Property not found</h3>
        <p className="text-muted">{error || "This property may have been removed."}</p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Hero Image */}
      <section className="position-relative" style={{ height: "400px" }}>
        <img
          src={property.images?.[0] || HERO_PLACEHOLDER}
          alt={property.name}
          className="w-100 h-100 object-fit-cover"
          style={{ objectFit: "cover" }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = HERO_PLACEHOLDER;
          }}
        />
        
        {/* Image Gallery Hint */}
        {property.images && property.images.length > 1 && (
          <div className="position-absolute bottom-0 end-0 p-3">
            <span className="badge bg-dark px-3 py-2">
              +{property.images.length - 1} more photos
            </span>
          </div>
        )}

        {/* Back Button */}
        <div className="position-absolute top-0 start-0 p-3">
          <button
            type="button"
            className="btn btn-light rounded-circle shadow d-inline-flex align-items-center justify-content-center"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={22} />
          </button>
        </div>
      </section>

      {/* Content */}
      <section className="container py-4">
        <div className="row">
          {/* Main Content */}
          <div className="col-lg-8">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h1 className="fw-bold mb-2">{property.name}</h1>
                <p className="text-muted mb-2 d-flex align-items-start gap-2">
                  <MapPin size={18} className="flex-shrink-0 mt-1" aria-hidden />
                  <span>
                    {property.location}
                    {property.building && ` - ${property.building}`}
                    {property.compound && ` (${property.compound})`}
                  </span>
                </p>
                <div className="d-flex gap-2 align-items-center">
                  {getAvailabilityBadge()}
                  <span className="badge bg-secondary">
                    {getRoomTypeLabel(property.room_type)}
                  </span>
                  {property.average_rating > 0 && (
                    <span className="badge bg-warning text-dark d-inline-flex align-items-center gap-1">
                      <Star size={12} fill="currentColor" aria-hidden /> {property.average_rating} ({property.review_count})
                    </span>
                  )}
                </div>
              </div>
              <button type="button" className="btn btn-outline-danger d-inline-flex align-items-center gap-2" onClick={handleFavorite}>
                <Heart size={18} aria-hidden /> Save
              </button>
            </div>

            {/* Tabs */}
            <ul className="nav nav-pills mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "details" ? "active" : ""}`}
                  onClick={() => setActiveTab("details")}
                >
                  Details
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "amenities" ? "active" : ""}`}
                  onClick={() => setActiveTab("amenities")}
                >
                  Amenities
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "reviews" ? "active" : ""}`}
                  onClick={() => setActiveTab("reviews")}
                >
                  Reviews ({property.review_count || 0})
                </button>
              </li>
            </ul>

            {/* Details Tab */}
            {activeTab === "details" && (
              <div>
                <h4 className="fw-bold mb-3">About this bedspace</h4>
                <p className="text-muted">{property.description || "No description available."}</p>
                
                <div className="row g-4 mt-3">
                  <div className="col-6">
                    <div className="card p-3 text-center">
                      <h3 className="fw-bold text-primary mb-1">
                        {property.total_beds}
                      </h3>
                      <p className="text-muted mb-0">Total Beds</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="card p-3 text-center">
                      <h3 className="fw-bold text-success mb-1">
                        {property.available_beds}
                      </h3>
                      <p className="text-muted mb-0">Available</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Amenities Tab */}
            {activeTab === "amenities" && (
              <div>
                <h4 className="fw-bold mb-3">Amenities & Features</h4>
                {property.features && property.features.length > 0 ? (
                  <div className="row g-3">
                    {property.features.map((feature, index) => (
                      <div key={index} className="col-md-6">
                        <div className="d-flex align-items-center gap-2">
                          <Check size={18} className="text-success flex-shrink-0" aria-hidden />
                          <span>{feature}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No amenities listed.</p>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <ReviewSection
                propertyId={property.id}
                reviews={property.reviews || []}
                averageRating={property.average_rating || 0}
                reviewCount={property.review_count || 0}
                onReviewAdded={fetchProperty}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="card sticky-top" style={{ top: "80px" }}>
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <span className="fs-3 fw-bold text-primary">
                    K{Number(property.price).toLocaleString()}
                  </span>
                  <span className="text-muted">/month</span>
                </div>

                <div className="d-flex justify-content-between mb-3 py-2 border-bottom">
                  <span className="text-muted">Bedspace Type</span>
                  <strong>{getRoomTypeLabel(property.room_type)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-3 py-2 border-bottom">
                  <span className="text-muted">Available Beds</span>
                  <strong>{property.available_beds}</strong>
                </div>
                <div className="d-flex justify-content-between mb-3 py-2 border-bottom">
                  <span className="text-muted">Occupied</span>
                  <strong>{property.occupied_beds}/{property.total_beds}</strong>
                </div>

                {property.landlord && (
                  <div className="mb-4">
                    <h6 className="fw-bold">Listed By</h6>
                    <p className="mb-1">{property.landlord.name}</p>
                    {property.landlord.phone && (
                      <p className="mb-1 small d-flex align-items-center gap-2">
                        <Phone size={14} aria-hidden /> {property.landlord.phone}
                      </p>
                    )}
                    {property.landlord.whatsapp && (
                      <a
                        href={`https://wa.me/${property.landlord.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-success btn-sm w-100 mb-2 d-inline-flex align-items-center justify-content-center gap-2"
                      >
                        <MessageCircle size={16} aria-hidden /> WhatsApp
                      </a>
                    )}
                  </div>
                )}

                <button
                  className="btn btn-primary w-100 py-3 fw-bold"
                  onClick={handleBooking}
                  disabled={property.available_beds <= 0}
                >
                  {property.available_beds > 0 ? "Request Booking" : "No Beds Available"}
                </button>

                {!user && (
                  <p className="text-center text-muted small mt-2 mb-0">
                    Please login to request a booking
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PropertyDetail;
