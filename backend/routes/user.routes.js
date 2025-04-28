const express = require("express")
const router = express.Router()
const userController = require("../controllers/user.controller")
const { protect, authorize } = require("../middleware/auth.middleware")
const multer = require("multer");
const upload = multer({ dest: 'uploads/' }); // Temporary storage for files


// Get user profile
router.get("/profile", protect, userController.getUserProfile)

// Update user profile
router.put("/profile", protect, userController.updateUserProfile)

// Upload avatar
router.post("/upload-avatar", protect, upload.single('avatar'), userController.uploadAvatar);

// Get user subscription
router.get("/subscription", protect, userController.getUserSubscription)

// Get user assessments
router.get("/assessments", protect, userController.getUserAssessments)

router.put("/change-password", protect, userController.changePassword);
router.delete("/delete-account", protect, userController.deleteAccount);

module.exports = router

