const express = require("express")
const router = express.Router()
const webhookController = require("../controllers/webhook.controller")

// Razorpay webhook route
router.post("/razorpay", express.raw({ type: "application/json" }), webhookController.handleRazorpayWebhook)

module.exports = router
