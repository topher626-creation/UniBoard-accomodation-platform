import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Plus, MapPin, MoreVertical, ShieldCheck, ShieldAlert, Users, Bed } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { api } from "../services/api";

function LandlordDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (user.role !== "landlord" && user.role !== "admin")) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const propsData = await api.getMyProperties();
      setProperties(propsData);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    
    try {
      await api.deleteProperty(id);
      setProperties(properties.filter(p => p.id !== id));
    } catch {
      alert("Failed to delete property");
    }
  };

  const totalBedspaces = properties.reduce((sum, p) => sum + (p.total_bedspaces || 0), 0);
  const occupiedBedspaces = properties.reduce((sum, p) => sum + (p.occupied_bedspaces || 0), 0);
  const availableBedspaces = totalBedspaces - occupiedBedspaces;

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <section className="bg-primary text-white py-4 mb-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-6 fw-bold mb-1">Landlord Dashboard</h1>
              <p className="mb-0 opacity-75">
                {user?.business_name ? `${user.business_name} | ` : ""}
                Welcome back, {user?.name}
              </p>
            </div>
            <div className="d-flex gap-2">
              {user?.role === "admin" && (
                <Link to="/admin" className="btn btn-light">
                  Admin Panel
                </Link>
              )}
              <Link to="/create-listing" className={`btn btn-light ${user?.status !== "active" && user?.role !== "admin" ? "disabled" : ""}`}>
                + New Property
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Status Banner */}
      {user?.role === "landlord" && (
        <section className="container mb-4">
          {user?.status === "pending" ? (
            <div className="alert alert-warning d-flex align-items-center gap-3">
              <ShieldAlert size={24} className="text-warning" />
              <div>
                <h5 className="alert-heading mb-1 fw-bold">Account Verification Pending</h5>
                <p className="mb-0">Your landlord account is currently being reviewed by our admin team. You will be notified once your account is verified. Property creation is currently locked.</p>
              </div>
            </div>
          ) : user?.status === "active" ? (
            <div className="alert alert-success d-flex align-items-center gap-3">
              <ShieldCheck size={24} className="text-success" />
              <div>
                <h5 className="alert-heading mb-1 fw-bold">Verified Landlord</h5>
                <p className="mb-0">Your account is fully verified. You can now create and manage your property listings.</p>
              </div>
            </div>
          ) : null}
        </section>
      )}

      {/* Stats Overview */}
      <section className="container mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <div className="card dashboard-card p-3 text-center border-0 shadow-sm">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <Building2 size={24} className="text-primary me-2" />
                <h3 className="fw-bold text-primary mb-0">{properties.length}</h3>
              </div>
              <p className="text-muted mb-0 small uppercase fw-semibold tracking-wider">Total Properties</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card dashboard-card p-3 text-center border-0 shadow-sm">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <Users size={24} className="text-info me-2" />
                <h3 className="fw-bold text-info mb-0">{totalBedspaces}</h3>
              </div>
              <p className="text-muted mb-0 small uppercase fw-semibold tracking-wider">Total Bedspaces</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card dashboard-card p-3 text-center border-0 shadow-sm">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <Bed size={24} className="text-success me-2" />
                <h3 className="fw-bold text-success mb-0">{occupiedBedspaces}</h3>
              </div>
              <p className="text-muted mb-0 small uppercase fw-semibold tracking-wider">Occupied Bedspaces</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card dashboard-card p-3 text-center border-0 shadow-sm">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <Plus size={24} className="text-warning me-2" />
                <h3 className="fw-bold text-warning mb-0">{availableBedspaces}</h3>
              </div>
              <p className="text-muted mb-0 small uppercase fw-semibold tracking-wider">Available Bedspaces</p>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="container mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h4 fw-bold mb-0">My Properties</h2>
          <div className="text-muted small">
            Showing {properties.length} listings
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-3 shadow-sm border">
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-primary mb-3" style={{ width: 80, height: 80 }}>
              <Building2 size={40} aria-hidden />
            </div>
            <h4 className="fw-bold">No properties listed yet</h4>
            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: "400px" }}>
              Ready to start hosting students? Create your first property listing to get started.
            </p>
            <Link 
              to="/create-listing" 
              className={`btn btn-primary px-4 ${user?.status !== "active" && user?.role !== "admin" ? "disabled" : ""}`}
            >
              + Create First Listing
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {properties.map((property) => (
              <div key={property.id} className="col-md-6 col-lg-4">
                <div className="card dashboard-card h-100 border-0 shadow-sm overflow-hidden">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <span className={`badge px-3 py-2 rounded-pill ${
                        property.approved ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"
                      }`}>
                        {property.approved ? "Approved" : "Awaiting Approval"}
                      </span>
                      <div className="dropdown">
                        <button
                          type="button"
                          className="btn btn-sm btn-light rounded-circle p-2"
                          data-bs-toggle="dropdown"
                          aria-label="Property actions"
                        >
                          <MoreVertical size={18} />
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                          <li>
                            <Link to={`/property/${property.id}`} className="dropdown-item py-2">
                              View Details
                            </Link>
                          </li>
                          <li>
                            <Link to={`/edit-property/${property.id}`} className="dropdown-item py-2">
                              Edit Property
                            </Link>
                          </li>
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <button
                              className="dropdown-item text-danger py-2"
                              onClick={() => handleDeleteProperty(property.id)}
                            >
                              Delete Property
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <h5 className="card-title fw-bold mb-2">{property.name}</h5>
                    <p className="text-muted small mb-3 d-flex align-items-start gap-2">
                      <MapPin size={16} className="text-primary flex-shrink-0" aria-hidden />
                      <span>{property.location}</span>
                    </p>
                    
                    <div className="border-top pt-3 mt-3 d-flex justify-content-between align-items-center">
                      <div>
                        <p className="text-muted small mb-0">Monthly Rent</p>
                        <span className="fw-bold text-primary h5 mb-0">
                          K{Number(property.price).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-end">
                        <p className="text-muted small mb-0">Availability</p>
                        <span className={`fw-semibold ${property.available_bedspaces > 0 ? "text-success" : "text-danger"}`}>
                          {property.available_bedspaces} / {property.total_bedspaces} free
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Quick Add Card */}
            {(user?.status === "active" || user?.role === "admin") && (
              <div className="col-md-6 col-lg-4">
                <Link to="/create-listing" className="text-decoration-none h-100 d-block">
                  <div className="card dashboard-card h-100 d-flex align-items-center justify-content-center border-2 border-dashed border-primary-subtle bg-primary-subtle bg-opacity-10" style={{ minHeight: "220px" }}>
                    <div className="text-center text-primary p-4">
                      <div className="bg-primary text-white rounded-circle d-inline-flex p-3 mb-3">
                        <Plus size={32} />
                      </div>
                      <h5 className="fw-bold mb-1">Add New Property</h5>
                      <p className="small mb-0 opacity-75">Expand your student housing portfolio</p>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default LandlordDashboard;
