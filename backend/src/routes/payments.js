const express = require("express");
const stripe = require("../config/stripe");
const { Payment, Booking, Listing, User } = require("../models");
const auth = require("../middleware/auth");

const router = express.Router();

// Create payment intent (for Stripe)
router.post("/create-intent", auth, async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Get booking
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check authorization
    if (booking.user_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if booking is paid
    if (booking.payment_status === "paid") {
      return res.status(400).json({ message: "Booking already paid" });
    }

    // Create or get payment record
    let payment = await Payment.findOne({ where: { booking_id: bookingId } });

    if (!payment) {
      payment = await Payment.create({
        booking_id: bookingId,
        user_id: req.user.id,
        listing_id: booking.property_id, // Assuming booking has property_id
        amount: booking.total_amount,
        status: "pending"
      });
    }

    // Create Stripe payment intent
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(booking.total_amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          bookingId: bookingId,
          userId: req.user.id.toString(),
          paymentId: payment.id.toString()
        }
      });

      // Update payment with Stripe intent
      payment.stripe_payment_intent_id = paymentIntent.id;
      await payment.save();

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id,
        bookingId: bookingId,
        amount: booking.total_amount
      });
    } catch (stripeError) {
      console.log("Stripe error (mock mode):", stripeError.message);
      // In mock/offline mode, generate a mock client secret
      res.json({
        clientSecret: `pi_mock_${bookingId}_${Date.now()}`,
        paymentId: payment.id,
        bookingId: bookingId,
        amount: booking.total_amount,
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
    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Check authorization
    if (payment.user_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Get booking
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // In production, verify with Stripe
    // For now, mark as completed
    payment.status = "completed";
    payment.transaction_id = `txn_${Date.now()}`;
    await payment.save();

    // Update booking status
    booking.status = "confirmed";
    booking.payment_status = "paid";
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
    const payments = await Payment.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Booking,
          as: 'booking'
        },
        {
          model: Listing,
          as: 'listing',
          attributes: ['title', 'price']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payment details
router.get("/:id", auth, async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [
        {
          model: Booking,
          as: 'booking'
        },
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        },
        {
          model: Listing,
          as: 'listing',
          attributes: ['title', 'price']
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Check authorization
    if (payment.user_id !== req.user.id && req.user.role !== "admin") {
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
      const payment = await Payment.findOne({
        where: { stripe_payment_intent_id: paymentIntent.id }
      });

      if (payment) {
        payment.status = "completed";
        payment.transaction_id = paymentIntent.id;
        await payment.save();

        // Update booking
        const booking = await Booking.findByPk(payment.booking_id);
        if (booking) {
          booking.status = "confirmed";
          booking.payment_status = "paid";
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