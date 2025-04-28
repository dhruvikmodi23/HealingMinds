const Payment = require("../models/Payment.model")
const User = require("../models/User.model")
const crypto = require("crypto")

exports.handleRazorpayWebhook = async (req, res) => {
  // Verify webhook signature
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  const signature = req.headers["x-razorpay-signature"]

  const shasum = crypto.createHmac("sha256", webhookSecret)
  shasum.update(JSON.stringify(req.body))
  const digest = shasum.digest("hex")

  if (digest !== signature) {
    return res.status(400).json({ error: "Invalid webhook signature" })
  }

  const event = req.body

  try {
    // Handle different webhook events
    switch (event.event) {
      case "payment.captured":
        await handlePaymentCaptured(event.payload.payment.entity)
        break

      case "payment.failed":
        await handlePaymentFailed(event.payload.payment.entity)
        break

      case "refund.processed":
        await handleRefundProcessed(event.payload.refund.entity)
        break

      default:
        console.log(`Unhandled event type: ${event.event}`)
    }

    res.status(200).json({ received: true })
  } catch (err) {
    console.error(`Error handling webhook: ${err.message}`)
    res.status(500).json({ error: "Webhook processing failed" })
  }
}

async function handlePaymentCaptured(paymentEntity) {
  try {
    // Find the payment by Razorpay order ID
    const payment = await Payment.findOne({
      razorpayOrderId: paymentEntity.order_id,
    })

    if (!payment) {
      console.error(`Payment not found for order ID: ${paymentEntity.order_id}`)
      return
    }

    // Update payment status
    payment.status = "captured"
    payment.razorpayPaymentId = paymentEntity.id
    await payment.save()

    // Update user subscription if not already done
    const user = await User.findById(payment.user)
    if (user && (!user.subscription || user.subscription.plan !== payment.plan)) {
      user.subscription = {
        plan: payment.plan,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        status: "active",
      }
      await user.save()
    }
  } catch (err) {
    console.error(`Error handling payment captured: ${err.message}`)
  }
}

async function handlePaymentFailed(paymentEntity) {
  try {
    // Find the payment by Razorpay order ID
    const payment = await Payment.findOne({
      razorpayOrderId: paymentEntity.order_id,
    })

    if (!payment) {
      console.error(`Payment not found for order ID: ${paymentEntity.order_id}`)
      return
    }

    // Update payment status
    payment.status = "failed"
    payment.razorpayPaymentId = paymentEntity.id
    payment.metadata = {
      ...payment.metadata,
      failureReason: paymentEntity.error_description || paymentEntity.error_code,
    }
    await payment.save()
  } catch (err) {
    console.error(`Error handling payment failed: ${err.message}`)
  }
}

async function handleRefundProcessed(refundEntity) {
  try {
    // Find the payment by Razorpay payment ID
    const payment = await Payment.findOne({
      razorpayPaymentId: refundEntity.payment_id,
    })

    if (!payment) {
      console.error(`Payment not found for payment ID: ${refundEntity.payment_id}`)
      return
    }

    // Update payment status
    payment.status = "refunded"
    payment.refundId = refundEntity.id
    payment.refundedAt = new Date()
    await payment.save()

    // Update user subscription if needed
    const user = await User.findById(payment.user)
    if (user && user.subscription && user.subscription.plan === payment.plan) {
      user.subscription = {
        plan: "free",
        status: "cancelled",
        startDate: null,
        endDate: null,
      }
      await user.save()
    }
  } catch (err) {
    console.error(`Error handling refund processed: ${err.message}`)
  }
}
