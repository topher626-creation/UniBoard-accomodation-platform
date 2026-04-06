import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Tabs, Tab } from "@nextui-org/react";
import axios from "axios";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("listings");

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
    }
  }, [user]);

  const checkAdminAccess = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      navigate("/");
      return;
    }

    setUser(parsedUser);
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Try to fetch from API, fallback to mock data
      try {
        const usersResponse = await axios.get("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setUsers(usersResponse.data);

        const listingsResponse = await axios.get("http://localhost:5000/api/admin/listings", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setListings(listingsResponse.data);
      } catch (apiError) {
        // Fallback to mock data
        console.log("Using mock data for admin dashboard");
        setUsers([
          {
            _id: "1",
            name: "John Property Manager",
            email: "landlord@uniboard.com",
            role: "landlord",
            createdAt: new Date().toISOString()
          },
          {
            _id: "2",
            name: "Jane Student",
            email: "student@uniboard.com",
            role: "student",
            createdAt: new Date().toISOString()
          },
          {
            _id: "3",
            name: "System Administrator",
            email: "admin@uniboard.com",
            role: "admin",
            createdAt: new Date().toISOString()
          }
        ]);

        setListings([
          {
            _id: "1",
            title: "Cozy Single Room Near UNZA",
            price: 1500,
            location: { general: "Near University of Zambia" },
            availability: true,
            landlord: { name: "John Property Manager" },
            createdAt: new Date().toISOString()
          },
          {
            _id: "2",
            title: "Shared Apartment - Budget Friendly",
            price: 800,
            location: { general: "Near Cavendish University" },
            availability: true,
            landlord: { name: "John Property Manager" },
            createdAt: new Date().toISOString()
          },
          {
            _id: "3",
            title: "Modern Studio Apartment",
            price: 2200,
            location: { general: "Near Lusaka Business Park" },
            availability: false,
            landlord: { name: "John Property Manager" },
            createdAt: new Date().toISOString()
          }
        ]);
      }

    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusChange = async (userId, newRole) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}`, { role: newRole }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleListingStatusChange = async (listingId, availability) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/listings/${listingId}`, { availability }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error updating listing:", error);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/listings/${listingId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error deleting listing:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  if (!user || user.role !== "admin") {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Access denied. Admin privileges required.</div>;
  }

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading admin dashboard...</div>;
  }

  return (
    <div style={{ padding: "40px", maxWidth: "1400px", margin: "auto" }}>
      <div style={{ marginBottom: "30px" }}>
        <h1>🛡️ Admin Dashboard</h1>
        <p>Manage users, listings, and platform content</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <Card>
          <CardBody>
            <h3>Total Users</h3>
            <p style={{ fontSize: "32px", fontWeight: "bold", color: "blue" }}>{users.length}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3>Total Listings</h3>
            <p style={{ fontSize: "32px", fontWeight: "bold", color: "green" }}>{listings.length}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3>Active Listings</h3>
            <p style={{ fontSize: "32px", fontWeight: "bold", color: "orange" }}>
              {listings.filter(l => l.availability).length}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3>Landlords</h3>
            <p style={{ fontSize: "32px", fontWeight: "bold", color: "purple" }}>
              {users.filter(u => u.role === "landlord").length}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs selectedKey={activeTab} onSelectionChange={setActiveTab}>
        <Tab key="listings" title="Property Listings">
          <Card>
            <CardBody>
              <Table aria-label="Listings table">
                <TableHeader>
                  <TableColumn>TITLE</TableColumn>
                  <TableColumn>LANDLORD</TableColumn>
                  <TableColumn>PRICE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {listings.map((listing) => (
                    <TableRow key={listing._id}>
                      <TableCell>
                        <div>
                          <div style={{ fontWeight: "bold" }}>{listing.title}</div>
                          <div style={{ fontSize: "12px", color: "gray" }}>
                            {listing.location?.general}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{listing.landlord?.name || "Unknown"}</TableCell>
                      <TableCell>K{listing.price}/month</TableCell>
                      <TableCell>
                        <Chip
                          color={listing.availability ? "success" : "danger"}
                          variant="flat"
                        >
                          {listing.availability ? "Active" : "Inactive"}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: "flex", gap: "5px" }}>
                          <Button
                            size="sm"
                            color={listing.availability ? "warning" : "success"}
                            onClick={() => handleListingStatusChange(listing._id, !listing.availability)}
                          >
                            {listing.availability ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            onClick={() => handleDeleteListing(listing._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="users" title="User Management">
          <Card>
            <CardBody>
              <Table aria-label="Users table">
                <TableHeader>
                  <TableColumn>NAME</TableColumn>
                  <TableColumn>EMAIL</TableColumn>
                  <TableColumn>ROLE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {users.map((userData) => (
                    <TableRow key={userData._id}>
                      <TableCell>{userData.name}</TableCell>
                      <TableCell>{userData.email}</TableCell>
                      <TableCell>
                        <Chip
                          color={
                            userData.role === "admin" ? "danger" :
                            userData.role === "landlord" ? "warning" : "primary"
                          }
                          variant="flat"
                        >
                          {userData.role}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip color="success" variant="flat">
                          Active
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: "flex", gap: "5px" }}>
                          {userData.role !== "admin" && (
                            <>
                              <Button
                                size="sm"
                                color="primary"
                                onClick={() => handleUserStatusChange(userData._id,
                                  userData.role === "landlord" ? "student" : "landlord"
                                )}
                              >
                                {userData.role === "landlord" ? "Make Student" : "Make Landlord"}
                              </Button>
                              <Button
                                size="sm"
                                color="danger"
                                onClick={() => handleDeleteUser(userData._id)}
                              >
                                Delete
                              </Button>
                            </>
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

        <Tab key="analytics" title="Analytics">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            <Card>
              <CardBody>
                <h3>Platform Overview</h3>
                <div style={{ marginTop: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span>Total Users:</span>
                    <strong>{users.length}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span>Students:</span>
                    <strong>{users.filter(u => u.role === "student").length}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span>Landlords:</span>
                    <strong>{users.filter(u => u.role === "landlord").length}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span>Admins:</span>
                    <strong>{users.filter(u => u.role === "admin").length}</strong>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h3>Listing Statistics</h3>
                <div style={{ marginTop: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span>Total Listings:</span>
                    <strong>{listings.length}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span>Active Listings:</span>
                    <strong>{listings.filter(l => l.availability).length}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span>Inactive Listings:</span>
                    <strong>{listings.filter(l => !l.availability).length}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span>Average Price:</span>
                    <strong>K{Math.round(listings.reduce((sum, l) => sum + l.price, 0) / listings.length) || 0}/month</strong>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h3>Recent Activity</h3>
                <div style={{ marginTop: "20px" }}>
                  <p style={{ color: "gray", fontStyle: "italic" }}>
                    Activity tracking coming in next update...
                  </p>
                  <ul style={{ marginTop: "10px" }}>
                    <li>• User registrations</li>
                    <li>• New listings</li>
                    <li>• Reviews submitted</li>
                    <li>• Login activity</li>
                  </ul>
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}