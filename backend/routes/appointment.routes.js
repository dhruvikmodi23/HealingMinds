const express = require("express")
const router = express.Router()
const appointmentController = require("../controllers/appointment.controller")
const { protect, authorize } = require("../middleware/auth.middleware")

// Create a new appointment (protected, users only)
router.post("/", protect, authorize("user"), appointmentController.createAppointment)

// Get user appointments (protected, users only)
router.get("/user", protect, authorize("user"), appointmentController.getUserAppointments)

// Get counselor appointments (protected, counselors only)
router.get("/counselor", protect, authorize("counselor"), appointmentController.getCounselorAppointments)

// Get appointment by ID (protected)
router.get("/:id", protect, appointmentController.getAppointmentById)

// Update appointment status (protected, counselors only)
router.patch("/:id/status", protect, authorize("counselor"), appointmentController.updateAppointmentStatus)

// Reschedule appointment (protected)
router.patch("/:id/reschedule", protect, appointmentController.rescheduleAppointment)

// Cancel appointment (protected)
router.patch("/:id/cancel", protect, appointmentController.cancelAppointment)

// Complete appointment (protected, counselors only)
router.patch("/:id/complete", protect, authorize("counselor"), appointmentController.completeAppointment)

// Add session notes (protected, counselors only)
router.patch("/:id/notes", protect, authorize("counselor"), appointmentController.addSessionNotes)

// Rate and review appointment (protected, users only)
router.post("/:id/review", protect, authorize("user"), appointmentController.rateAndReviewAppointment)

// Generate meeting link (protected)
router.post("/:id/meeting-link", protect, appointmentController.generateMeetingLink)

// Get counselor availability for a specific date
router.get("/counselor/:id/availability", appointmentController.getCounselorAvailabilityByDate)

module.exports = router

