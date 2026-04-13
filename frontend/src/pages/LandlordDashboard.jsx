import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, Building2, Plus, ClipboardList, MapPin, MoreVertical } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { api } from "../services/api";

function LandlordDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("properties");

  const MAX_LISTINGS = 3;

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
      const [propsData, bookingsData] = await Promise.all([
        api.getMyProperties(),
        api.getLandlordBookings()
      ]);
      setProperties(propsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching data:", error);
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

  const handleConfirmBooking = async (id) => {
    try {
      await api.confirmBooking(id);
      fetchData();
    } catch {
      alert("Failed to confirm booking");
    }
  };

  const handleRejectBooking = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (reason === null) return;
    
    try {
      await api.rejectBooking(id, reason);
      fetchData();
    } catch {
      alert("Failed to reject booking");
    }
  };

  const pendingBookings = bookings.filter(b => b.status === "pending");
  const confirmedBookings = bookings.filter(b => b.status === "confirmed");

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
              <p className="mb-0 opacity-75">Welcome back, {user?.business_name || user?.name}</p>
            </div>
            <div>
              {user?.role === "admin" && (
                <Link to="/admin" className="btn btn-light me-2">
                  Admin Panel
                </Link>
              )}
              <Link to="/create-listing" className="btn btn-light">
                + New Listing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {user?.role === "landlord" && user?.status === "pending" && (
        <section className="container mb-4">
          <div className="alert alert-warning">
            Your landlord account is waiting for admin approval. You can review your dashboard, but listing creation stays locked until approval.
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="container mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="card dashboard-card p-3 text-center">
              <h3 className="fw-bold text-primary mb-1">{properties.length}</h3>
              <p className="text-muted mb-0">Total Properties</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card dashboard-card p-3 text-center">
              <h3 className="fw-bold text-warning mb-1">{pendingBookings.length}</h3>
              <p className="text-muted mb-0">Pending Bookings</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card dashboard-card p-3 text-center">
              <h3 className="fw-bold text-success mb-1">{confirmedBookings.length}</h3>
              <p className="text-muted mb-0">Confirmed Bookings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Property Limit Warning */}
      {properties.length >= MAX_LISTINGS && (
        <section className="container mb-4">
          <div className="alert alert-warning d-flex align-items-center">
            <AlertTriangle size={22} className="me-3 flex-shrink-0" aria-hidden />
            <div>
              <strong>Maximum {MAX_LISTINGS} listings reached.</strong>
              {" "}Remove one property to add another.
            </div>
          </div>
        </section>
      )}

      {/* Tabs */}
      <section className="container">
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "properties" ? "active" : ""}`}
              onClick={() => setActiveTab("properties")}
            >
              My Properties ({properties.length}/{MAX_LISTINGS})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "bookings" ? "active" : ""}`}
              onClick={() => setActiveTab("bookings")}
            >
              Bookings ({bookings.length})
            </button>
          </li>
        </ul>

        {/* Properties Tab */}
        {activeTab === "properties" && (
          <div>
            {properties.length === 0 ? (
              <div className="text-center py-5">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-primary mb-2" style={{ width: 72, height: 72 }}>
                  <Building2 size={36} aria-hidden />
                </div>
                <h4 className="mt-3">No properties yet</h4>
                <p className="text-muted mb-3">
                  Start by creating your first listing
                </p>
                <Link to="/create-listing" className="btn btn-primary">
                  Create Listing
                </Link>
              </div>
            ) : (
              <div className="row g-3">
                {properties.map((property) => (
                  <div key={property.id} className="col-md-6 col-lg-4">
                    <div className="card dashboard-card h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className={`badge ${
                            property.approved ? "bg-success" : "bg-warning"
                          }`}>
                            {property.approved ? "Approved" : "Pending"}
                          </span>
                          <div className="dropdown">
                            <button
                              type="button"
                              className="btn btn-sm btn-link text-muted p-1"
                              data-bs-toggle="dropdown"
                              aria-label="Property actions"
                            >
                              <MoreVertical size={18} />
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                              <li>
                                <Link
                                  to={`/property/${property.id}`}
                                  className="dropdown-item"
                                >
                                  View
                                </Link>
                              </li>
                              <li>
                                <hr className="dropdown-divider" />
                              </li>
                              <li>
                                <button
                                  className="dropdown-item text-danger"
                                  onClick={() => handleDeleteProperty(property.id)}
                                >
                                  Delete
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                        
                        <h5 className="card-title fw-bold">{property.name}</h5>
                        <p className="text-muted small mb-2 d-flex align-items-start gap-1">
                          <MapPin size={14} className="flex-shrink-0 mt-1" aria-hidden />
                          <span>{property.location || property.compound || "Location"}</span>
                        </p>
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold text-primary">
                            K{Number(property.price).toLocaleString()}/mo
                          </span>
                          <span className="text-muted small">
                            {property.available_beds} beds available
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add New Card */}
                {properties.length < MAX_LISTINGS && (
                  <div className="col-md-6 col-lg-4">
                    <Link
                      to={user?.status === "active" || user?.role === "admin" ? "/create-listing" : "#"}
                      className="text-decoration-none"
                      onClick={(event) => {
                        if (user?.role === "landlord" && user?.status !== "active") {
                          event.preventDefault();
                        }
                      }}
                    >
                      <div
                        className="card dashboard-card h-100 d-flex align-items-center justify-content-center"
                        style={{ minHeight: "180px", borderStyle: "dashed" }}
                      >
                        <div className="text-center text-muted d-flex flex-column align-items-center gap-2">
                          <Plus size={32} aria-hidden />
                          <p className="mb-0">Add new property</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div>
            {bookings.length === 0 ? (
              <div className="text-center py-5">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-primary mb-2" style={{ width: 72, height: 72 }}>
                  <ClipboardList size={36} aria-hidden />
                </div>
                <h4 className="mt-3">No bookings yet</h4>
                <p className="text-muted">
                  Bookings from students will appear here
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Property</th>
                      <th>Move-in Date</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <div>
                            <strong>{booking.user?.name || "Student"}</strong>
                            <br />
                            <small className="text-muted">
                              {booking.user?.email}
                            </small>
                          </div>
                        </td>
                        <td>{booking.property?.name}</td>
                        <td>{booking.move_in_date || "-"}</td>
                        <td>{booking.duration_months || 1} month(s)</td>
                        <td>
                          <span className={`badge ${
                            booking.status === "confirmed" ? "bg-success" :
                            booking.status === "pending" ? "bg-warning" :
                            booking.status === "rejected" ? "bg-danger" :
                            "bg-secondary"
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          {booking.status === "pending" && (
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleConfirmBooking(booking.id)}
                              >
                                Confirm
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRejectBooking(booking.id)}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default LandlordDashboard;
