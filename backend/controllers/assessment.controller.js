const Assessment = require("../models/Assessment.model")
const AssessmentQuestion = require("../models/AssessmentQuestion.model")
const User = require("../models/User.model")
const AppError = require("../utils/errorResponse")
const PDFDocument = require("pdfkit")

// Helper function for responses
const sendResponse = (res, statusCode, data) => {
  res.status(statusCode).json({
    success: true,
    ...data,
  })
}

// Start a new assessment
exports.startAssessment = async (req, res, next) => {
  try {
    // Create a new assessment
    const assessment = await Assessment.create({
      user: req.user.id,
      status: "in_progress",
    })

    sendResponse(res, 201, { assessment })
  } catch (err) {
    next(err)
  }
}

// Get questions for an assessment
exports.getQuestions = async (req, res, next) => {
  try {
    const { assessmentId } = req.params

    // Verify assessment belongs to user
    const assessment = await Assessment.findOne({
      _id: assessmentId,
      user: req.user.id,
    })

    if (!assessment) {
      throw new AppError("Assessment not found", 404)
    }

    // Get user data for personalized questions
    const user = await User.findById(req.user.id)

    // Get initial questions if no responses yet
    if (assessment.responses.length === 0) {
      // Get demographic questions first (age, gender, profession)
      const demographicQuestions = await AssessmentQuestion.find({
        category: "demographic",
        isInitial: true,
      }).limit(3)

      sendResponse(res, 200, { questions: demographicQuestions })
      return
    }

    // Get user's demographic info from responses
    const ageResponse = assessment.responses.find((r) => r.question.toString() === process.env.AGE_QUESTION_ID)
    const genderResponse = assessment.responses.find((r) => r.question.toString() === process.env.GENDER_QUESTION_ID)
    const professionResponse = assessment.responses.find(
      (r) => r.question.toString() === process.env.PROFESSION_QUESTION_ID,
    )

    const age = ageResponse ? Number.parseInt(ageResponse.answer) : null
    const gender = genderResponse ? genderResponse.answer : null
    const profession = professionResponse ? professionResponse.answer : null

    // Get the last question answered
    const lastResponse = assessment.responses[assessment.responses.length - 1]
    const lastQuestion = await AssessmentQuestion.findById(lastResponse.question)

    // Determine next questions based on rules
    let nextQuestionId = null

    // Check if there are specific rules for the next question
    if (lastQuestion.nextQuestionRules && lastQuestion.nextQuestionRules.length > 0) {
      for (const rule of lastQuestion.nextQuestionRules) {
        let conditionMet = false

        switch (rule.condition) {
          case "equals":
            conditionMet = lastResponse.answer === rule.value
            break
          case "contains":
            conditionMet = Array.isArray(lastResponse.answer) && lastResponse.answer.includes(rule.value)
            break
          case "greaterThan":
            conditionMet = Number.parseFloat(lastResponse.answer) > rule.value
            break
          case "lessThan":
            conditionMet = Number.parseFloat(lastResponse.answer) < rule.value
            break
          case "between":
            conditionMet =
              Number.parseFloat(lastResponse.answer) >= rule.value[0] &&
              Number.parseFloat(lastResponse.answer) <= rule.value[1]
            break
          case "any":
            conditionMet = true
            break
        }

        if (conditionMet) {
          nextQuestionId = rule.nextQuestionId
          break
        }
      }
    }

    // If no specific rule matched, use default next question
    if (!nextQuestionId && lastQuestion.defaultNextQuestionId) {
      nextQuestionId = lastQuestion.defaultNextQuestionId
    }

    // If we have a specific next question
    if (nextQuestionId) {
      const nextQuestion = await AssessmentQuestion.findById(nextQuestionId)

      // Check if this question is appropriate for the user's demographics
      const isAgeAppropriate = age === null || (age >= nextQuestion.ageRange.min && age <= nextQuestion.ageRange.max)
      const isGenderAppropriate = gender === null || nextQuestion.forGender.includes(gender)
      const isProfessionAppropriate =
        profession === null ||
        nextQuestion.forProfessions.length === 0 ||
        nextQuestion.forProfessions.includes(profession)

      if (isAgeAppropriate && isGenderAppropriate && isProfessionAppropriate) {
        sendResponse(res, 200, { questions: [nextQuestion] })
        return
      }
    }

    // If we don't have a specific next question or it's not appropriate, get questions based on demographics
    const query = {
      _id: { $nin: assessment.responses.map((r) => r.question) }, // Exclude already answered questions
    }

    // Add demographic filters if available
    if (age !== null) {
      query.ageRange = {
        min: { $lte: age },
        max: { $gte: age },
      }
    }

    if (gender !== null) {
      query.forGender = gender
    }

    if (profession !== null && profession !== "other") {
      query.forProfessions = { $in: [profession, []] }
    }

    // Get next batch of questions
    const nextQuestions = await AssessmentQuestion.find(query).limit(3)

    // If no more questions, return an empty array
    if (nextQuestions.length === 0) {
      sendResponse(res, 200, { questions: [] })
      return
    }

    sendResponse(res, 200, { questions: nextQuestions })
  } catch (err) {
    next(err)
  }
}

