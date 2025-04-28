const mongoose = require("mongoose")
const AssessmentQuestion = require("../models/AssessmentQuestion.model")
require("dotenv").config()

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// Initial demographic questions
const demographicQuestions = [
  {
    text: "What is your age?",
    type: "number",
    category: "demographic",
    isInitial: true,
    required: true,
  },
  {
    text: "What is your gender?",
    type: "radio",
    category: "demographic",
    isInitial: true,
    required: true,
    options: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
      { label: "Other", value: "other" },
      { label: "Prefer not to say", value: "prefer_not_to_say" },
    ],
  },
  {
    text: "What is your profession?",
    type: "select",
    category: "demographic",
    isInitial: true,
    required: true,
    options: [
      { label: "Student", value: "student" },
      { label: "Healthcare Professional", value: "healthcare" },
      { label: "Business Professional", value: "business" },
      { label: "Education", value: "education" },
      { label: "Technology", value: "technology" },
      { label: "Service Industry", value: "service" },
      { label: "Retired", value: "retired" },
      { label: "Unemployed", value: "unemployed" },
      { label: "Other", value: "other" },
    ],
  },
]

// General mental health questions
const generalQuestions = [
  {
    text: "Over the past 2 weeks, how often have you felt down, depressed, or hopeless?",
    type: "radio",
    category: "emotional",
    required: true,
    options: [
      { label: "Not at all", value: "not_at_all" },
      { label: "Several days", value: "several_days" },
      { label: "More than half the days", value: "more_than_half" },
      { label: "Nearly every day", value: "nearly_every_day" },
    ],
    conditionMapping: new Map([
      ["depression", 2],
      ["anxiety", 1],
    ]),
  },
  {
    text: "Over the past 2 weeks, how often have you felt nervous, anxious, or on edge?",
    type: "radio",
    category: "emotional",
    required: true,
    options: [
      { label: "Not at all", value: "not_at_all" },
      { label: "Several days", value: "several_days" },
      { label: "More than half the days", value: "more_than_half" },
      { label: "Nearly every day", value: "nearly_every_day" },
    ],
    conditionMapping: new Map([
      ["anxiety", 2],
      ["stress", 1],
    ]),
  },
  {
    text: "How would you rate your overall stress level in the past month?",
    type: "scale",
    category: "emotional",
    required: true,
    minValue: 1,
    maxValue: 10,
    minLabel: "Very Low",
    maxLabel: "Very High",
    conditionMapping: new Map([
      ["stress", 1],
      ["burnout", 0.5],
    ]),
  },
  {
    text: "How often do you have trouble falling or staying asleep?",
    type: "radio",
    category: "physical",
    required: true,
    options: [
      { label: "Never", value: "never" },
      { label: "Rarely", value: "rarely" },
      { label: "Sometimes", value: "sometimes" },
      { label: "Often", value: "often" },
      { label: "Almost always", value: "almost_always" },
    ],
    conditionMapping: new Map([
      ["insomnia", 2],
      ["anxiety", 0.5],
      ["depression", 0.5],
    ]),
  },
]

// Student-specific questions
const studentQuestions = [
  {
    text: "How often do you feel overwhelmed by your academic workload?",
    type: "radio",
    category: "emotional",
    forProfessions: ["student"],
    required: true,
    options: [
      { label: "Never", value: "never" },
      { label: "Rarely", value: "rarely" },
      { label: "Sometimes", value: "sometimes" },
      { label: "Often", value: "often" },
      { label: "Almost always", value: "almost_always" },
    ],
    conditionMapping: new Map([
      ["stress", 1.5],
      ["anxiety", 1],
    ]),
  },
  {
    text: "Do you feel pressure to perform academically?",
    type: "scale",
    category: "emotional",
    forProfessions: ["student"],
    required: true,
    minValue: 1,
    maxValue: 10,
    minLabel: "No pressure",
    maxLabel: "Extreme pressure",
    conditionMapping: new Map([
      ["anxiety", 1],
      ["stress", 1],
    ]),
  },
]

// Healthcare professional questions
const healthcareQuestions = [
  {
    text: "How often do you feel emotionally drained from your work?",
    type: "radio",
    category: "emotional",
    forProfessions: ["healthcare"],
    required: true,
    options: [
      { label: "Never", value: "never" },
      { label: "Rarely", value: "rarely" },
      { label: "Sometimes", value: "sometimes" },
      { label: "Often", value: "often" },
      { label: "Almost always", value: "almost_always" },
    ],
    conditionMapping: new Map([
      ["burnout", 2],
      ["stress", 1],
    ]),
  },
  {
    text: "Do you feel you have adequate support systems at work?",
    type: "radio",
    category: "social",
    forProfessions: ["healthcare"],
    required: true,
    options: [
      { label: "Definitely yes", value: "definitely_yes" },
      { label: "Somewhat yes", value: "somewhat_yes" },
      { label: "Neutral", value: "neutral" },
      { label: "Somewhat no", value: "somewhat_no" },
      { label: "Definitely no", value: "definitely_no" },
    ],
    conditionMapping: new Map([
      ["burnout", 1],
      ["stress", 1],
    ]),
  },
]

