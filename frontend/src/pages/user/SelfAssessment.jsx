"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function SelfAssessment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [assessment, setAssessment] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    startAssessment();
  }, []);

  const startAssessment = async () => {
    try {
      setLoading(true);
      const response = await api.post("/assessments/start");
      if (!response?.assessment?._id) {
        throw new Error("Invalid assessment response");
      }
      setAssessment(response.assessment);

      // Get initial questions
      const questionsResponse = await api.get(`/assessments/questions/${response.assessment._id}`);
    if (!questionsResponse?.questions) {
      throw new Error("Invalid questions response");
    }
    setQuestions(questionsResponse.questions);
      setCurrentStep(0);
      setAnswers({});
      setError(null);
    } catch (err) {
      setError("Failed to start assessment. Please try again.");
      console.error("Error starting assessment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = async () => {
    if (!questions[currentStep]) {
      setError("Questions are not loaded yet. Please wait.");
      return;
    }

    const currentQuestion = questions[currentStep];

    // Validate answer
    if (!answers[currentQuestion._id] && currentQuestion.required) {
      setError("Please answer this question before continuing.");
      return;
    }

    setError(null);

    // If this is the last question, submit the assessment
    if (currentStep === questions.length - 1) {
      await submitAssessment();
      return;
    }

    // Otherwise, move to the next question
    setCurrentStep(currentStep + 1);

    // If we're at the last loaded question, fetch more questions
    if (currentStep === questions.length - 2) {
      try {
        const response = await api.post(
          `/assessments/respond/${assessment._id}`,
          {
            questionId: currentQuestion._id,
            answer: answers[currentQuestion._id],
          }
        );

        if (response.questions && response.questions.length > 0) {
          setQuestions([...questions, ...response.questions]);
        }
      } catch (err) {
        setError("Failed to load next questions. Please try again.");
        console.error("Error loading next questions:", err);
      }
    }
  };

  const submitAssessment = async () => {
    try {
      setSubmitting(true);

      // Submit the final answer
      const currentQuestion = questions[currentStep];
      await api.post(`/assessments/respond/${assessment._id}`, {
        questionId: currentQuestion._id,
        answer: answers[currentQuestion._id],
      });

      // Complete the assessment
      const resultResponse = await api.post(
        `/assessments/complete/${assessment._id}`
      );
      setResult(resultResponse.result);
    } catch (err) {
      setError("Failed to submit assessment. Please try again.");
      console.error("Error submitting assessment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case "text":
        return (
          <div className="mb-4">
            <input
              type="text"
              className="w-full p-3 border rounded-md"
              placeholder="Type your answer here..."
              value={answers[question._id] || ""}
              onChange={(e) => handleAnswer(question._id, e.target.value)}
            />
          </div>
        );

      case "number":
        return (
          <div className="mb-4">
            <input
              type="number"
              className="w-full p-3 border rounded-md"
              placeholder="Enter a number..."
              value={answers[question._id] || ""}
              onChange={(e) => handleAnswer(question._id, e.target.value)}
            />
          </div>
        );

      case "select":
        return (
          <div className="mb-4">
            <select
              className="w-full p-3 border rounded-md bg-white"
              value={answers[question._id] || ""}
              onChange={(e) => handleAnswer(question._id, e.target.value)}
            >
              <option value="">Select an option</option>
              {question.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case "radio":
        return (
          <div className="mb-4 space-y-2">
            {question.options.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name={question._id}
                  value={option.value}
                  checked={answers[question._id] === option.value}
                  onChange={() => handleAnswer(question._id, option.value)}
                  className="h-4 w-4 text-blue-600"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <div className="mb-4 space-y-2">
            {question.options.map((option) => {
              const selectedOptions = answers[question._id] || [];
              return (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={selectedOptions.includes(option.value)}
                    onChange={(e) => {
                      const newSelectedOptions = e.target.checked
                        ? [...selectedOptions, option.value]
                        : selectedOptions.filter(
                            (value) => value !== option.value
                          );
                      handleAnswer(question._id, newSelectedOptions);
                    }}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        );

      case "scale":
        return (
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">
                {question.minLabel || "Low"}
              </span>
              <span className="text-sm text-gray-500">
                {question.maxLabel || "High"}
              </span>
            </div>
            <div className="flex justify-between space-x-2">
              {Array.from(
                { length: question.maxValue - question.minValue + 1 },
                (_, i) => i + question.minValue
              ).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`flex-1 py-2 border rounded-md ${
                    answers[question._id] === value.toString()
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => handleAnswer(question._id, value.toString())}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return <p>Unsupported question type</p>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading assessment...</span>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Assessment Complete</h1>
            <p className="text-gray-600">
              Thank you for completing the assessment.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Your Results</h2>
            <div className="p-4 bg-blue-50 rounded-lg mb-4">
              <h3 className="font-bold text-lg mb-2">{result.condition}</h3>
              <p className="text-gray-700">{result.description}</p>
            </div>

            <h3 className="font-bold text-lg mb-2">Severity Level</h3>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div
                className={`h-4 rounded-full ${
                  result.severityLevel < 3
                    ? "bg-green-500"
                    : result.severityLevel < 6
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${(result.severityLevel / 10) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              {result.severityLevel < 3
                ? "Mild: Your symptoms suggest a mild condition."
                : result.severityLevel < 6
                ? "Moderate: Your symptoms suggest a moderate condition that may benefit from professional support."
                : "Severe: Your symptoms suggest a more serious condition. We strongly recommend professional help."}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Recommendations</h2>
            <ul className="space-y-3">
              {result.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between">
            <button
              onClick={startAssessment}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Take Another Assessment
            </button>

            <button
              onClick={() => navigate("/user/assessments")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              View All Assessments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              Mental Health Self-Assessment
            </h1>
            <span className="text-sm text-gray-500">
              Question {currentStep + 1} of {questions.length}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{
                width: `${((currentStep + 1) / questions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {questions.length > 0 && currentStep < questions.length && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">
              {questions[currentStep].text}
            </h2>
            {questions[currentStep].description && (
              <p className="text-gray-600 mb-4">
                {questions[currentStep].description}
              </p>
            )}

            {renderQuestion(questions[currentStep])}
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center px-4 py-2 rounded-md ${
              currentStep === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={submitting}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Submitting...
              </>
            ) : currentStep === questions.length - 1 ? (
              <>
                Complete
                <CheckCircle className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