// Save a response to a question
exports.saveResponse = async (req, res, next) => {
  try {
    const { assessmentId } = req.params
    const { questionId, answer } = req.body

    // Validate inputs
    if (!questionId || answer === undefined) {
      throw new AppError("Question ID and answer are required", 400)
    }

    // Verify assessment belongs to user
    const assessment = await Assessment.findOne({
      _id: assessmentId,
      user: req.user.id,
      status: "in_progress",
    })

    if (!assessment) {
      throw new AppError("Assessment not found or already completed", 404)
    }

    // Verify question exists
    const question = await AssessmentQuestion.findById(questionId)
    if (!question) {
      throw new AppError("Question not found", 404)
    }

    // Add response to assessment
    assessment.responses.push({
      question: questionId,
      answer,
    })

    await assessment.save()

    // Get next questions based on this response
    const nextQuestions = []

    // Check if there are specific rules for the next question
    if (question.nextQuestionRules && question.nextQuestionRules.length > 0) {
      for (const rule of question.nextQuestionRules) {
        let conditionMet = false

        switch (rule.condition) {
          case "equals":
            conditionMet = answer === rule.value
            break
          case "contains":
            conditionMet = Array.isArray(answer) && answer.includes(rule.value)
            break
          case "greaterThan":
            conditionMet = Number.parseFloat(answer) > rule.value
            break
          case "lessThan":
            conditionMet = Number.parseFloat(answer) < rule.value
            break
          case "between":
            conditionMet = Number.parseFloat(answer) >= rule.value[0] && Number.parseFloat(answer) <= rule.value[1]
            break
          case "any":
            conditionMet = true
            break
        }

        if (conditionMet && rule.nextQuestionId) {
          const nextQuestion = await AssessmentQuestion.findById(rule.nextQuestionId)
          if (nextQuestion) {
            nextQuestions.push(nextQuestion)
            break // Only use the first matching rule
          }
        }
      }
    }

    // If no specific rule matched, use default next question
    if (nextQuestions.length === 0 && question.defaultNextQuestionId) {
      const defaultNextQuestion = await AssessmentQuestion.findById(question.defaultNextQuestionId)
      if (defaultNextQuestion) {
        nextQuestions.push(defaultNextQuestion)
      }
    }

    // If still no questions, get the next appropriate questions
    if (nextQuestions.length === 0) {
      // Get user's demographic info from responses
      const ageResponse = assessment.responses.find((r) => r.question.toString() === process.env.AGE_QUESTION_ID)
      const genderResponse = assessment.responses.find((r) => r.question.toString() === process.env.GENDER_QUESTION_ID)
      const professionResponse = assessment.responses.find(
        (r) => r.question.toString() === process.env.PROFESSION_QUESTION_ID,
      )

      const age = ageResponse ? Number.parseInt(ageResponse.answer) : null
      const gender = genderResponse ? genderResponse.answer : null
      const profession = professionResponse ? professionResponse.answer : null

      const query = {
        _id: { $nin: assessment.responses.map((r) => r.question) }, // Exclude already answered questions
      }

      // Add demographic filters if available
      if (age !== null) {
        query.ageRange = {
          min: { $lte: age },
          max: { $gte: age },
        }
      }

      if (gender !== null) {
        query.forGender = gender
      }

      if (profession !== null && profession !== "other") {
        query.forProfessions = { $in: [profession, []] }
      }

      // Get next batch of questions
      const additionalQuestions = await AssessmentQuestion.find(query).limit(3)
      nextQuestions.push(...additionalQuestions)
    }

    sendResponse(res, 200, { questions: nextQuestions })
  } catch (err) {
    next(err)
  }
}

