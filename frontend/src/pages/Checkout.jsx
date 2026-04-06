import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardBody, Button, Input, Select, SelectItem, Chip } from "@nextui-org/react";
import axios from "axios";

export default function Checkout() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [cardDetails, setCardDetails] = useState({
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvc: ""
  });

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

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (paymentMethod === "stripe") {
        // In production, use Stripe's Elements API
        // For demo, simulate payment confirmation
        const confirmResponse = await axios.post(
          "http://localhost:5000/api/payments/confirm",
          {
            paymentId: `payment_${bookingId}`,
            bookingId
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setSuccess("Payment successful! Your booking is confirmed.");
        setTimeout(() => {
          navigate(`/booking-confirmation/${bookingId}`);
        }, 2000);
      } else if (paymentMethod === "mobile_money") {
        // Simulate mobile money payment
        setSuccess("Mobile money payment initiated. Check your phone for confirmation.");
        
        setTimeout(async () => {
          const confirmResponse = await axios.post(
            "http://localhost:5000/api/payments/confirm",
            {
              paymentId: `payment_${bookingId}`,
              bookingId
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          navigate(`/booking-confirmation/${bookingId}`);
        }, 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>;
  }

  if (!booking) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Booking not found</div>;
  }

  return (
    <div style={{ padding: "40px", maxWidth: "1000px", margin: "auto" }}>
      <h1>Checkout</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginTop: "30px" }}>
        
        {/* Order Summary */}
        <div>
          <Card>
            <CardBody>
              <h3>Order Summary</h3>

              <div style={{ marginTop: "20px" }}>
                <div style={{ marginBottom: "20px", pborderBottom: "1px solid #eee" }}>
                  <p><strong>Property:</strong> {booking.listing?.title}</p>
                  <p><strong>Check-In:</strong> {new Date(booking.checkInDate).toLocaleDateString()}</p>
                  <p><strong>Check-Out:</strong> {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                  <p><strong>Duration:</strong> {booking.numberOfMonths} month(s)</p>
                </div>

                <div style={{ 
                  backgroundColor: "#f5f5f5",
                  padding: "15px",
                  borderRadius: "5px",
                  marginTop: "20px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span>Rent per month:</span>
                    <strong>K{booking.listing?.price || 0}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span>Number of months:</span>
                    <strong>{booking.numberOfMonths}</strong>
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "1px solid #ddd",
                    paddingTop: "10px",
                    fontSize: "18px"
                  }}>
                    <strong>Total Amount:</strong>
                    <strong style={{ color: "green" }}>K{booking.totalAmount}</strong>
                  </div>
                </div>

                <Chip color="success" variant="flat" style={{ marginTop: "15px" }}>
                  Status: {booking.status.toUpperCase()}
                </Chip>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Payment Form */}
        <div>
          <Card>
            <CardBody>
              <h3>Payment Method</h3>

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

              <form onSubmit={handlePayment} style={{ marginTop: "20px" }}>
                <Select
                  label="Select Payment Method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginBottom: "20px" }}
                >
                  <SelectItem key="stripe" value="stripe">
                    💳 Credit/Debit Card (Stripe)
                  </SelectItem>
                  <SelectItem key="mobile_money" value="mobile_money">
                    📱 Mobile Money (MTN / Airtel)
                  </SelectItem>
                  <SelectItem key="bank_transfer" value="bank_transfer">
                    🏦 Bank Transfer
                  </SelectItem>
                </Select>

                {paymentMethod === "stripe" && (
                  <div>
                    <Input
                      label="Cardholder Name"
                      placeholder="John Doe"
                      value={cardDetails.cardName}
                      onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
                      style={{ marginBottom: "15px" }}
                      required
                    />

                    <Input
                      label="Card Number"
                      placeholder="4242 4242 4242 4242"
                      value={cardDetails.cardNumber}
                      onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                      style={{ marginBottom: "15px" }}
                      required
                    />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "15px" }}>
                      <Input
                        label="Expiry Date"
                        placeholder="MM/YY"
                        value={cardDetails.expiryDate}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: e.target.value })}
                        required
                      />

                      <Input
                        label="CVC"
                        placeholder="123"
                        value={cardDetails.cvc}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{
                      backgroundColor: "#fff3cd",
                      padding: "10px",
                      borderRadius: "5px",
                      marginBottom: "15px",
                      fontSize: "12px"
                    }}>
                      💡 <strong>Demo Mode:</strong> Use test card 4242 4242 4242 4242 with any future date
                    </div>
                  </div>
                )}

                {paymentMethod === "mobile_money" && (
                  <div>
                    <Select
                      label="Mobile Money Provider"
                      placeholder="Select provider"
                      style={{ marginBottom: "15px" }}
                    >
                      <SelectItem key="mtn" value="mtn">MTN Mobile Money</SelectItem>
                      <SelectItem key="airtel" value="airtel">Airtel Money</SelectItem>
                      <SelectItem key="zamtel" value="zamtel">Zamtel Pay</SelectItem>
                    </Select>

                    <Input
                      label="Phone Number"
                      placeholder="+260955123456"
                      style={{ marginBottom: "15px" }}
                      required
                    />

                    <div style={{
                      backgroundColor: "#d1ecf1",
                      padding: "10px",
                      borderRadius: "5px",
                      marginBottom: "15px",
                      fontSize: "12px"
                    }}>
                      ℹ️ You will receive a prompt on your mobile phone to confirm the payment.
                    </div>
                  </div>
                )}

                {paymentMethod === "bank_transfer" && (
                  <div style={{
                    backgroundColor: "#e2e3e5",
                    padding: "15px",
                    borderRadius: "5px"
                  }}>
                    <p><strong>Bank Details:</strong></p>
                    <p>Bank Name: UniBoard Payments</p>
                    <p>Account: 1234567890</p>
                    <p>Reference: {bookingId}</p>
                    <p>Amount: K{booking.totalAmount}</p>
                    <p style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
                      Please transfer the amount and reference above to complete your booking.
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  color="primary"
                  style={{ width: "100%", marginTop: "20px" }}
                  disabled={processing || paymentMethod === "bank_transfer"}
                >
                  {processing ? "Processing..." : `Pay K${booking.totalAmount}`}
                </Button>

                <Button
                  variant="flat"
                  style={{ width: "100%", marginTop: "10px" }}
                  onClick={() => navigate(-1)}
                  disabled={processing}
                >
                  Cancel
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>

      </div>
    </div>
  );
}