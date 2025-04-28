const express = require("express")
const router = express.Router()
const assessmentController = require("../controllers/assessment.controller")
const { protect, authorize } = require("../middleware/auth.middleware")

// User assessment routes
router.post("/start", protect, assessmentController.startAssessment)
router.get("/questions/:assessmentId", protect, assessmentController.getQuestions)
router.post("/respond/:assessmentId", protect, assessmentController.saveResponse)
router.post("/complete/:assessmentId", protect, assessmentController.completeAssessment)
router.get("/user", protect, assessmentController.getUserAssessments)
router.get("/:assessmentId", protect, assessmentController.getAssessment)
router.get("/:assessmentId/pdf", protect, assessmentController.getAssessmentPdf)

// Counselor assessment routes
router.get("/client/:clientId", protect, authorize("counselor", "admin"), assessmentController.getClientAssessments)
router.get("/clients", protect, authorize("counselor"), assessmentController.getCounselorClients)

// Admin routes
router.post("/questions", protect, authorize("admin"), assessmentController.createQuestion)
router.put("/questions/:questionId", protect, authorize("admin"), assessmentController.updateQuestion)
router.delete("/questions/:questionId", protect, authorize("admin"), assessmentController.deleteQuestion)
router.get("/admin/questions", protect, authorize("admin"), assessmentController.getAllQuestions)

module.exports = router