// Complete an assessment and generate results
exports.completeAssessment = async (req, res, next) => {
  try {
    const { assessmentId } = req.params

    // Verify assessment belongs to user
    const assessment = await Assessment.findOne({
      _id: assessmentId,
      user: req.user.id,
      status: "in_progress",
    }).populate("responses.question")

    if (!assessment) {
      throw new AppError("Assessment not found or already completed", 404)
    }

    // Analyze responses to determine condition and severity
    const result = await analyzeAssessment(assessment)

    // Update assessment with results
    assessment.status = "completed"
    assessment.completedAt = new Date()
    assessment.result = result
    await assessment.save()

    sendResponse(res, 200, { result })
  } catch (err) {
    next(err)
  }
}

// Analyze assessment responses to generate a result
async function analyzeAssessment(assessment) {
  // Get demographic info
  const ageResponse = assessment.responses.find((r) => r.question._id.toString() === process.env.AGE_QUESTION_ID)
  const genderResponse = assessment.responses.find((r) => r.question._id.toString() === process.env.GENDER_QUESTION_ID)
  const professionResponse = assessment.responses.find(
    (r) => r.question._id.toString() === process.env.PROFESSION_QUESTION_ID,
  )

  const age = ageResponse ? Number.parseInt(ageResponse.answer) : 30 // Default age
  const gender = genderResponse ? genderResponse.answer : "prefer_not_to_say"
  const profession = professionResponse ? professionResponse.answer : "other"

  // Calculate scores for different conditions
  const conditionScores = {
    anxiety: 0,
    depression: 0,
    stress: 0,
    burnout: 0,
    insomnia: 0,
  }

  // Process each response
  for (const response of assessment.responses) {
    const question = response.question

    // Skip demographic questions
    if (question.category === "demographic") {
      continue
    }

    // Process based on question type and condition mapping
    if (question.conditionMapping && question.conditionMapping.size > 0) {
      for (const [condition, weight] of question.conditionMapping.entries()) {
        if (conditionScores.hasOwnProperty(condition)) {
          let score = 0

          switch (question.type) {
            case "scale":
              score = Number.parseInt(response.answer) * weight
              break
            case "radio":
            case "select":
              // Find the option's value in the question's options
              const option = question.options.find((opt) => opt.value === response.answer)
              if (option) {
                const optionIndex = question.options.indexOf(option)
                score = (optionIndex + 1) * weight // Higher index = higher score
              }
              break
            case "checkbox":
              if (Array.isArray(response.answer)) {
                // More selected options = higher score
                score = response.answer.length * weight
              }
              break
            default:
              score = weight // Default weight for text/number questions
          }

          conditionScores[condition] += score
        }
      }
    }
  }

  // Normalize scores based on number of questions for each condition
  const maxScores = {
    anxiety: 50,
    depression: 50,
    stress: 50,
    burnout: 50,
    insomnia: 30,
  }

  for (const condition in conditionScores) {
    conditionScores[condition] = (conditionScores[condition] / maxScores[condition]) * 10
    if (conditionScores[condition] > 10) conditionScores[condition] = 10
  }

  // Determine primary condition
  const primaryCondition = Object.keys(conditionScores).reduce((a, b) =>
    conditionScores[a] > conditionScores[b] ? a : b,
  )

  // Get severity level (1-10)
  const severityLevel = Math.round(conditionScores[primaryCondition])

  // Generate result based on condition and severity
  const result = {
    condition: getConditionName(primaryCondition),
    description: getConditionDescription(primaryCondition, severityLevel),
    severityLevel,
    recommendations: getRecommendations(primaryCondition, severityLevel, age, profession),
  }

  return result
}

