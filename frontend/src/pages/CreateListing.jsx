import { useState, useEffect } from "react";
import { Input, Button, Textarea, Select, SelectItem, Card, CardBody } from "@nextui-org/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreateListing() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: {
      general: "",
      exact: ""
    },
    roomType: "single",
    amenities: [],
    landlordPhoneNumber: "",
    paymentInstructions: "",
    contactInfo: {
      phone: "",
      email: ""
    }
  });

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Check if user is logged in and is a landlord
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "landlord" && parsedUser.role !== "admin") {
      setError("Only landlords can create listings");
      return;
    }

    setUser(parsedUser);
    // Pre-fill contact info
    setFormData(prev => ({
      ...prev,
      landlordPhoneNumber: parsedUser.phone || "",
      contactInfo: {
        phone: parsedUser.phone || "",
        email: parsedUser.email
      }
    }));
  }, [navigate]);

  const handleChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleAmenitiesChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];

      for (const file of files) {
        const formDataUpload = new FormData();
        formDataUpload.append("image", file);

        const response = await axios.post("http://localhost:5000/api/upload", formDataUpload, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        uploadedUrls.push(response.data.url);
      }

      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (error) {
      setError("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const listingData = {
        ...formData,
        price: parseFloat(formData.price),
        images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"]
      };

      await axios.post("http://localhost:5000/api/listings", listingData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      setSuccess("Listing created successfully!");
      // Reset form
      setFormData({
        title: "",
        description: "",
        price: "",
        location: { general: "", exact: "" },
        roomType: "single",
        amenities: [],
        landlordPhoneNumber: user?.phone || "",
        paymentInstructions: "",
        contactInfo: { phone: user?.phone || "", email: user?.email || "" }
      });
      setImages([]);

      // Redirect to home after 2 seconds
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>;
  }

  if (user.role !== "landlord" && user.role !== "admin") {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Access Denied</h2>
        <p>Only landlords can create property listings.</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const amenityOptions = [
    "WiFi", "Kitchen", "Laundry", "Security", "Parking",
    "Air Conditioning", "Heating", "Furnished", "Gym Access", "Study Area"
  ];

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      <h1>Create Property Listing</h1>
      <p>Fill in the details to list your property on UniBoard</p>

      {error && (
        <div style={{
          color: "red",
          marginBottom: "20px",
          padding: "10px",
          border: "1px solid red",
          borderRadius: "5px"
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          color: "green",
          marginBottom: "20px",
          padding: "10px",
          border: "1px solid green",
          borderRadius: "5px"
        }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card style={{ marginBottom: "20px" }}>
          <CardBody>
            <h3>Basic Information</h3>

            <Input
              label="Property Title"
              placeholder="e.g., Cozy Single Room Near UNZA"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              style={{ marginBottom: "15px" }}
              required
            />

            <Textarea
              label="Description"
              placeholder="Describe your property, amenities, and what makes it great for students..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              style={{ marginBottom: "15px" }}
              required
            />

            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
              <Input
                label="Monthly Price (K)"
                type="number"
                placeholder="1500"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                required
              />

              <Select
                label="Room Type"
                value={formData.roomType}
                onChange={(value) => handleChange("roomType", value)}
              >
                <SelectItem key="single" value="single">Single Room</SelectItem>
                <SelectItem key="shared" value="shared">Shared Room</SelectItem>
                <SelectItem key="apartment" value="apartment">Apartment</SelectItem>
                <SelectItem key="house" value="house">House</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>

        <Card style={{ marginBottom: "20px" }}>
          <CardBody>
            <h3>Location</h3>

            <Input
              label="General Location"
              placeholder="e.g., Near University of Zambia"
              value={formData.location.general}
              onChange={(e) => handleChange("location.general", e.target.value)}
              style={{ marginBottom: "15px" }}
              required
            />

            <Input
              label="Exact Address"
              placeholder="e.g., 123 Main Street, Lusaka"
              value={formData.location.exact}
              onChange={(e) => handleChange("location.exact", e.target.value)}
              required
            />
          </CardBody>
        </Card>

        <Card style={{ marginBottom: "20px" }}>
          <CardBody>
            <h3>Amenities</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "10px" }}>
              {amenityOptions.map(amenity => (
                <label key={amenity} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenitiesChange(amenity)}
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card style={{ marginBottom: "20px" }}>
          <CardBody>
            <h3>Images</h3>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              style={{ marginBottom: "10px" }}
            />
            {uploading && <p>Uploading images...</p>}

            {images.length > 0 && (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                {images.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Property ${index + 1}`}
                    style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "5px" }}
                  />
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card style={{ marginBottom: "20px" }}>
          <CardBody>
            <h3>Payment Information</h3>

            <Input
              label="Your Phone Number (Landlord WhatsApp)"
              placeholder="e.g., +260955123456"
              value={formData.landlordPhoneNumber}
              onChange={(e) => handleChange("landlordPhoneNumber", e.target.value)}
              style={{ marginBottom: "15px" }}
              required
            />

            <Textarea
              label="Payment Instructions"
              placeholder="e.g., MTN: 0955123456&#10;OR&#10;Bank Transfer: Account: 1234567, Bank of Zambia"
              value={formData.paymentInstructions}
              onChange={(e) => handleChange("paymentInstructions", e.target.value)}
              style={{ marginBottom: "15px" }}
              required
            />
          </CardBody>
        </Card>

        <Card style={{ marginBottom: "20px" }}>
          <CardBody>
            <h3>Contact Information</h3>

            <Input
              label="Phone Number"
              value={formData.contactInfo.phone}
              onChange={(e) => handleChange("contactInfo.phone", e.target.value)}
              style={{ marginBottom: "15px" }}
            />

            <Input
              label="Email"
              type="email"
              value={formData.contactInfo.email}
              onChange={(e) => handleChange("contactInfo.email", e.target.value)}
              required
            />
          </CardBody>
        </Card>

        <Button
          color="primary"
          type="submit"
          size="lg"
          style={{ width: "100%" }}
          disabled={loading}
        >
          {loading ? "Creating Listing..." : "Create Property Listing"}
        </Button>
      </form>
    </div>
  );
}