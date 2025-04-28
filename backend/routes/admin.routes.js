// admin.routes.js - Updated with pagination, filtering, sorting
const express = require("express")
const router = express.Router()
const adminController = require("../controllers/admin.controller")
const adminPaymentController = require("../controllers/admin.payment.controller")
const { protect, authorize } = require("../middleware/auth.middleware")

// Get all users (admin only) - with pagination, filtering, sorting
router.get("/users", protect, authorize("admin"), adminController.getAllUsers)

// Get user by ID (admin only)
router.get("/users/:id", protect, authorize("admin"), adminController.getUserById)

// Update user (admin only)
router.put("/users/:id", protect, authorize("admin"), adminController.updateUser)

// Delete user (admin only)
router.delete("/users/:id", protect, authorize("admin"), adminController.deleteUser)

// Get all counselors (admin only) - with pagination, filtering, sorting
router.get("/counselors", protect, authorize("admin"), adminController.getAllCounselors)

// Verify counselor (admin only)
router.patch("/counselors/:id/verify", protect, authorize("admin"), adminController.verifyCounselor)

// Get all appointments (admin only) - with pagination, filtering
router.get("/appointments", protect, authorize("admin"), adminController.getAllAppointments)

// Get dashboard stats (admin only)
router.get("/stats", protect, authorize("admin"), adminController.getDashboardStats)

// Get revenue stats (admin only)
router.get("/revenue", protect, authorize("admin"), adminController.getRevenueStats)

// Admin payment routes - all require admin role
router.get("/payments", protect, authorize("admin"), adminPaymentController.getAllPayments)

router.get("/payments/:paymentId", protect, authorize("admin"), adminPaymentController.getPaymentById)

router.post("/payments/:paymentId/refund", protect, authorize("admin"), adminPaymentController.refundPayment)

router.get("/payments/analytics", protect, authorize("admin"), adminPaymentController.getPaymentAnalytics)

module.exports = router