// Helper functions for generating results
function getConditionName(condition) {
  const names = {
    anxiety: "Anxiety",
    depression: "Depression",
    stress: "Stress",
    burnout: "Burnout",
    insomnia: "Sleep Disorder",
  }

  return names[condition] || "General Mental Health Concern"
}

function getConditionDescription(condition, severity) {
  const descriptions = {
    anxiety: [
      "You're experiencing mild anxiety symptoms. This is common and can often be managed with self-care techniques.",
      "You're showing moderate anxiety symptoms. This level of anxiety may be interfering with your daily life.",
      "You're experiencing severe anxiety symptoms. This level of anxiety is significantly impacting your wellbeing.",
    ],
    depression: [
      "You're showing mild depressive symptoms. These feelings may come and go but aren't severely impacting your life.",
      "You're experiencing moderate depressive symptoms. These feelings are likely affecting your daily functioning.",
      "You're showing signs of severe depression. This level of depression is significantly impacting your daily life and requires professional attention.",
    ],
    stress: [
      "You're experiencing mild stress. Some stress is a normal part of life, but it's good to monitor it.",
      "You're showing moderate stress levels. This amount of stress may be affecting your wellbeing and productivity.",
      "You're experiencing severe stress. This level of stress can have serious impacts on your physical and mental health.",
    ],
    burnout: [
      "You're showing early signs of burnout. This is a good time to evaluate your work-life balance.",
      "You're experiencing moderate burnout symptoms. Your work and personal life are likely being affected.",
      "You're showing severe burnout symptoms. This requires immediate attention to prevent further deterioration.",
    ],
    insomnia: [
      "You're experiencing mild sleep difficulties. These occasional issues are common but worth addressing.",
      "You're showing moderate sleep problems. Your sleep difficulties are likely affecting your daytime functioning.",
      "You're experiencing severe sleep disorder symptoms. This level of sleep disruption is significantly impacting your health.",
    ],
  }

  const severityIndex = severity <= 3 ? 0 : severity <= 6 ? 1 : 2

  return (
    descriptions[condition][severityIndex] ||
    "Your assessment indicates some mental health concerns that may benefit from further evaluation."
  )
}

function getRecommendations(condition, severity, age, profession) {
  const generalRecommendations = [
    "Practice regular physical exercise for at least 30 minutes daily",
    "Maintain a consistent sleep schedule",
    "Practice mindfulness meditation for 10-15 minutes daily",
    "Limit caffeine and alcohol consumption",
    "Stay connected with supportive friends and family",
  ]

  const conditionSpecificRecommendations = {
    anxiety: [
      "Practice deep breathing exercises when feeling anxious",
      "Challenge negative thought patterns",
      "Gradually expose yourself to anxiety-triggering situations",
      "Consider cognitive-behavioral therapy (CBT) techniques",
      "Limit exposure to news and social media if they trigger anxiety",
    ],
    depression: [
      "Set small, achievable daily goals",
      "Engage in activities you previously enjoyed, even if you don't feel like it",
      "Maintain social connections even when you feel like isolating",
      "Get regular exposure to natural sunlight",
      "Consider speaking with a mental health professional about therapy options",
    ],
    stress: [
      "Identify and reduce sources of stress when possible",
      "Practice time management techniques",
      "Set boundaries between work and personal life",
      "Take regular breaks during work",
      "Try progressive muscle relaxation techniques",
    ],
    burnout: [
      "Evaluate your work responsibilities and consider delegating when possible",
      "Take time off to rest and recover",
      "Reconnect with activities and hobbies you enjoy",
      "Set clear boundaries between work and personal time",
      "Consider speaking with your supervisor about workload concerns",
    ],
    insomnia: [
      "Create a relaxing bedtime routine",
      "Keep your bedroom dark, quiet, and cool",
      "Avoid screens for at least an hour before bed",
      "Limit daytime napping",
      "Consider sleep restriction therapy techniques",
    ],
  }

  // Age-specific recommendations
  let ageRecommendations = []
  if (age < 18) {
    ageRecommendations = [
      "Talk to a trusted adult about how you're feeling",
      "Balance screen time with other activities",
    ]
  } else if (age >= 65) {
    ageRecommendations = [
      "Stay socially active in your community",
      "Engage in cognitive activities like puzzles or learning new skills",
    ]
  }

  // Profession-specific recommendations
  let professionRecommendations = []
  if (profession === "student") {
    professionRecommendations = [
      "Break study sessions into manageable chunks",
      "Join study groups for social support",
      "Utilize campus mental health resources",
    ]
  } else if (profession === "healthcare") {
    professionRecommendations = [
      "Practice self-compassion and recognize the importance of your work",
      "Utilize peer support systems",
      "Consider debriefing after difficult cases",
    ]
  } else if (profession === "business") {
    professionRecommendations = [
      "Take short breaks throughout the workday",
      "Practice stress management techniques before important meetings",
      "Set realistic deadlines and expectations",
    ]
  }

  // Severity-specific recommendations
  if (severity >= 7) {
    return [
      "We strongly recommend consulting with a mental health professional as soon as possible",
      "Consider reaching out to a crisis helpline if you're feeling overwhelmed",
      ...conditionSpecificRecommendations[condition].slice(0, 3),
      ...generalRecommendations.slice(0, 2),
      ...ageRecommendations.slice(0, 1),
      ...professionRecommendations.slice(0, 1),
    ]
  } else if (severity >= 4) {
    return [
      "Consider speaking with a mental health professional for further guidance",
      ...conditionSpecificRecommendations[condition].slice(0, 3),
      ...generalRecommendations.slice(0, 3),
      ...ageRecommendations.slice(0, 1),
      ...professionRecommendations.slice(0, 1),
    ]
  } else {
    return [
      ...conditionSpecificRecommendations[condition].slice(0, 2),
      ...generalRecommendations.slice(0, 3),
      ...ageRecommendations.slice(0, 1),
      ...professionRecommendations.slice(0, 1),
    ]
  }
}

