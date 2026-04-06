import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardBody, Chip, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@nextui-org/react";
import axios from "axios";

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    checkAuth();
    fetchBookings();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      navigate("/login");
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/bookings/user/my-bookings",
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    onOpen();
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking request?")) {
      return;
    }

    setCancelingId(bookingId);
    try {
      await axios.post(
        `http://localhost:5000/api/bookings/${bookingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Booking cancelled successfully");
      fetchBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert(error.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancelingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "CONFIRMED":
        return "success";
      case "REJECTED":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return "⏳";
      case "CONFIRMED":
        return "✅";
      case "REJECTED":
        return "❌";
      default:
        return "📋";
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Loading your bookings...</div>;
  }

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1>📅 My Bookings</h1>
        <Button color="primary" onClick={() => navigate("/")}>
          ← Browse Properties
        </Button>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardBody style={{ textAlign: "center", padding: "50px" }}>
            <p style={{ fontSize: "18px", color: "gray" }}>You haven't made any booking requests yet.</p>
            <Button
              color="primary"
              style={{ marginTop: "20px" }}
              onClick={() => navigate("/")}
            >
              Start Browsing Properties
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "20px"
        }}>
          {bookings.map((booking) => (
            <Card key={booking._id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardBody>

                {/* Status Badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
                  <Chip
                    color={getStatusColor(booking.status)}
                    variant="flat"
                  >
                    {getStatusIcon(booking.status)} {booking.status}
                  </Chip>
                </div>

                {/* Property Info */}
                {booking.listing?.images?.[0] && (
                  <img
                    src={booking.listing.images[0]}
                    alt={booking.listing.title}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginBottom: "15px"
                    }}
                  />
                )}

                <h3 style={{ marginBottom: "10px" }}>{booking.listing?.title}</h3>
                <p style={{ color: "gray", fontSize: "14px", marginBottom: "10px" }}>
                  📍 {booking.listing?.location?.general}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                  <span><strong>Price:</strong> K{booking.listing?.price}/month</span>
                  <span style={{ fontSize: "12px", color: "gray" }}>
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Status-Specific Info */}
                {booking.status === "PENDING" && (
                  <div style={{
                    backgroundColor: "#fff3cd",
                    padding: "10px",
                    borderRadius: "4px",
                    marginBottom: "15px",
                    fontSize: "13px"
                  }}>
                    ⏳ Waiting for landlord confirmation. Upload payment proof to complete booking.
                  </div>
                )}

                {booking.status === "CONFIRMED" && (
                  <div style={{
                    backgroundColor: "#d4edda",
                    padding: "10px",
                    borderRadius: "4px",
                    marginBottom: "15px",
                    fontSize: "13px"
                  }}>
                    ✅ Booking confirmed! Contact landlord to arrange move-in.
                  </div>
                )}

                {booking.status === "REJECTED" && (
                  <div style={{
                    backgroundColor: "#f8d7da",
                    padding: "10px",
                    borderRadius: "4px",
                    marginBottom: "15px",
                    fontSize: "13px"
                  }}>
                    ❌ Reason: {booking.rejectionReason}
                  </div>
                )}

                {/* Payment Proof */}
                {booking.paymentProofUrl && (
                  <div style={{
                    backgroundColor: "#f0f7ff",
                    padding: "10px",
                    borderRadius: "4px",
                    marginBottom: "15px",
                    fontSize: "13px"
                  }}>
                    💳 Payment proof uploaded
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <Button
                    color="primary"
                    variant="flat"
                    className="flex-1"
                    onClick={() => handleViewDetails(booking)}
                  >
                    View Details
                  </Button>

                  {booking.status === "PENDING" && (
                    <Button
                      color="danger"
                      variant="flat"
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={cancelingId === booking._id}
                    >
                      Cancel
                    </Button>
                  )}

                  {booking.listing?.landlordPhoneNumber && (
                    <Button
                      color="success"
                      size="sm"
                      onClick={() => {
                        const message = encodeURIComponent(`Hi, I have a booking request for your property: ${booking.listing.title}`);
                        window.open(`https://wa.me/${booking.listing.landlordPhoneNumber}?text=${message}`);
                      }}
                    >
                      💬
                    </Button>
                  )}
                </div>

              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          <ModalHeader>Booking Details</ModalHeader>
          <ModalBody>
            {selectedBooking && (
              <div>
                <h3>{selectedBooking.listing?.title}</h3>

                <div style={{ marginTop: "15px" }}>
                  <p><strong>Status:</strong> <Chip color={getStatusColor(selectedBooking.status)}>
                    {getStatusIcon(selectedBooking.status)} {selectedBooking.status}
                  </Chip></p>
                  <p><strong>Price:</strong> K{selectedBooking.listing?.price}/month</p>
                  <p><strong>Location:</strong> {selectedBooking.listing?.location?.general}</p>
                  <p><strong>Exact Address:</strong> {selectedBooking.listing?.location?.exact}</p>
                  <p><strong>Requested on:</strong> {new Date(selectedBooking.createdAt).toLocaleDateString()}</p>
                </div>

                {selectedBooking.paymentProofUrl && (
                  <div style={{ marginTop: "15px" }}>
                    <p><strong>Payment Proof:</strong></p>
                    <img
                      src={selectedBooking.paymentProofUrl}
                      alt="Payment Proof"
                      style={{
                        width: "100%",
                        maxHeight: "300px",
                        objectFit: "cover",
                        borderRadius: "4px",
                        marginTop: "10px"
                      }}
                    />
                  </div>
                )}

                {selectedBooking.paymentNotes && (
                  <div style={{ marginTop: "10px" }}>
                    <p><strong>Payment Notes:</strong> {selectedBooking.paymentNotes}</p>
                  </div>
                )}

                {selectedBooking.status === "REJECTED" && (
                  <div style={{
                    backgroundColor: "#f8d7da",
                    padding: "15px",
                    borderRadius: "4px",
                    marginTop: "15px"
                  }}>
                    <strong>Rejection Reason:</strong>
                    <p>{selectedBooking.rejectionReason}</p>
                  </div>
                )}

                {selectedBooking.listing?.paymentInstructions && (
                  <div style={{
                    backgroundColor: "#f0f7ff",
                    padding: "15px",
                    borderRadius: "4px",
                    marginTop: "15px",
                    borderLeft: "4px solid #0d64f0"
                  }}>
                    <strong>💰 Payment Instructions:</strong>
                    <p style={{ whiteSpace: "pre-wrap", marginTop: "10px" }}>
                      {selectedBooking.listing.paymentInstructions}
                    </p>
                  </div>
                )}

                {selectedBooking.listing?.landlordPhoneNumber && (
                  <div style={{ marginTop: "15px" }}>
                    <Button
                      color="primary"
                      style={{ width: "100%" }}
                      onClick={() => {
                        const message = encodeURIComponent(`Hi, I have a booking request for your property: ${selectedBooking.listing.title}`);
                        window.open(`https://wa.me/${selectedBooking.listing.landlordPhoneNumber}?text=${message}`);
                      }}
                    >
                      💬 Chat on WhatsApp
                    </Button>
                  </div>
                )}

              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

    </div>
  );
}