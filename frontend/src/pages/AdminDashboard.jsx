import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Tabs, Tab } from "@nextui-org/react";
import { useAuthStore } from "../stores/authStore.ts";
import { apiClient } from "../lib/api.ts";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("properties");

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
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, propertiesRes, statsRes] = await Promise.all([
        apiClient.get("/admin/users"),
        apiClient.get("/admin/properties"),
        apiClient.get("/admin/stats")
      ]);

      setUsers(usersRes);
      setProperties(propertiesRes);
      setStats(statsRes);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserRoleChange = async (userId, nextRole) => {
    try {
      await apiClient.put(`/admin/users/${userId}`, { role: nextRole });
      fetchData();
    } catch (error) {
      console.error("Error updating user:", error);
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

  if (!user || user.role !== "admin") {
    return <div className="text-center mt-16 text-gray-600">Access denied</div>;
  }

  if (loading) {
    return <div className="text-center mt-16 text-gray-600">Loading admin dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage users, approvals, and platform operations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardBody><p className="text-sm text-gray-500">Total Users</p><p className="text-3xl font-bold text-blue-600">{stats?.totalUsers || 0}</p></CardBody></Card>
          <Card><CardBody><p className="text-sm text-gray-500">Total Properties</p><p className="text-3xl font-bold text-emerald-600">{stats?.totalProperties || 0}</p></CardBody></Card>
          <Card><CardBody><p className="text-sm text-gray-500">Approved</p><p className="text-3xl font-bold text-indigo-600">{stats?.approvedProperties || 0}</p></CardBody></Card>
          <Card><CardBody><p className="text-sm text-gray-500">Avg Price</p><p className="text-3xl font-bold text-amber-600">K{Math.round(stats?.averagePrice || 0)}</p></CardBody></Card>
        </div>

        <Tabs selectedKey={activeTab} onSelectionChange={setActiveTab}>
          <Tab key="properties" title="Properties">
            <Card>
              <CardBody>
                <Table aria-label="Properties table">
                  <TableHeader>
                    <TableColumn>NAME</TableColumn>
                    <TableColumn>LANDLORD</TableColumn>
                    <TableColumn>PRICE</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell>{property.name}</TableCell>
                        <TableCell>{property.landlord?.name || "Unknown"}</TableCell>
                        <TableCell>K{property.price}</TableCell>
                        <TableCell>
                          <Chip color={property.approved ? "success" : "warning"} variant="flat">
                            {property.approved ? "Approved" : "Pending"}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" color={property.approved ? "warning" : "success"} onClick={() => handlePropertyApproval(property.id, !property.approved)}>
                              {property.approved ? "Unapprove" : "Approve"}
                            </Button>
                            <Button size="sm" color="danger" onClick={() => handleDeleteProperty(property.id)}>Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="users" title="Users">
            <Card>
              <CardBody>
                <Table aria-label="Users table">
                  <TableHeader>
                    <TableColumn>NAME</TableColumn>
                    <TableColumn>EMAIL</TableColumn>
                    <TableColumn>ROLE</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {users.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.name}</TableCell>
                        <TableCell>{entry.email}</TableCell>
                        <TableCell>
                          <Chip color={entry.role === "admin" ? "danger" : entry.role === "landlord" ? "warning" : "primary"} variant="flat">
                            {entry.role}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {entry.role !== "admin" && (
                              <Button size="sm" color="primary" onClick={() => handleUserRoleChange(entry.id, entry.role === "landlord" ? "student" : "landlord")}>
                                {entry.role === "landlord" ? "Make Student" : "Make Landlord"}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}