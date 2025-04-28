const express = require("express")
const router = express.Router()
const paymentController = require("../controllers/payment.controller")
const { protect } = require("../middleware/auth.middleware")

// User payment routes
router.post("/create-order", protect, paymentController.createOrder)
router.post("/verify", protect, paymentController.verifyPayment)
router.get("/history", protect, paymentController.getPaymentHistory)
router.get("/invoice/:paymentId", protect, paymentController.getPaymentInvoice)

module.exports = router