// Get all assessments for a user
exports.getUserAssessments = async (req, res, next) => {
  try {
    const assessments = await Assessment.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select("status createdAt completedAt result")

    sendResponse(res, 200, { assessments })
  } catch (err) {
    next(err)
  }
}

// Get a specific assessment
exports.getAssessment = async (req, res, next) => {
  try {
    const { assessmentId } = req.params

    // Check if user is the owner or a counselor with access
    const assessment = await Assessment.findById(assessmentId)
      .populate({
        path: "responses.question",
        select: "text type options",
      })
      .populate("user", "name email")

    if (!assessment) {
      throw new AppError("Assessment not found", 404)
    }

    // Check if user has permission to view this assessment
    const isOwner = assessment.user._id.toString() === req.user.id
    const isCounselor = req.user.role === "counselor"
    const isAdmin = req.user.role === "admin"

    if (!isOwner && !isCounselor && !isAdmin) {
      throw new AppError("You don't have permission to view this assessment", 403)
    }

    // If counselor, check if they have access to this user
    if (isCounselor) {
      // Logic to check if counselor has access to this user
      // This would depend on your application's relationship model
      // For example, check if the user is a client of the counselor
      const hasAccess = await checkCounselorAccess(req.user.id, assessment.user._id)
      if (!hasAccess) {
        throw new AppError("You don't have permission to view this client's assessment", 403)
      }
    }

    sendResponse(res, 200, { assessment })
  } catch (err) {
    next(err)
  }
}

// Helper function to check if counselor has access to a user
async function checkCounselorAccess(counselorId, userId) {
  // This would depend on your application's relationship model
  // For example, check if the user is a client of the counselor
  // For now, we'll return true for demonstration purposes
  return true
}

// Get assessments for a counselor's client
exports.getClientAssessments = async (req, res, next) => {
  try {
    const { clientId } = req.params

    // Check if counselor has access to this client
    const hasAccess = await checkCounselorAccess(req.user.id, clientId)
    if (!hasAccess && req.user.role !== "admin") {
      throw new AppError("You don't have permission to view this client's assessments", 403)
    }

    // Get client info
    const client = await User.findById(clientId).select("name email")
    if (!client) {
      throw new AppError("Client not found", 404)
    }

    // Get client's assessments
    const assessments = await Assessment.find({ user: clientId })
      .sort({ createdAt: -1 })
      .select("status createdAt completedAt result")

    sendResponse(res, 200, { client, assessments })
  } catch (err) {
    next(err)
  }
}

