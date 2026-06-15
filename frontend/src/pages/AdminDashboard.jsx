import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, Building2, Clock, CheckCircle, XCircle, 
  ShieldCheck, ShieldAlert, BarChart3, FileText, Trash2
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { api } from "../services/api";

function AdminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingLandlords, setPendingLandlords] = useState([]);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
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
      const [statsData, pendingLData, pendingPData, usersData] = await Promise.all([
        api.getAdminStats(),
        api.getPendingLandlords(),
        api.getPendingProperties(),
        api.getAdminUsers()
      ]);
      setStats(statsData);
      setPendingLandlords(pendingLData);
      setPendingProperties(pendingPData);
      setAllUsers(usersData);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLandlord = async (id) => {
    try {
      await api.approveLandlord(id);
      fetchData();
    } catch (error) {
      alert("Failed to approve landlord: " + error.message);
    }
  };

  const handleRejectLandlord = async (id) => {
    const reason = prompt("Enter rejection reason (optional):");
    if (reason === null) return;
    try {
      await api.rejectLandlord(id, reason);
      fetchData();
    } catch (error) {
      alert("Failed to reject landlord: " + error.message);
    }
  };

  const handleApproveProperty = async (id) => {
    try {
      await api.approveProperty(id);
      fetchData();
    } catch (error) {
      alert("Failed to approve property: " + error.message);
    }
  };

  const handleRejectProperty = async (id) => {
    const reason = prompt("Enter rejection reason (optional):");
    if (reason === null) return;
    try {
      await api.rejectProperty(id, reason);
      fetchData();
    } catch (error) {
      alert("Failed to reject property: " + error.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure? This will delete the user and all their data.")) return;
    try {
      await api.deleteUser(id);
      fetchData();
    } catch (error) {
      alert("Failed to delete user: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="fade-in bg-light min-h-screen">
      {/* Header */}
      <section className="bg-dark text-white py-4 mb-4 shadow-sm">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary p-2 rounded-3">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h1 className="h3 fw-bold mb-0">Admin Control Center</h1>
                <p className="mb-0 text-white-50 small">System-wide management & verification</p>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Link to="/landlord" className="btn btn-outline-light btn-sm">
                Landlord View
              </Link>
              <Link to="/" className="btn btn-primary btn-sm">
                Main Site
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="container mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 h-100">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted small fw-bold mb-1 uppercase">Total Users</p>
                  <h3 className="fw-bold mb-0">{stats?.totalUsers || 0}</h3>
                </div>
                <div className="bg-primary-subtle p-2 rounded-2 text-primary">
                  <Users size={20} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 h-100">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted small fw-bold mb-1 uppercase">Total Properties</p>
                  <h3 className="fw-bold mb-0">{stats?.totalProperties || 0}</h3>
                </div>
                <div className="bg-success-subtle p-2 rounded-2 text-success">
                  <Building2 size={20} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 h-100">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted small fw-bold mb-1 uppercase">Pending Approval</p>
                  <h3 className="fw-bold mb-0">{stats?.pendingProperties || 0}</h3>
                </div>
                <div className="bg-warning-subtle p-2 rounded-2 text-warning">
                  <Clock size={20} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 h-100">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted small fw-bold mb-1 uppercase">Pending Landlords</p>
                  <h3 className="fw-bold mb-0">{stats?.pendingLandlords || 0}</h3>
                </div>
                <div className="bg-info-subtle p-2 rounded-2 text-info">
                  <ShieldAlert size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container pb-5">
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 p-0">
            <ul className="nav nav-tabs px-4 pt-3">
              <li className="nav-item">
                <button 
                  className={`nav-link border-0 px-4 py-3 fw-semibold ${activeTab === "overview" ? "active text-primary border-bottom border-primary border-3" : "text-muted"}`}
                  onClick={() => setActiveTab("overview")}
                >
                  <BarChart3 size={18} className="me-2" /> Overview
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link border-0 px-4 py-3 fw-semibold ${activeTab === "landlords" ? "active text-primary border-bottom border-primary border-3" : "text-muted"}`}
                  onClick={() => setActiveTab("landlords")}
                >
                  <ShieldAlert size={18} className="me-2" /> Landlord Queue ({pendingLandlords.length})
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link border-0 px-4 py-3 fw-semibold ${activeTab === "properties" ? "active text-primary border-bottom border-primary border-3" : "text-muted"}`}
                  onClick={() => setActiveTab("properties")}
                >
                  <Clock size={18} className="me-2" /> Property Queue ({pendingProperties.length})
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link border-0 px-4 py-3 fw-semibold ${activeTab === "users" ? "active text-primary border-bottom border-primary border-3" : "text-muted"}`}
                  onClick={() => setActiveTab("users")}
                >
                  <Users size={18} className="me-2" /> User Management
                </button>
              </li>
            </ul>
          </div>

          <div className="card-body p-4">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="row g-4">
                <div className="col-md-6">
                  <h5 className="fw-bold mb-3">User Distribution</h5>
                  <div className="list-group list-group-flush border rounded-3">
                    {stats?.usersByRole?.map((item) => (
                      <div key={item.role} className="list-group-item d-flex justify-content-between align-items-center py-3">
                        <span className="text-capitalize fw-semibold">{item.role}s</span>
                        <span className="badge bg-primary rounded-pill">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-md-6">
                  <h5 className="fw-bold mb-3">System Health</h5>
                  <div className="card bg-primary text-white border-0 p-4 mb-3">
                    <h2 className="display-6 fw-bold mb-1">K{Number(stats?.averagePrice || 0).toLocaleString()}</h2>
                    <p className="mb-0 opacity-75">Average Property Price</p>
                  </div>
                  <div className="card bg-success text-white border-0 p-4">
                    <h2 className="display-6 fw-bold mb-1">{stats?.activeLandlords || 0}</h2>
                    <p className="mb-0 opacity-75">Verified Active Landlords</p>
                  </div>
                </div>
              </div>
            )}

            {/* Landlord Verification Queue */}
            {activeTab === "landlords" && (
              <div className="table-responsive">
                {pendingLandlords.length === 0 ? (
                  <div className="text-center py-5">
                    <CheckCircle size={48} className="text-success mb-3" />
                    <h5 className="fw-bold">No Pending Landlords</h5>
                    <p className="text-muted">All landlord applications have been processed.</p>
                  </div>
                ) : (
                  <table className="table align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Landlord / Business</th>
                        <th>Contact Info</th>
                        <th>Documents (NRC)</th>
                        <th>Registration Date</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingLandlords.map((l) => (
                        <tr key={l.id}>
                          <td>
                            <div className="fw-bold">{l.name}</div>
                            <div className="small text-muted">{l.business_name || "No Business Name"}</div>
                          </td>
                          <td>
                            <div className="small">{l.email}</div>
                            <div className="small">{l.phone}</div>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              {l.nrc_front_url && (
                                <a href={l.nrc_front_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary px-2 py-1 small">Front</a>
                              )}
                              {l.nrc_back_url && (
                                <a href={l.nrc_back_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary px-2 py-1 small">Back</a>
                              )}
                              {!l.nrc_front_url && !l.nrc_back_url && <span className="text-danger small">No Documents</span>}
                            </div>
                          </td>
                          <td className="small text-muted">
                            {new Date(l.created_at).toLocaleDateString()}
                          </td>
                          <td className="text-end">
                            <div className="d-flex gap-2 justify-content-end">
                              <button onClick={() => handleApproveLandlord(l.id)} className="btn btn-sm btn-success d-flex align-items-center gap-1">
                                <CheckCircle size={14} /> Approve
                              </button>
                              <button onClick={() => handleRejectLandlord(l.id)} className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1">
                                <XCircle size={14} /> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Property Approval Queue */}
            {activeTab === "properties" && (
              <div className="table-responsive">
                {pendingProperties.length === 0 ? (
                  <div className="text-center py-5">
                    <CheckCircle size={48} className="text-success mb-3" />
                    <h5 className="fw-bold">No Pending Properties</h5>
                    <p className="text-muted">All property listings have been reviewed.</p>
                  </div>
                ) : (
                  <table className="table align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Property Details</th>
                        <th>Landlord Info</th>
                        <th>Price & Location</th>
                        <th>Images</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingProperties.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <div className="fw-bold">{p.name}</div>
                            <div className="small text-muted">{p.room_type}</div>
                          </td>
                          <td>
                            <div className="small fw-semibold">{p.landlord?.name}</div>
                            <div className="small text-muted">{p.landlord?.business_name}</div>
                          </td>
                          <td>
                            <div className="small fw-bold text-primary">K{Number(p.price).toLocaleString()}</div>
                            <div className="small text-muted">{p.location}</div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">{p.images?.length || 0} photos</span>
                          </td>
                          <td className="text-end">
                            <div className="d-flex gap-2 justify-content-end">
                              <Link to={`/property/${p.id}`} className="btn btn-sm btn-outline-dark">
                                <FileText size={14} /> View
                              </Link>
                              <button onClick={() => handleApproveProperty(p.id)} className="btn btn-sm btn-success">
                                Approve
                              </button>
                              <button onClick={() => handleRejectProperty(p.id)} className="btn btn-sm btn-outline-danger">
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* User Management Tab */}
            {activeTab === "users" && (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="fw-bold">{u.name}</div>
                          <div className="small text-muted">{u.email}</div>
                        </td>
                        <td>
                          <span className={`badge rounded-pill ${
                            u.role === 'admin' ? 'bg-dark' : u.role === 'landlord' ? 'bg-primary' : 'bg-info'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span className={`badge rounded-pill ${
                            u.status === 'active' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="text-end">
                          <button 
                            onClick={() => handleDeleteUser(u.id)} 
                            className="btn btn-sm btn-outline-danger"
                            disabled={u.role === 'admin'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
