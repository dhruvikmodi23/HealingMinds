const Counselor = require("../models/Counselor.model")
const User = require("../models/User.model")
const Appointment = require("../models/Appointment.model")
const mongoose = require("mongoose")
const ErrorResponse = require("../utils/errorResponse")

// @desc    Get all counselors
// @route   GET /api/counselors
// @access  Public
exports.getAllCounselors = async (req, res, next) => {
  try {
    const counselors = await Counselor.find({ isActive: true, isVerified: true })
      .populate("user", "name email avatar")
      .sort({ rating: -1 })

    res.status(200).json({
      success: true,
      count: counselors.length,
      data: counselors,
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Get counselor by ID
// @route   GET /api/counselors/:id
// @access  Public
exports.getCounselorById = async (req, res, next) => {
  try {
    const counselor = await Counselor.findById(req.params.id).populate("user", "name email avatar")

    if (!counselor || !counselor.isActive) {
      return res.status(404).json({ success: false, message: "Counselor not found" })
    }

    res.status(200).json({
      success: true,
      data: counselor,
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Create counselor profile
// @route   POST /api/counselors/profile
// @access  Private/Counselor
exports.createCounselorProfile = async (req, res, next) => {
  try {
    const existingCounselor = await Counselor.findOne({ user: req.user.id })
    if (existingCounselor) {
      return res.status(400).json({ success: false, message: "Profile already exists" })
    }

    const counselor = await Counselor.create({
      user: req.user.id,
      ...req.body,
    })

    await User.findByIdAndUpdate(req.user.id, { role: "counselor" })

    res.status(201).json({
      success: true,
      data: counselor,
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Update counselor profile
// @route   PUT /api/counselors/profile
// @access  Private/Counselor
exports.updateCounselorProfile = async (req, res, next) => {
  try {
    const counselor = await Counselor.findOneAndUpdate({ user: req.user.id }, req.body, {
      new: true,
      runValidators: true,
    }).populate("user", "name email avatar")

    if (!counselor) {
      return res.status(404).json({ success: false, message: "Counselor profile not found" })
    }

    res.status(200).json({
      success: true,
      data: counselor,
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Get counselor availability
// @route   GET /api/counselors/:id/availability
// @access  Public
exports.getCounselorAvailability = async (req, res, next) => {
  try {
    const counselor = await Counselor.findById(req.params.id).select("availability")

    if (!counselor || !counselor.isActive) {
      return res.status(404).json({ success: false, message: "Counselor not found" })
    }

    const appointments = await Appointment.find({
      counselor: req.params.id,
      status: { $in: ["pending", "confirmed"] },
    }).select("dateTime duration")

    res.status(200).json({
      success: true,
      data: {
        availability: counselor.availability,
        bookedSlots: appointments,
      },
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Get counselor reviews
// @route   GET /api/counselors/:id/reviews
// @access  Public
exports.getCounselorReviews = async (req, res, next) => {
  try {
    const reviews = await Appointment.find({
      counselor: req.params.id,
      review: { $exists: true },
    })
      .populate("user", "name avatar")
      .select("rating review createdAt")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Get counselor stats
// @route   GET /api/counselors/stats
// @access  Private/Counselor
exports.getCounselorStats = async (req, res, next) => {
  try {
    const counselor = await Counselor.findOne({ user: req.user.id })
    if (!counselor) {
      return res.status(404).json({ success: false, message: "Counselor profile not found" })
    }

    const [totalSessions, upcomingSessions, reviews] = await Promise.all([
      Appointment.countDocuments({
        counselor: counselor._id,
        status: "completed",
      }),
      Appointment.countDocuments({
        counselor: counselor._id,
        status: { $in: ["confirmed", "pending"] },
        dateTime: { $gte: new Date() },
      }),
      Appointment.find({
        counselor: counselor._id,
        rating: { $exists: true },
      }),
    ])

    const averageRating =
      reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

    res.status(200).json({
      success: true,
      data: {
        totalSessions,
        upcomingSessions,
        averageRating,
        totalReviews: reviews.length,
      },
    })
  } catch (err) {
    next(err)
  }
}

exports.getCounselorProfile = async (req, res, next) => {
  try {
    // Verify the user exists and is a counselor
    if (!req.user || req.user.role !== "counselor") {
      console.error("User not authorized to access counselor profile")
      return res.status(403).json({
        success: false,
        error: "Unauthorized access. Counselor profile required.",
      })
    }

    // Find the counselor profile with detailed error handling
    const counselor = await Counselor.findOne({ user: req.user._id }).populate("user", "name email avatar role")

    if (!counselor) {
      return res.status(404).json({
        success: false,
        error: "Counselor profile not found",
      })
    }

    res.status(200).json({
      success: true,
      data: counselor,
    })
  } catch (err) {
    console.error("Error in getCounselorProfile:", err.message)
    res.status(500).json({
      success: false,
      error: "Failed to fetch counselor profile",
    })
  }
}

// @desc    Get current counselor's availability
// @route   GET /api/counselors/availability
// @access  Private/Counselor
exports.getCurrentCounselorAvailability = async (req, res) => {
  try {
    const counselor = await Counselor.findOne({ user: req.user.id }).select("availability")

    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: "Counselor not found",
      })
    }

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    // Format response to ensure all days are included
    const formattedAvailability = daysOfWeek.map((day) => {
      const existingDay = counselor.availability.find((d) => d.day === day)
      return existingDay || { day, slots: [] }
    })

    res.status(200).json({
      success: true,
      data: formattedAvailability,
    })
  } catch (error) {
    console.error("Error fetching availability:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching availability",
    })
  }
}

// @desc    Update counselor availability
// @route   PUT /api/counselors/availability
// @access  Private/Counselor
// In your counselor controller
exports.updateCounselorAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    // Validate input
    if (!availability || !Array.isArray(availability)) {
      return res.status(400).json({
        success: false,
        message: "Availability data must be provided as an array"
      });
    }

    // Additional validation
    const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    for (const day of availability) {
      if (!validDays.includes(day.day)) {
        return res.status(400).json({
          success: false,
          message: `Invalid day: ${day.day}`
        });
      }

      if (!Array.isArray(day.slots)) {
        return res.status(400).json({
          success: false,
          message: `Slots must be an array for day ${day.day}`
        });
      }

      for (const slot of day.slots) {
        if (!slot.startTime || !slot.endTime) {
          return res.status(400).json({
            success: false,
            message: "Each slot must have startTime and endTime"
          });
        }
        
        // Validate time format (HH:MM or HH:MM:SS)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
        if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
          return res.status(400).json({
            success: false,
            message: "Time must be in HH:MM or HH:MM:SS format"
          });
        }
      }
    }

    // Update in database
    const updatedCounselor = await Counselor.findOneAndUpdate(
      { user: req.user.id },
      { availability },
      { new: true, runValidators: true }
    );

    if (!updatedCounselor) {
      return res.status(404).json({
        success: false,
        message: "Counselor not found"
      });
    }

    // Return the updated availability
    return res.status(200).json({
      success: true,
      data: updatedCounselor.availability
    });

  } catch (error) {
    console.error("Update availability error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating availability"
    });
  }
};

