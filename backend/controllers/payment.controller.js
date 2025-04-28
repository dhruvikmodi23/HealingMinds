const User = require("../models/User.model")
const Payment = require("../models/Payment.model")
const AppError = require("../utils/errorResponse")
const razorpay = require("../config/razorpay")
const crypto = require("crypto")

// Helper function for responses
const sendResponse = (res, statusCode, data) => {
  res.status(statusCode).json({
    success: true,
    data,
  })
}

// Create a Razorpay order
exports.createOrder = async (req, res, next) => {
  try {
    const { plan, amount } = req.body

    if (!["standard", "premium"].includes(plan)) {
      throw new AppError("Invalid subscription plan", 400)
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      throw new AppError("User not found", 404)
    }

    // Create order in Razorpay
    const options = {
      amount: amount, // amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: user._id.toString(),
        plan: plan,
        email: user.email,
      },
    }

    const order = await razorpay.orders.create(options)

    // Create payment record in pending state
    const payment = await Payment.create({
      user: user._id,
      amount: amount,
      description: `Subscription to ${plan} plan`,
      status: "created",
      plan,
      razorpayOrderId: order.id,
    })

    sendResponse(res, 200, {
      orderId: order.id,
      payment,
    })
  } catch (err) {
    next(err)
  }
}

// Verify payment after Razorpay checkout
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature

    if (!isAuthentic) {
      throw new AppError("Payment verification failed", 400)
    }

    // Update payment record
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id })

    if (!payment) {
      throw new AppError("Payment not found", 404)
    }

    payment.status = "captured"
    payment.razorpayPaymentId = razorpay_payment_id
    payment.razorpaySignature = razorpay_signature
    await payment.save()

    // Generate invoice
    const invoice = await razorpay.invoices.create({
      type: "invoice",
      customer: {
        name: req.user.name,
        email: req.user.email,
      },
      line_items: [
        {
          name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Subscription`,
          amount: payment.amount,
          currency: "INR",
          quantity: 1,
        },
      ],
      notes: {
        paymentId: payment._id.toString(),
      },
    })

    payment.invoiceId = invoice.id
    await payment.save()

    // Update user subscription
    const user = await User.findById(req.user.id)
    const subscription = {
      plan,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      status: "active",
    }

    user.subscription = subscription
    await user.save()

    sendResponse(res, 200, {
      payment,
      subscription,
    })
  } catch (err) {
    next(err)
  }
}

// Get payment history
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user.id }).sort({ createdAt: -1 })

    sendResponse(res, 200, payments)
  } catch (err) {
    next(err)
  }
}

// Get payment invoice
exports.getPaymentInvoice = async (req, res, next) => {
  try {
    const { paymentId } = req.params

    const payment = await Payment.findOne({
      _id: paymentId,
      user: req.user.id,
    })

    if (!payment) {
      throw new AppError("Payment not found", 404)
    }

    if (!payment.invoiceId) {
      throw new AppError("Invoice not available for this payment", 400)
    }

    // Get invoice from Razorpay
    const invoice = await razorpay.invoices.fetch(payment.invoiceId)

    if (!invoice || !invoice.short_url) {
      throw new AppError("Invoice not found", 404)
    }

    // Redirect to Razorpay invoice URL
    res.redirect(invoice.short_url)
  } catch (err) {
    next(err)
  }
}
