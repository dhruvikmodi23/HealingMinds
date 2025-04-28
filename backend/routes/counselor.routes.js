const express = require("express");
const router = express.Router();
const counselorController = require("../controllers/counselor.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const mongoose = require("mongoose");

// Middleware to validate ObjectId
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }
  next();
};

router.get("/test-availability", (req, res) => {
  res.status(200).json({ message: "Test route works!" });
});


// Add this route before your POST/PUT profile routes
router.get("/profile", protect, authorize("counselor"), counselorController.getCounselorProfile);

// Get all counselors (public)
router.get("/", counselorController.getAllCounselors);

// Get counselor stats (protected, only for counselors) - MOVED BEFORE :id ROUTES
router.get("/stats", protect, authorize("counselor"), counselorController.getCounselorStats);

// Get counselor by ID (public)
router.get("/:id", validateObjectId, counselorController.getCounselorById);

// Get counselor availability (public)
router.get("/:id/availability", validateObjectId, counselorController.getCounselorAvailability);

// Get counselor reviews (public)
router.get("/:id/reviews", validateObjectId, counselorController.getCounselorReviews);


// Create counselor profile (protected, only for counselors)
router.post("/profile", protect, authorize("counselor"), counselorController.createCounselorProfile);

// Update counselor profile (protected, only for counselors)
router.put("/profile", protect, authorize("counselor"), counselorController.updateCounselorProfile);


// Get current counselor's availability
router.get(
  "/availability",
  protect,
  authorize("counselor"),
  counselorController.getCurrentCounselorAvailability
);

// Update counselor availability
router.put(
  "/availability",
  protect,
  authorize("counselor"),
  counselorController.updateCounselorAvailability
);

module.exports = router;
