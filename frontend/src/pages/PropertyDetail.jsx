import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Heart,
  Check,
  Phone,
  MessageSquare,
  Star,
  ChevronLeft,
  Lock,
  Info,
  Clock,
  Layout,
  User as UserIcon
} from "lucide-react";
import { api } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import { ReviewSection } from "../components/ReviewSection";

const HERO_PLACEHOLDER = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80";

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

  const handleFavorite = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    api.addFavorite(id)
      .then(() => alert("Added to favorites!"))
      .catch((err) => alert(err.message || "Failed to add to favorites"));
  };

  const getRoomTypeLabel = (type) => {
    const labels = {
      "single": "Single Room",
      "bankers room": "Bankers Room",
      "shared room": "Shared Room",
      "self-contained": "Self-contained",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="text-center py-5 min-h-screen d-flex align-items-center justify-content-center">
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
        <Link to="/" className="btn btn-primary px-4">Back to Home</Link>
      </div>
    );
  }

  const isGuest = !user;
  const mainImage = property.images?.[0] || HERO_PLACEHOLDER;

  return (
    <div className="fade-in bg-light min-h-screen">
      {/* Hero Section */}
      <section className="position-relative bg-dark" style={{ height: "450px" }}>
        <img
          src={mainImage}
          alt={property.name}
          className="w-100 h-100 object-fit-cover opacity-75"
          style={{ filter: isGuest ? "blur(2px)" : "none" }}
        />
        <div className="position-absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
        
        {/* Navigation Overlays */}
        <div className="position-absolute top-0 start-0 p-4">
          <button
            type="button"
            className="btn btn-white rounded-circle shadow-lg d-flex align-items-center justify-content-center"
            style={{ width: "45px", height: "45px" }}
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={24} />
          </button>
        </div>

        <div className="position-absolute bottom-0 start-0 w-100 p-4 p-md-5 text-white">
          <div className="container">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              <span className="badge bg-primary px-3 py-2 text-uppercase tracking-wider small">
                {getRoomTypeLabel(property.room_type)}
              </span>
              <span className="badge bg-white text-dark px-3 py-2 small">
                {property.available_bedspaces} Bedspaces Available
              </span>
            </div>
            <h1 className="display-5 fw-bold mb-2">{property.name}</h1>
            <p className="d-flex align-items-center gap-2 fs-5 opacity-90">
              <MapPin size={20} className="text-primary" /> {property.location}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="container py-5">
        <div className="row g-4">
          {/* Main Details Column */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
              <div className="card-header bg-white border-0 pt-4 px-4">
                <ul className="nav nav-tabs border-0">
                  <li className="nav-item">
                    <button 
                      className={`nav-link border-0 fw-bold px-4 py-3 ${activeTab === 'details' ? 'active text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                      onClick={() => setActiveTab('details')}
                    >
                      Overview
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link border-0 fw-bold px-4 py-3 ${activeTab === 'amenities' ? 'active text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                      onClick={() => setActiveTab('amenities')}
                    >
                      Amenities
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link border-0 fw-bold px-4 py-3 ${activeTab === 'reviews' ? 'active text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                      onClick={() => setActiveTab('reviews')}
                    >
                      Reviews ({property.review_count || 0})
                    </button>
                  </li>
                </ul>
              </div>
              
              <div className="card-body p-4">
                {activeTab === 'details' && (
                  <div className="fade-in">
                    <h5 className="fw-bold mb-3">About this property</h5>
                    <p className="text-muted lh-lg">
                      {isGuest 
                        ? property.description?.substring(0, 150) + "..." 
                        : property.description}
                    </p>
                    
                    {isGuest && (
                      <div className="bg-primary-subtle rounded-4 p-4 mt-4 border border-primary border-opacity-10">
                        <div className="d-flex gap-3">
                          <div className="bg-primary text-white rounded-circle p-2 flex-shrink-0" style={{ height: "40px", width: "40px", display: "flex", alignItems: "center", justifyItems: "center" }}>
                            <Lock size={20} className="m-auto" />
                          </div>
                          <div>
                            <h6 className="fw-bold text-primary mb-1">Full Details Locked</h6>
                            <p className="small text-muted mb-3">Create an account or log in to see full description, all images, and contact information.</p>
                            <Link to="/register" className="btn btn-primary btn-sm px-4 fw-bold">Sign Up Free</Link>
                          </div>
                        </div>
                      </div>
                    )}

                    {!isGuest && (
                      <div className="row g-3 mt-4">
                        <div className="col-md-4">
                          <div className="bg-light rounded-3 p-3 text-center h-100">
                            <Clock size={24} className="text-primary mb-2" />
                            <div className="small text-muted">Campus Walk</div>
                            <div className="fw-bold">{property.distance_from_campus_minutes} mins</div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="bg-light rounded-3 p-3 text-center h-100">
                            <Layout size={24} className="text-primary mb-2" />
                            <div className="small text-muted">Room Type</div>
                            <div className="fw-bold">{getRoomTypeLabel(property.room_type)}</div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="bg-light rounded-3 p-3 text-center h-100">
                            <Users size={24} className="text-primary mb-2" />
                            <div className="small text-muted">Capacity</div>
                            <div className="fw-bold">{property.total_bedspaces} Bedspaces</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'amenities' && (
                  <div className="fade-in">
                    <h5 className="fw-bold mb-4">Available Amenities</h5>
                    {property.amenities && property.amenities.length > 0 ? (
                      <div className="row g-3">
                        {property.amenities.map((amenity, index) => (
                          <div key={index} className="col-md-6">
                            <div className="d-flex align-items-center gap-3 p-2 bg-light rounded-3">
                              <div className="bg-success-subtle text-success rounded-circle p-1">
                                <Check size={16} />
                              </div>
                              <span className="fw-medium">{amenity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted italic">No amenities listed for this property.</p>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="fade-in">
                    <ReviewSection
                      propertyId={property.id}
                      reviews={property.reviews || []}
                      averageRating={property.average_rating || 0}
                      reviewCount={property.review_count || 0}
                      onReviewAdded={fetchProperty}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Image Gallery (Only for Logged In Users) */}
            {!isGuest && property.images?.length > 1 && (
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <h5 className="fw-bold mb-4">Property Gallery</h5>
                <div className="row g-3">
                  {property.images.map((img, idx) => (
                    <div key={idx} className="col-md-4 col-6">
                      <div className="ratio ratio-4x3 rounded-3 overflow-hidden shadow-sm hover-scale transition-all cursor-pointer">
                        <img src={img} alt={`Gallery ${idx}`} className="object-fit-cover" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden sticky-top" style={{ top: "100px" }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <span className="display-6 fw-bold text-primary">K{Number(property.price).toLocaleString()}</span>
                    <span className="text-muted">/month</span>
                  </div>
                  <button 
                    onClick={handleFavorite}
                    className="btn btn-outline-danger rounded-circle p-2"
                    style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <Heart size={20} />
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted small fw-medium">Availability</span>
                    <span className={`fw-bold ${property.available_bedspaces > 0 ? 'text-success' : 'text-danger'}`}>
                      {property.available_bedspaces > 0 ? `${property.available_bedspaces} Beds` : 'Full'}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted small fw-medium">Room Type</span>
                    <span className="fw-bold">{getRoomTypeLabel(property.room_type)}</span>
                  </div>
                  {!isGuest && (
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-muted small fw-medium">Distance</span>
                      <span className="fw-bold">{property.distance_from_campus_minutes} min walk</span>
                    </div>
                  )}
                </div>

                {isGuest ? (
                  <div className="text-center">
                    <Link to="/login" className="btn btn-primary btn-lg w-100 py-3 fw-bold shadow-sm mb-3">
                      Login to Contact Landlord
                    </Link>
                    <p className="small text-muted">Create an account to see phone number and WhatsApp contact info.</p>
                  </div>
                ) : (
                  <div className="fade-in">
                    <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-3">
                      <div className="bg-primary text-white rounded-circle p-2">
                        <UserIcon size={24} />
                      </div>
                      <div>
                        <div className="small text-muted">Listed By</div>
                        <div className="fw-bold">{property.landlord?.business_name || property.landlord?.name}</div>
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      {property.phone_number && (
                        <a href={`tel:${property.phone_number}`} className="btn btn-outline-dark btn-lg py-3 fw-bold d-flex align-items-center justify-content-center gap-2">
                          <Phone size={20} /> Call Landlord
                        </a>
                      )}
                      {property.whatsapp_number && (
                        <a 
                          href={`https://wa.me/${property.whatsapp_number.replace(/\D/g, "")}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn btn-success btn-lg py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                        >
                          <MessageSquare size={20} /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
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