// Get all clients for a counselor
exports.getCounselorClients = async (req, res, next) => {
  try {
    // This would depend on your application's relationship model
    // For now, we'll get all users with role "user" for demonstration purposes
    const clients = await User.find({ role: "user" }).select("name email")

    sendResponse(res, 200, { clients })
  } catch (err) {
    next(err)
  }
}

// Generate PDF for an assessment
exports.getAssessmentPdf = async (req, res, next) => {
  try {
    const { assessmentId } = req.params

    // Get assessment with populated data
    const assessment = await Assessment.findById(assessmentId)
      .populate({
        path: "responses.question",
        select: "text type options",
      })
      .populate("user", "name email")

    if (!assessment) {
      throw new AppError("Assessment not found", 404)
    }

    // Check if user has permission to view this assessment
    const isOwner = assessment.user._id.toString() === req.user.id
    const isCounselor = req.user.role === "counselor"
    const isAdmin = req.user.role === "admin"

    if (!isOwner && !isCounselor && !isAdmin) {
      throw new AppError("You don't have permission to view this assessment", 403)
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 })

    // Set response headers
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=assessment-${assessmentId}.pdf`)

    // Pipe PDF to response
    doc.pipe(res)

    // Add content to PDF
    doc.fontSize(20).text("Mental Health Assessment Report", { align: "center" })
    doc.moveDown()

    // Add user info
    doc.fontSize(12).text(`Name: ${assessment.user.name}`)
    doc.text(`Email: ${assessment.user.email}`)
    doc.text(`Date: ${new Date(assessment.createdAt).toLocaleDateString()}`)
    doc.moveDown()

    // Add assessment result if completed
    if (assessment.status === "completed" && assessment.result) {
      doc.fontSize(16).text("Assessment Result", { underline: true })
      doc.moveDown()
      doc.fontSize(14).text(`Condition: ${assessment.result.condition}`)
      doc.fontSize(12).text(assessment.result.description)
      doc.moveDown()

      doc.fontSize(14).text(`Severity Level: ${assessment.result.severityLevel}/10`)
      doc.moveDown()

      doc.fontSize(14).text("Recommendations:")
      assessment.result.recommendations.forEach((recommendation, index) => {
        doc.fontSize(12).text(`${index + 1}. ${recommendation}`)
      })
      doc.moveDown()
    }

    // Add questions and answers
    doc.fontSize(16).text("Assessment Questions & Answers", { underline: true })
    doc.moveDown()

    assessment.responses.forEach((response, index) => {
      doc.fontSize(12).text(`${index + 1}. ${response.question.text}`)

      let answerText = ""
      if (Array.isArray(response.answer)) {
        answerText = response.answer.join(", ")
      } else {
        answerText = response.answer.toString()
      }

      doc.fontSize(10).text(`Answer: ${answerText}`, { indent: 20 })
      doc.moveDown()
    })

    // Finalize PDF
    doc.end()
  } catch (err) {
    next(err)
  }
}

// Admin routes for managing questions

// Create a new assessment question
exports.createQuestion = async (req, res, next) => {
  try {
    const question = await AssessmentQuestion.create(req.body)
    sendResponse(res, 201, { question })
  } catch (err) {
    next(err)
  }
}

// Update an assessment question
exports.updateQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params
    const question = await AssessmentQuestion.findByIdAndUpdate(questionId, req.body, {
      new: true,
      runValidators: true,
    })

    if (!question) {
      throw new AppError("Question not found", 404)
    }

    sendResponse(res, 200, { question })
  } catch (err) {
    next(err)
  }
}

// Delete an assessment question
exports.deleteQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params
    const question = await AssessmentQuestion.findByIdAndDelete(questionId)

    if (!question) {
      throw new AppError("Question not found", 404)
    }

    sendResponse(res, 200, { message: "Question deleted successfully" })
  } catch (err) {
    next(err)
  }
}

// Get all assessment questions
exports.getAllQuestions = async (req, res, next) => {
  try {
    const questions = await AssessmentQuestion.find().sort({ category: 1, createdAt: 1 })
    sendResponse(res, 200, { questions })
  } catch (err) {
    next(err)
  }
}