// Business professional questions
const businessQuestions = [
  {
    text: "How often do you work beyond your scheduled hours?",
    type: "radio",
    category: "behavioral",
    forProfessions: ["business"],
    required: true,
    options: [
      { label: "Never", value: "never" },
      { label: "Rarely", value: "rarely" },
      { label: "Sometimes", value: "sometimes" },
      { label: "Often", value: "often" },
      { label: "Almost always", value: "almost_always" },
    ],
    conditionMapping: new Map([
      ["burnout", 1.5],
      ["stress", 1],
    ]),
  },
  {
    text: "Do you feel your work is properly recognized and valued?",
    type: "radio",
    category: "emotional",
    forProfessions: ["business"],
    required: true,
    options: [
      { label: "Definitely yes", value: "definitely_yes" },
      { label: "Somewhat yes", value: "somewhat_yes" },
      { label: "Neutral", value: "neutral" },
      { label: "Somewhat no", value: "somewhat_no" },
      { label: "Definitely no", value: "definitely_no" },
    ],
    conditionMapping: new Map([
      ["burnout", 1],
      ["depression", 0.5],
    ]),
  },
]

// Age-specific questions for young adults (18-30)
const youngAdultQuestions = [
  {
    text: "How often do you compare yourself to others on social media?",
    type: "radio",
    category: "social",
    ageRange: { min: 18, max: 30 },
    required: true,
    options: [
      { label: "Never", value: "never" },
      { label: "Rarely", value: "rarely" },
      { label: "Sometimes", value: "sometimes" },
      { label: "Often", value: "often" },
      { label: "Almost always", value: "almost_always" },
    ],
    conditionMapping: new Map([
      ["anxiety", 1],
      ["depression", 1],
    ]),
  },
  {
    text: "Do you feel pressure to achieve certain life milestones (career, relationships, etc.)?",
    type: "scale",
    category: "emotional",
    ageRange: { min: 18, max: 30 },
    required: true,
    minValue: 1,
    maxValue: 10,
    minLabel: "No pressure",
    maxLabel: "Extreme pressure",
    conditionMapping: new Map([
      ["anxiety", 1],
      ["stress", 1],
    ]),
  },
]

// Age-specific questions for middle-aged adults (31-60)
const middleAgedQuestions = [
  {
    text: "How often do you feel pulled between work responsibilities and family needs?",
    type: "radio",
    category: "social",
    ageRange: { min: 31, max: 60 },
    required: true,
    options: [
      { label: "Never", value: "never" },
      { label: "Rarely", value: "rarely" },
      { label: "Sometimes", value: "sometimes" },
      { label: "Often", value: "often" },
      { label: "Almost always", value: "almost_always" },
    ],
    conditionMapping: new Map([
      ["stress", 1.5],
      ["burnout", 1],
    ]),
  },
  {
    text: "Do you worry about your future financial security?",
    type: "scale",
    category: "emotional",
    ageRange: { min: 31, max: 60 },
    required: true,
    minValue: 1,
    maxValue: 10,
    minLabel: "Not at all",
    maxLabel: "Extremely worried",
    conditionMapping: new Map([
      ["anxiety", 1],
      ["stress", 1],
    ]),
  },
]

// Age-specific questions for older adults (61+)
const olderAdultQuestions = [
  {
    text: "How often do you feel lonely or isolated?",
    type: "radio",
    category: "social",
    ageRange: { min: 61, max: 120 },
    required: true,
    options: [
      { label: "Never", value: "never" },
      { label: "Rarely", value: "rarely" },
      { label: "Sometimes", value: "sometimes" },
      { label: "Often", value: "often" },
      { label: "Almost always", value: "almost_always" },
    ],
    conditionMapping: new Map([
      ["depression", 1.5],
      ["anxiety", 0.5],
    ]),
  },
  {
    text: "Do you worry about your health or physical limitations?",
    type: "scale",
    category: "physical",
    ageRange: { min: 61, max: 120 },
    required: true,
    minValue: 1,
    maxValue: 10,
    minLabel: "Not at all",
    maxLabel: "Extremely worried",
    conditionMapping: new Map([
      ["anxiety", 1],
      ["depression", 0.5],
    ]),
  },
]

// Combine all questions
const allQuestions = [
  ...demographicQuestions,
  ...generalQuestions,
  ...studentQuestions,
  ...healthcareQuestions,
  ...businessQuestions,
  ...youngAdultQuestions,
  ...middleAgedQuestions,
  ...olderAdultQuestions,
]

// Seed the database
async function seedDatabase() {
  try {
    // Clear existing questions
    await AssessmentQuestion.deleteMany({})

    // Insert new questions
    await AssessmentQuestion.insertMany(allQuestions)

    console.log("Database seeded successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()
