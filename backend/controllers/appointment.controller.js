const Appointment = require("../models/Appointment.model")
const User = require("../models/User.model")
const Counselor = require("../models/Counselor.model")
const crypto = require("crypto")

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private/User
exports.createAppointment = async (req, res, next) => {
  try {
    const { counselor, dateTime, duration, type, topic, notes } = req.body

    // Check if counselor exists
    const counselorExists = await Counselor.findById(counselor)
    if (!counselorExists) {
      return res.status(404).json({ success: false, message: "Counselor not found" })
    }

    // Check if counselor is available at the requested time
    const existingAppointment = await Appointment.findOne({
      counselor,
      dateTime: new Date(dateTime),
      status: { $in: ["pending", "confirmed"] },
    })

    if (existingAppointment) {
      return res.status(400).json({ success: false, message: "Counselor is not available at this time" })
    }

    // Create appointment
    const appointment = await Appointment.create({
      user: req.user.id,
      counselor,
      dateTime: new Date(dateTime),
      duration: duration || 60,
      type,
      topic,
      notes,
      status: "pending",
    })

    // Populate counselor details for response
    await appointment.populate([
      { path: "counselor", populate: { path: "user", select: "name email avatar" } },
      { path: "user", select: "name email avatar" },
    ])

    res.status(201).json({
      success: true,
      data: appointment,
    })
  } catch (err) {
    console.error("Error creating appointment:", err)
    res.status(500).json({
      success: false,
      message: err.message || "Failed to create appointment",
    })
  }
}

// @desc    Get user appointments
// @route   GET /api/appointments/user
// @access  Private/User
exports.getUserAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id })
      .populate({
        path: "counselor",
        populate: { path: "user", select: "name email avatar" },
      })
      .sort({ dateTime: -1 })

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    })
  } catch (err) {
    console.error("Error fetching user appointments:", err)
    res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch appointments",
    })
  }
}

// @desc    Get counselor appointments
// @route   GET /api/appointments/counselor
// @access  Private/Counselor
exports.getCounselorAppointments = async (req, res, next) => {
  try {
    // Find counselor profile for the logged in user
    const counselor = await Counselor.findOne({ user: req.user.id })
    if (!counselor) {
      return res.status(404).json({ success: false, message: "Counselor profile not found" })
    }

    const appointments = await Appointment.find({ counselor: counselor._id })
      .populate("user", "name email avatar")
      .sort({ dateTime: -1 })

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    })
  } catch (err) {
    console.error("Error fetching counselor appointments:", err)
    res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch appointments",
    })
  }
}

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("user", "name email avatar")
      .populate({
        path: "counselor",
        populate: { path: "user", select: "name email avatar" },
      })

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" })
    }

    // Check if user is authorized to access this appointment
    const isUser = appointment.user._id.toString() === req.user.id
    const isCounselor = appointment.counselor.user._id.toString() === req.user.id

    if (!isUser && !isCounselor && req.user.role !== "admin") {
      return res.status(401).json({ success: false, message: "Not authorized to access this appointment" })
    }

    res.status(200).json({
      success: true,
      data: appointment,
    })
  } catch (err) {
    console.error("Error fetching appointment:", err)
    res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch appointment",
    })
  }
}

// @desc    Update appointment status
// @route   PATCH /api/appointments/:id/status
// @access  Private/Counselor
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const validStatuses = ["pending", "confirmed", "cancelled", "completed", "rescheduled"]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" })
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate("user", "name email")
      .populate({
        path: "counselor",
        populate: { path: "user", select: "name email" },
      })

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" })
    }

    // Check if the logged in user is the counselor for this appointment
    if (appointment.counselor.user._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ success: false, message: "Not authorized to update this appointment" })
    }

    appointment.status = status
    await appointment.save()

    res.status(200).json({
      success: true,
      data: appointment,
    })
  } catch (err) {
    console.error("Error updating appointment status:", err)
    res.status(500).json({
      success: false,
      message: err.message || "Failed to update appointment status",
    })
  }
}

