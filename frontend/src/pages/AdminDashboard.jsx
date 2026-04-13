import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { api } from "../services/api";

function AdminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, propertiesData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminProperties()
      ]);
      setStats(statsData);
      setUsers(usersData);
      setProperties(propertiesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      fetchData();
    } catch (error) {
      alert("Failed to update role");
    }
  };

  const handleBanUser = async (userId, ban) => {
    if (!window.confirm(`Are you sure you want to ${ban ? "ban" : "unban"} this user?`)) {
      return;
    }
    try {
      await api.banUser(userId, ban);
      fetchData();
    } catch (error) {
      alert("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure? This will delete the user and all their properties.")) {
      return;
    }
    try {
      await api.deleteUser(userId);
      fetchData();
    } catch (error) {
      alert("Failed to delete user");
    }
  };

  const handleApproveProperty = async (propertyId, approved) => {
    try {
      await api.approveProperty(propertyId, approved);
      fetchData();
    } catch (error) {
      alert("Failed to update property");
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }
    try {
      await api.deletePropertyAdmin(propertyId);
      fetchData();
    } catch (error) {
      alert("Failed to delete property");
    }
  };

  const getStatusBadge = (user) => {
    if (user.is_banned) {
      return <span className="badge bg-danger">Disabled</span>;
    }
    if (user.role === "pending" || !user.is_verified) {
      return <span className="badge bg-warning">Pending</span>;
    }
    return <span className="badge bg-success">Active</span>;
  };

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
      <section className="bg-dark text-white py-4 mb-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-6 fw-bold mb-1">Admin Dashboard</h1>
              <p className="mb-0 opacity-75">System overview and management</p>
            </div>
            <div>
              <Link to="/landlord" className="btn btn-outline-light me-2">
                Landlord Dashboard
              </Link>
              <Link to="/" className="btn btn-light">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <div className="card dashboard-card p-3 text-center">
              <h3 className="fw-bold text-primary mb-1">{stats?.totalUsers || 0}</h3>
              <p className="text-muted mb-0">Total Users</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card dashboard-card p-3 text-center">
              <h3 className="fw-bold text-success mb-1">{stats?.totalProperties || 0}</h3>
              <p className="text-muted mb-0">Total Properties</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card dashboard-card p-3 text-center">
              <h3 className="fw-bold text-warning mb-1">{stats?.pendingProperties || 0}</h3>
              <p className="text-muted mb-0">Pending Approval</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card dashboard-card p-3 text-center">
              <h3 className="fw-bold text-info mb-1">{stats?.approvedProperties || 0}</h3>
              <p className="text-muted mb-0">Approved</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="container">
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              Users ({users.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "properties" ? "active" : ""}`}
              onClick={() => setActiveTab("properties")}
            >
              Properties ({properties.length})
            </button>
          </li>
        </ul>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.name}</strong>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                        disabled={user.role === "admin"}
                        style={{ width: "auto" }}
                      >
                        <option value="student">Student</option>
                        <option value="landlord">Landlord</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{getStatusBadge(user)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        {user.role !== "admin" && (
                          <>
                            <button
                              className={`btn btn-sm ${
                                user.is_banned ? "btn-outline-success" : "btn-outline-danger"
                              }`}
                              onClick={() => handleBanUser(user.id, !user.is_banned)}
                            >
                              {user.is_banned ? "Unban" : "Ban"}
                            </button>
                            <button
                              className="btn btn-sm btn-outline-dark"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === "properties" && (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Landlord</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id}>
                    <td>
                      <strong>{property.name}</strong>
                    </td>
                    <td>{property.landlord?.name || "Unknown"}</td>
                    <td>{property.location}</td>
                    <td>K{Number(property.price).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${
                        property.approved ? "bg-success" : "bg-warning"
                      }`}>
                        {property.approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        {!property.approved && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleApproveProperty(property.id, true)}
                          >
                            Approve
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteProperty(property.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card dashboard-card p-4">
                <h5 className="fw-bold mb-3">Users by Role</h5>
                {stats?.usersByRole?.map((item) => (
                  <div key={item.role} className="d-flex justify-content-between mb-2">
                    <span className="text-capitalize">{item.role}</span>
                    <span className="badge bg-primary">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-md-6">
              <div className="card dashboard-card p-4">
                <h5 className="fw-bold mb-3">Average Price</h5>
                <h2 className="text-primary">
                  K{Number(stats?.averagePrice || 0).toLocaleString()}
                </h2>
                <p className="text-muted mb-0">Average property price</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
