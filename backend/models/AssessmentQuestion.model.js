const mongoose = require("mongoose")

const optionSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
})

const nextQuestionRuleSchema = new mongoose.Schema({
  condition: {
    type: String,
    enum: ["equals", "contains", "greaterThan", "lessThan", "between", "any"],
    required: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
  },
  nextQuestionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AssessmentQuestion",
  },
})

const assessmentQuestionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ["text", "number", "select", "radio", "checkbox", "scale"],
      required: true,
    },
    required: {
      type: Boolean,
      default: true,
    },
    options: [optionSchema],
    minValue: {
      type: Number,
      default: 1,
    },
    maxValue: {
      type: Number,
      default: 5,
    },
    minLabel: String,
    maxLabel: String,
    category: {
      type: String,
      enum: ["demographic", "general", "professional", "emotional", "behavioral", "physical", "social", "cognitive"],
      required: true,
    },
    ageRange: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 120,
      },
    },
    forGender: {
      type: [String],
      default: ["male", "female", "other", "prefer_not_to_say"],
    },
    forProfessions: {
      type: [String],
      default: [],
    },
    nextQuestionRules: [nextQuestionRuleSchema],
    defaultNextQuestionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssessmentQuestion",
    },
    isInitial: {
      type: Boolean,
      default: false,
    },
    isFinal: {
      type: Boolean,
      default: false,
    },
    weight: {
      type: Number,
      default: 1,
    },
    conditionMapping: {
      type: Map,
      of: Number,
    },
  },
  {
    timestamps: true,
  },
)

const AssessmentQuestion = mongoose.model("AssessmentQuestion", assessmentQuestionSchema)

module.exports = AssessmentQuestion
