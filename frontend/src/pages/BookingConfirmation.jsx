import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardBody, Button, Chip } from "@nextui-org/react";
import axios from "axios";

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooking(response.data);
    } catch (error) {
      setError("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>;
  }

  if (!booking) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Booking not found</div>;
  }

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ fontSize: "64px", marginBottom: "20px" }}>✅</div>
        <h1>Booking Confirmed!</h1>
        <p>Your accommodation booking has been successfully confirmed.</p>
      </div>

      <Card style={{ marginBottom: "30px" }}>
        <CardBody>
          <h3>Booking Details</h3>

          <div style={{ marginTop: "20px" }}>
            <div style={{ marginBottom: "15px", paddingBottom: "15px", borderBottom: "1px solid #eee" }}>
              <p><strong>Booking ID:</strong> {booking._id}</p>
              <p><strong>Property:</strong> {booking.listing?.title}</p>
              <p><strong>Location:</strong> {booking.listing?.location?.general}</p>
            </div>

            <div style={{ marginBottom: "15px", paddingBottom: "15px", borderBottom: "1px solid #eee" }}>
              <p><strong>Check-In Date:</strong> {new Date(booking.checkInDate).toLocaleDateString()}</p>
              <p><strong>Check-Out Date:</strong> {new Date(booking.checkOutDate).toLocaleDateString()}</p>
              <p><strong>Duration:</strong> {booking.numberOfMonths} month(s)</p>
            </div>

            <div style={{ marginBottom: "15px", paddingBottom: "15px", borderBottom: "1px solid #eee" }}>
              <p><strong>Monthly Rent:</strong> K{booking.listing?.price}</p>
              <p><strong>Total Amount Paid:</strong> K{booking.totalAmount}</p>
            </div>

            <div style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "15px"
            }}>
              <Chip color="success" variant="flat">
                Status: {booking.status.toUpperCase()}
              </Chip>
              <Chip color="success" variant="flat">
                Payment: {booking.paymentStatus.toUpperCase()}
              </Chip>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card style={{ marginBottom: "30px" }}>
        <CardBody>
          <h3>Next Steps</h3>
          <ol style={{ marginTop: "15px" }}>
            <li style={{ marginBottom: "10px" }}>
              The landlord has been notified about your booking.
            </li>
            <li style={{ marginBottom: "10px" }}>
              You will receive a confirmation email with more details.
            </li>
            <li style={{ marginBottom: "10px" }}>
              Contact the landlord to arrange viewing and key handover.
            </li>
            <li>
              Move in on your check-in date!
            </li>
          </ol>

          <div style={{
            backgroundColor: "#e7f3ff",
            padding: "15px",
            borderRadius: "5px",
            marginTop: "20px"
          }}>
            <p><strong>💡 Tip:</strong> You can contact the landlord directly using the phone number and email provided in the property details.</p>
          </div>
        </CardBody>
      </Card>

      <div style={{ display: "flex", gap: "10px" }}>
        <Button
          color="primary"
          onClick={() => navigate("/")}
          style={{ flex: 1 }}
        >
          Back to Home
        </Button>

        <Button
          variant="flat"
          onClick={() => navigate("/bookings")}
          style={{ flex: 1 }}
        >
          View My Bookings
        </Button>
      </div>

      <div style={{
        backgroundColor: "#fff3cd",
        padding: "15px",
        borderRadius: "5px",
        marginTop: "30px"
      }}>
        <p><strong>📧 Confirmation Email:</strong> A detailed confirmation email has been sent to your registered email address.</p>
      </div>
    </div>
  );
}