// @desc    Reschedule appointment
// @route   PATCH /api/appointments/:id/reschedule
// @access  Private
exports.rescheduleAppointment = async (req, res, next) => {
  try {
    const { dateTime } = req.body

    if (!dateTime) {
      return res.status(400).json({ success: false, message: "New date and time are required" })
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate("user", "name email")
      .populate({
        path: "counselor",
        populate: { path: "user", select: "name email" },
      })

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" })
    }

    // Check if user is authorized to reschedule this appointment
    const isUser = appointment.user._id.toString() === req.user.id
    const isCounselor = appointment.counselor.user._id.toString() === req.user.id

    if (!isUser && !isCounselor && req.user.role !== "admin") {
      return res.status(401).json({ success: false, message: "Not authorized to reschedule this appointment" })
    }

    // Check if new time is available
    const existingAppointment = await Appointment.findOne({
      counselor: appointment.counselor._id,
      dateTime: new Date(dateTime),
      status: { $in: ["pending", "confirmed"] },
      _id: { $ne: appointment._id },
    })

    if (existingAppointment) {
      return res.status(400).json({ success: false, message: "Counselor is not available at this time" })
    }

    appointment.dateTime = new Date(dateTime)
    appointment.status = "rescheduled"
    await appointment.save()

    res.status(200).json({
      success: true,
      data: appointment,
    })
  } catch (err) {
    console.error("Error rescheduling appointment:", err)
    res.status(500).json({
      success: false,
      message: err.message || "Failed to reschedule appointment",
    })
  }
}

// @desc    Cancel appointment
// @route   PATCH /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("user", "name email")
      .populate({
        path: "counselor",
        populate: { path: "user", select: "name email" },
      })

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" })
    }

    // Check if user is authorized to cancel this appointment
    const isUser = appointment.user._id.toString() === req.user.id
    const isCounselor = appointment.counselor.user._id.toString() === req.user.id

    if (!isUser && !isCounselor && req.user.role !== "admin") {
      return res.status(401).json({ success: false, message: "Not authorized to cancel this appointment" })
    }

    appointment.status = "cancelled"
    await appointment.save()

    res.status(200).json({
      success: true,
      data: appointment,
    })
  } catch (err) {
    console.error("Error cancelling appointment:", err)
    res.status(500).json({
      success: false,
      message: err.message || "Failed to cancel appointment",
    })
  }
}

// @desc    Complete appointment
// @route   PATCH /api/appointments/:id/complete
// @access  Private/Counselor
exports.completeAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("user", "name email")
      .populate({
        path: "counselor",
        populate: { path: "user", select: "name email" },
      })

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" })
    }

    // Check if the logged in user is the counselor for this appointment
    if (appointment.counselor.user._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ success: false, message: "Not authorized to complete this appointment" })
    }

    appointment.status = "completed"
    await appointment.save()

    res.status(200).json({
      success: true,
      data: appointment,
    })
  } catch (err) {
    console.error("Error completing appointment:", err)
    res.status(500).json({
      success: false,
      message: err.message || "Failed to complete appointment",
    })
  }
}

// @desc    Add session notes
// @route   PATCH /api/appointments/:id/notes
// @access  Private/Counselor
exports.addSessionNotes = async (req, res, next) => {
  try {
    const { notes } = req.body

    if (!notes) {
      return res.status(400).json({ success: false, message: "Notes are required" })
    }

    const appointment = await Appointment.findById(req.params.id).populate({
      path: "counselor",
      populate: { path: "user", select: "name email" },
    })

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" })
    }

    // Check if the logged in user is the counselor for this appointment
    if (appointment.counselor.user._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ success: false, message: "Not authorized to add notes to this appointment" })
    }

    appointment.sessionNotes = notes
    await appointment.save()

    res.status(200).json({
      success: true,
      data: appointment,
    })
  } catch (err) {
    console.error("Error adding session notes:", err)
    res.status(500).json({
      success: false,
      message: err.message || "Failed to add session notes",
    })
  }
}

// @desc    Rate and review appointment
// @route   POST /api/appointments/:id/review
// @access  Private/User
exports.rateAndReviewAppointment = async (req, res, next) => {
  try {
    const { rating, review } = req.body

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Valid rating (1-5) is required" })
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate("user", "name email")
      .populate({
        path: "counselor",
        populate: { path: "user", select: "name email" },
      })

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" })
    }

    // Check if user is authorized to review this appointment
    if (appointment.user._id.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: "Not authorized to review this appointment" })
    }

    // Check if appointment is completed
    if (appointment.status !== "completed") {
      return res.status(400).json({ success: false, message: "Only completed appointments can be reviewed" })
    }

    appointment.rating = rating
    appointment.review = review
    await appointment.save()

    // Update counselor's average rating
    await updateCounselorRating(appointment.counselor._id)

    res.status(200).json({
      success: true,
      data: appointment,
    })
  } catch (err) {
    console.error("Error rating appointment:", err)
    res.status(500).json({
      success: false,
      message: err.message || "Failed to rate appointment",
    })
  }
}

