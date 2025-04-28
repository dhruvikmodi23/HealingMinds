const express = require("express")
const router = express.Router()
const authController = require("../controllers/auth.controller")
const { protect } = require("../middleware/auth.middleware")

// Register a new user
router.post("/register", authController.register)

// Login user
router.post("/login", authController.login)

// Get current user
router.get("/me", protect, authController.getCurrentUser)

// Forgot password
router.post("/forgot-password", authController.forgotPassword)

// Reset password
router.put("/reset-password/:resetToken", authController.resetPassword)

// Update password
router.put("/update-password", protect, authController.updatePassword)

module.exports = router

