const mongoose = require("mongoose")

const responseSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AssessmentQuestion",
    required: true,
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

const resultSchema = new mongoose.Schema({
  condition: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  severityLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  recommendations: {
    type: [String],
    required: true,
  },
})

const assessmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    responses: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AssessmentQuestion",
        },
        answer: {
          type: mongoose.Schema.Types.Mixed,
        },
      },
    ],
    status: {
      type: String,
      enum: ["in_progress", "completed", "abandoned"],
      default: "in_progress",
    },
    completedAt: {
      type: Date,
    },
    result: resultSchema,
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
)

const Assessment = mongoose.model("Assessment", assessmentSchema)

module.exports = Assessment
