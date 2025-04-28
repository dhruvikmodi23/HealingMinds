const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["created", "attempted", "captured", "failed", "refunded"],
      default: "created",
    },
    plan: {
      type: String,
      enum: ["standard", "premium"],
      required: true,
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    invoiceId: {
      type: String,
    },
    refundId: {
      type: String,
    },
    refundedAt: {
      type: Date,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  },
)

const Payment = mongoose.model("Payment", paymentSchema)

module.exports = Payment
