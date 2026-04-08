import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tabs,
  Tab
} from "@nextui-org/react";
import { useAuthStore } from "../stores/authStore.ts";
import { apiClient } from "../lib/api.ts";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [compounds, setCompounds] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("properties");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, propertiesRes, statsRes, compoundsRes, reviewsRes] = await Promise.all([
        apiClient.get("/admin/users"),
        apiClient.get("/admin/properties"),
        apiClient.get("/admin/stats"),
        apiClient.get("/admin/compounds"),
        apiClient.get("/admin/reviews")
      ]);

      setUsers(usersRes);
      setProperties(propertiesRes);
      setStats(statsRes);
      setCompounds(compoundsRes);
      setReviews(reviewsRes);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      navigate("/");
      return;
    }

    fetchData();
  }, [user, navigate]);

  const handleUserRoleChange = async (userId, nextRole) => {
    try {
      await apiClient.put(`/admin/users/${userId}`, { role: nextRole });
      fetchData();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleUserBanToggle = async (userId, banned) => {
    try {
      await apiClient.patch(`/admin/users/${userId}/ban`, { banned });
      fetchData();
    } catch (error) {
      console.error("Error updating user ban status:", error);
    }
  };

  const handlePropertyApproval = async (propertyId, approved) => {
    try {
      await apiClient.put(`/admin/properties/${propertyId}`, { approved });
      fetchData();
    } catch (error) {
      console.error("Error updating property:", error);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm("Delete this property?")) return;
    try {
      await apiClient.delete(`/admin/properties/${propertyId}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  const handleOccupancyChange = async (propertyId, action) => {
    try {
      await apiClient.patch(`/admin/properties/${propertyId}/occupancy`, { action });
      fetchData();
    } catch (error) {
      console.error("Error updating occupancy:", error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await apiClient.delete(`/admin/reviews/${reviewId}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleDeleteCompound = async (compoundId) => {
    if (!window.confirm("Delete this compound and its related buildings?")) return;
    try {
      await apiClient.delete(`/admin/compounds/${compoundId}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting compound:", error);
    }
  };

  if (!user || user.role !== "admin") {
    return <div className="text-center mt-16 text-gray-600">Access denied</div>;
  }

  if (loading) {
    return <div className="text-center mt-16 text-gray-600">Loading admin dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-slate-300 mt-1">Manage users, listing approvals, and platform operations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardBody><p className="text-sm text-gray-500">Total Users</p><p className="text-3xl font-bold text-blue-600">{stats?.totalUsers || 0}</p></CardBody></Card>
          <Card><CardBody><p className="text-sm text-gray-500">Total Properties</p><p className="text-3xl font-bold text-emerald-600">{stats?.totalProperties || 0}</p></CardBody></Card>
          <Card><CardBody><p className="text-sm text-gray-500">Approved</p><p className="text-3xl font-bold text-indigo-600">{stats?.approvedProperties || 0}</p></CardBody></Card>
          <Card><CardBody><p className="text-sm text-gray-500">Avg Price</p><p className="text-3xl font-bold text-amber-600">K{Math.round(stats?.averagePrice || 0)}</p></CardBody></Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardBody><p className="text-sm text-gray-500">Pending Approvals</p><p className="text-3xl font-bold text-orange-600">{stats?.pendingProperties || 0}</p></CardBody></Card>
          <Card><CardBody><p className="text-sm text-gray-500">Total Bookings</p><p className="text-3xl font-bold text-purple-600">{stats?.totalBookings || 0}</p></CardBody></Card>
          <Card><CardBody><p className="text-sm text-gray-500">Revenue (K)</p><p className="text-3xl font-bold text-green-600">{Math.round(stats?.totalRevenue || 0)}</p></CardBody></Card>
        </div>

        <Tabs selectedKey={activeTab} onSelectionChange={setActiveTab}>
          <Tab key="properties" title="Listings">
            <Card><CardBody><Table aria-label="Properties table"><TableHeader><TableColumn>NAME</TableColumn><TableColumn>LANDLORD</TableColumn><TableColumn>PRICE</TableColumn><TableColumn>BEDS</TableColumn><TableColumn>STATUS</TableColumn><TableColumn>ACTIONS</TableColumn></TableHeader><TableBody>{properties.map((property) => (<TableRow key={property.id}><TableCell>{property.name}</TableCell><TableCell>{property.landlord?.name || "Unknown"}</TableCell><TableCell>K{property.price}</TableCell><TableCell>{property.occupied_beds}/{property.total_beds}</TableCell><TableCell><Chip color={property.approved ? "success" : "warning"} variant="flat">{property.approved ? "Approved" : "Pending"}</Chip></TableCell><TableCell><div className="flex gap-2"><Button size="sm" color={property.approved ? "warning" : "success"} onClick={() => handlePropertyApproval(property.id, !property.approved)}>{property.approved ? "Mark Unapproved" : "Approve"}</Button><Button size="sm" onClick={() => handleOccupancyChange(property.id, "decrement")}>-1 Bed</Button><Button size="sm" onClick={() => handleOccupancyChange(property.id, "increment")}>+1 Bed</Button><Button size="sm" color="danger" onClick={() => handleDeleteProperty(property.id)}>Delete</Button></div></TableCell></TableRow>))}</TableBody></Table></CardBody></Card>
          </Tab>
          <Tab key="reviews" title="Reviews">
            <Card><CardBody><Table aria-label="Reviews table"><TableHeader><TableColumn>USER</TableColumn><TableColumn>PROPERTY</TableColumn><TableColumn>RATING</TableColumn><TableColumn>COMMENT</TableColumn><TableColumn>DATE</TableColumn><TableColumn>ACTIONS</TableColumn></TableHeader><TableBody>{reviews.map((review) => (<TableRow key={review.id}><TableCell>{review.user?.name || "Unknown"}</TableCell><TableCell>{review.listing?.name || "Unknown"}</TableCell><TableCell><div className="flex items-center gap-1"><span className="font-semibold">{review.rating}</span><span className="text-yellow-400">*</span></div></TableCell><TableCell className="max-w-xs truncate">{review.comment}</TableCell><TableCell>{new Date(review.created_at).toLocaleDateString()}</TableCell><TableCell><Button size="sm" color="danger" onClick={() => handleDeleteReview(review.id)}>Delete</Button></TableCell></TableRow>))}</TableBody></Table></CardBody></Card>
          </Tab>
          <Tab key="users" title="Users">
            <Card><CardBody><Table aria-label="Users table"><TableHeader><TableColumn>NAME</TableColumn><TableColumn>EMAIL</TableColumn><TableColumn>ROLE</TableColumn><TableColumn>STATUS</TableColumn><TableColumn>ACTIONS</TableColumn></TableHeader><TableBody>{users.map((entry) => (<TableRow key={entry.id}><TableCell>{entry.name}</TableCell><TableCell>{entry.email}</TableCell><TableCell><Chip color={entry.role === "admin" ? "danger" : entry.role === "landlord" ? "warning" : "primary"} variant="flat">{entry.role}</Chip></TableCell><TableCell><Chip color={entry.is_banned ? "danger" : "success"} variant="flat">{entry.is_banned ? "Banned" : "Active"}</Chip></TableCell><TableCell><div className="flex gap-2">{entry.role !== "admin" && (<Button size="sm" color="primary" onClick={() => handleUserRoleChange(entry.id, entry.role === "landlord" ? "student" : "landlord")}>{entry.role === "landlord" ? "Make Student" : "Make Landlord"}</Button>)}{entry.role !== "admin" && (<Button size="sm" color={entry.is_banned ? "success" : "danger"} onClick={() => handleUserBanToggle(entry.id, !entry.is_banned)}>{entry.is_banned ? "Unban" : "Ban"}</Button>)}</div></TableCell></TableRow>))}</TableBody></Table></CardBody></Card>
          </Tab>
          <Tab key="compounds" title="Compounds">
            <Card><CardBody><Table aria-label="Compounds table"><TableHeader><TableColumn>NAME</TableColumn><TableColumn>LOCATION</TableColumn><TableColumn>LANDLORD</TableColumn><TableColumn>BUILDINGS</TableColumn><TableColumn>ACTIONS</TableColumn></TableHeader><TableBody>{compounds.map((compound) => (<TableRow key={compound.id}><TableCell>{compound.name}</TableCell><TableCell>{compound.location || "N/A"}</TableCell><TableCell>{compound.landlord?.name || "Unknown"}</TableCell><TableCell>{compound.buildings?.length || 0}</TableCell><TableCell><Button size="sm" color="danger" onClick={() => handleDeleteCompound(compound.id)}>Delete</Button></TableCell></TableRow>))}</TableBody></Table></CardBody></Card>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
