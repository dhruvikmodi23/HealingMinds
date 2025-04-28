const mongoose = require("mongoose")

const userAssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    responses: [
      {
        questionId: String,
        selectedOption: String,
        score: Number,
      },
    ],
    totalScore: {
      type: Number,
      required: true,
    },
    interpretation: {
      type: String,
    },
    recommendations: [
      {
        type: String,
      },
    ],
    counselorNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

const UserAssessment = mongoose.model("UserAssessment", userAssessmentSchema)

module.exports = UserAssessment

