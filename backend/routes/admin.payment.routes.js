const express = require("express")
const router = express.Router()
const adminPaymentController = require("../controllers/admin.payment.controller")
const { protect, authorize } = require("../middleware/auth.middleware")

// Admin payment routes - all require admin role
router.get("/payments", protect, authorize("admin"), adminPaymentController.getAllPayments)

router.get("/payments/:paymentId", protect, authorize("admin"), adminPaymentController.getPaymentById)

router.post("/payments/:paymentId/refund", protect, authorize("admin"), adminPaymentController.refundPayment)

router.get("/payments/analytics", protect, authorize("admin"), adminPaymentController.getPaymentAnalytics)

module.exports = router