// @desc    Generate meeting link
// @route   POST /api/appointments/:id/meeting-link
// @access  Private
exports.generateMeetingLink = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("user", "name email")
      .populate({
        path: "counselor",
        populate: { path: "user", select: "name email" },
      })

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" })
    }

    // Check if user is authorized to generate link for this appointment
    const isUser = appointment.user._id.toString() === req.user.id
    const isCounselor = appointment.counselor.user._id.toString() === req.user.id

    if (!isUser && !isCounselor && req.user.role !== "admin") {
      return res.status(401).json({ success: false, message: "Not authorized to generate link for this appointment" })
    }

    // Check if appointment is confirmed
    if (appointment.status !== "confirmed") {
      return res.status(400).json({ success: false, message: "Only confirmed appointments can generate meeting links" })
    }

    // Generate a meeting link
    const meetingId = crypto.randomBytes(16).toString("hex")
    const meetingLink = `https://healingminds.com/meeting/${meetingId}`

    appointment.meetingLink = meetingLink
    await appointment.save()

    res.status(200).json({
      success: true,
      data: { meetingLink },
    })
  } catch (err) {
    console.error("Error generating meeting link:", err)
    res.status(500).json({
      success: false,
      message: err.message || "Failed to generate meeting link",
    })
  }
}

// Helper function to update counselor's average rating
const updateCounselorRating = async (counselorId) => {
  try {
    const result = await Appointment.aggregate([
      {
        $match: {
          counselor: counselorId,
          rating: { $exists: true, $gt: 0 },
        },
      },
      {
        $group: {
          _id: "$counselor",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ])

    if (result.length > 0) {
      await Counselor.findByIdAndUpdate(counselorId, {
        rating: result[0].averageRating,
        reviewCount: result[0].reviewCount,
      })
    }
  } catch (err) {
    console.error("Error updating counselor rating:", err)
  }
}

// @desc    Get counselor availability for a specific date
// @route   GET /api/appointments/counselor/:counselorId/availability
// @access  Public
exports.getCounselorAvailabilityByDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    const { counselorId } = req.params; // Changed from id to counselorId for clarity

    // Validate inputs
    if (!ObjectId.isValid(counselorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid counselor ID format",
      });
    }

    if (!date || isNaN(new Date(date).getTime())) {
      return res.status(400).json({
        success: false,
        message: "Valid date parameter is required (YYYY-MM-DD format)",
      });
    }

    const requestedDate = new Date(date);

   // Get counselor's availability
    const counselor = await Counselor.findById(counselorId);
    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: "Counselor not found",
      });
    }


    // Get day of week (0=Sunday, 6=Saturday)
    const dayOfWeek = requestedDate.getDay();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[dayOfWeek];

    // Find availability for this day
    const dayAvailability = counselor.availability.find((day) => day.day === dayName);

    if (!dayAvailability || !dayAvailability.slots || dayAvailability.slots.length === 0) {
      return res.json({
        success: true,
        data: {
          availableSlots: [],
          message: "Counselor is not available on this day",
        },
      });
    }

    // Get existing appointments for this date
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
      counselor: counselorId, // Use counselorId here
      dateTime: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["pending", "confirmed"] },
    });

    // Generate available time slots (60 minutes each)
    const availableSlots = [];
    dayAvailability.slots.forEach((slot) => {
      const [startHour, startMinute] = slot.startTime.split(":").map(Number);
      const [endHour, endMinute] = slot.endTime.split(":").map(Number);

      const slotStart = new Date(requestedDate);
      slotStart.setHours(startHour, startMinute, 0, 0);

      const slotEnd = new Date(requestedDate);
      slotEnd.setHours(endHour, endMinute, 0, 0);

      // Generate slots every 60 minutes
      let currentTime = new Date(slotStart);
      while (currentTime < slotEnd) {
        const slotEndTime = new Date(currentTime);
        slotEndTime.setMinutes(currentTime.getMinutes() + 60);

        // Check if this slot is already booked
        const isBooked = existingAppointments.some((appt) => {
          const apptTime = new Date(appt.dateTime);
          return apptTime.getTime() === currentTime.getTime();
        });

        if (!isBooked && slotEndTime <= slotEnd) {
          availableSlots.push({
            start: currentTime.toISOString(),
            end: slotEndTime.toISOString(),
          });
        }

        currentTime = new Date(slotEndTime);
      }
    });

    res.json({
      success: true,
      data: {
        availableSlots,
      },
    });
  } catch (err) {
    console.error("Error getting availability:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to get availability",
    });
  }
};