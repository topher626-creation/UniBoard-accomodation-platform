import { useState } from "react";
import { Card, CardBody, Input, Button, DatePicker } from "@nextui-org/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function BookingForm({ listingId, listing }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    checkInDate: "",
    checkOutDate: "",
    numberOfMonths: 1
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotalAmount = () => {
    return (listing?.price || 0) * (formData.numberOfMonths || 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.post("http://localhost:5000/api/bookings", {
        listingId,
        checkInDate: new Date(formData.checkInDate),
        checkOutDate: new Date(formData.checkOutDate),
        numberOfMonths: parseInt(formData.numberOfMonths)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("Booking created! Proceeding to payment...");
      
      // Redirect to payment page
      setTimeout(() => {
        navigate(`/checkout/${response.data._id}`);
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <h3>Book This Property</h3>

        {error && (
          <div style={{
            color: "red",
            marginBottom: "15px",
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
            marginBottom: "15px",
            padding: "10px",
            border: "1px solid green",
            borderRadius: "5px"
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Check-In Date
            </label>
            <Input
              type="date"
              name="checkInDate"
              value={formData.checkInDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Check-Out Date
            </label>
            <Input
              type="date"
              name="checkOutDate"
              value={formData.checkOutDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Number of Months
            </label>
            <Input
              type="number"
              name="numberOfMonths"
              value={formData.numberOfMonths}
              onChange={handleInputChange}
              min="1"
              max="12"
              required
            />
          </div>

          {/* Price Summary */}
          <div style={{
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span>Price per month:</span>
              <strong>K{listing?.price || 0}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span>Number of months:</span>
              <strong>{formData.numberOfMonths}</strong>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid #ddd",
              paddingTop: "10px"
            }}>
              <span style={{ fontWeight: "bold" }}>Total Amount:</span>
              <strong style={{ fontSize: "18px", color: "green" }}>
                K{calculateTotalAmount()}
              </strong>
            </div>
          </div>

          <Button
            type="submit"
            color="primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Creating Booking..." : "Proceed to Payment"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}