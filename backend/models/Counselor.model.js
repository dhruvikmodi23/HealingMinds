const mongoose = require("mongoose")

const counselorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    specializations: {
      type: [String],
      required: true,
    },
    credentials: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    education: {
      type: [String],
    },
    certifications: {
      type: [String],
    },
    languages: {
      type: [String],
      default: ["English"],
    },
    availability: {
      type: [
        {
          day: {
            type: String,
            enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          },
          slots: [
            {
              startTime: String,
              endTime: String,
            },
          ],
        },
      ],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

const Counselor = mongoose.model("Counselor", counselorSchema)

module.exports = Counselor

