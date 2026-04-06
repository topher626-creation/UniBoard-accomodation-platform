const express = require("express");
const stripe = require("../config/stripe");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const auth = require("../middleware/auth");

const router = express.Router();

// Create payment intent (for Stripe)
router.post("/create-intent", auth, async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Get booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check authorization
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if booking is paid
    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ message: "Booking already paid" });
    }

    // Create or get payment record
    let payment = await Payment.findOne({ booking: bookingId });

    if (!payment) {
      payment = new Payment({
        booking: bookingId,
        user: req.user._id,
        listing: booking.listing,
        amount: booking.totalAmount,
        status: "pending"
      });
      await payment.save();
    }

    // Create Stripe payment intent
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(booking.totalAmount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          bookingId: bookingId,
          userId: req.user._id.toString(),
          paymentId: payment._id.toString()
        }
      });

      // Update payment with Stripe intent
      payment.stripePaymentIntentId = paymentIntent.id;
      await payment.save();

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id,
        bookingId: bookingId,
        amount: booking.totalAmount
      });
    } catch (stripeError) {
      console.log("Stripe error (mock mode):", stripeError.message);
      // In mock/offline mode, generate a mock client secret
      res.json({
        clientSecret: `pi_mock_${bookingId}_${Date.now()}`,
        paymentId: payment._id,
        bookingId: bookingId,
        amount: booking.totalAmount,
        mockMode: true
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Confirm payment
router.post("/confirm", auth, async (req, res) => {
  try {
    const { paymentId, bookingId } = req.body;

    // Get payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Check authorization
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Get booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // In production, verify with Stripe
    // For now, mark as completed
    payment.status = "completed";
    payment.transactionId = `txn_${Date.now()}`;
    await payment.save();

    // Update booking status
    booking.status = "confirmed";
    booking.paymentStatus = "paid";
    await booking.save();

    res.json({
      message: "Payment successful",
      booking,
      payment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payment history
router.get("/user/history", auth, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("booking")
      .populate("listing", "title price")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payment details
router.get("/:id", auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("booking")
      .populate("user", "name email")
      .populate("listing", "title price");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Check authorization
    if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Webhook for Stripe (optional - for production)
router.post("/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });

      if (payment) {
        payment.status = "completed";
        payment.transactionId = paymentIntent.id;
        await payment.save();

        // Update booking
        const booking = await Booking.findById(payment.booking);
        if (booking) {
          booking.status = "confirmed";
          booking.paymentStatus = "paid";
          await booking.save();
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

module.exports = router;