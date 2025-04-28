const mongoose = require("mongoose")

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    counselor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counselor",
      required: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      default: 60, // in minutes
      required: true,
    },
    type: {
      type: String,
      enum: ["video", "phone", "chat"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "rescheduled"],
      default: "pending",
    },
    topic: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    sessionNotes: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    meetingLink: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

const Appointment = mongoose.model("Appointment", appointmentSchema)

module.exports = Appointment

