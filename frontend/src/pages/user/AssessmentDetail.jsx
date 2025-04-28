"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../../services/api"
import { ArrowLeft, Calendar, Clock, CheckCircle, AlertCircle, Loader2, Download } from "lucide-react"

export default function AssessmentDetail() {
  const { assessmentId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [assessment, setAssessment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAssessment()
  }, [assessmentId])

  const fetchAssessment = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/assessments/${assessmentId}`)
      setAssessment(response.assessment)
      setError(null)
    } catch (err) {
      setError("Failed to load assessment details. Please try again later.")
      console.error("Error fetching assessment:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const downloadAssessment = async () => {
    try {
      const response = await api.get(`/assessments/${assessmentId}/pdf`, {
        responseType: "blob",
      })

      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `assessment-${assessmentId}.pdf`)

      // Append to html link element page
      document.body.appendChild(link)

      // Start download
      link.click()

      // Clean up and remove the link
      link.parentNode.removeChild(link)
    } catch (err) {
      console.error("Error downloading assessment:", err)
      alert("Failed to download assessment. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading assessment details...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-3" />
            <p className="text-gray-600 text-lg">Assessment not found</p>
            <p className="text-gray-500 mb-4">
              The assessment you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <button
              onClick={() => navigate("/user/assessments")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Assessments
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("/user/assessments")}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Assessments
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{assessment.result?.condition || "Incomplete Assessment"}</h1>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(assessment.createdAt)}</span>
                <Clock className="h-4 w-4 ml-3 mr-1" />
                <span>{formatTime(assessment.createdAt)}</span>
              </div>
            </div>
            <button
              onClick={downloadAssessment}
              className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <Download className="h-4 w-4 mr-1" />
              Download PDF
            </button>
          </div>

          {!assessment.result ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
              <p className="text-yellow-700">This assessment was not completed.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">Assessment Result</h2>
                <div className="p-4 bg-blue-50 rounded-lg mb-4">
                  <h3 className="font-bold text-lg mb-2">{assessment.result.condition}</h3>
                  <p className="text-gray-700">{assessment.result.description}</p>
                </div>

                <h3 className="font-bold text-lg mb-2">Severity Level</h3>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className={`h-4 rounded-full ${
                      assessment.result.severityLevel < 3
                        ? "bg-green-500"
                        : assessment.result.severityLevel < 6
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${(assessment.result.severityLevel / 10) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {assessment.result.severityLevel < 3
                    ? "Mild: Your symptoms suggest a mild condition."
                    : assessment.result.severityLevel < 6
                      ? "Moderate: Your symptoms suggest a moderate condition that may benefit from professional support."
                      : "Severe: Your symptoms suggest a more serious condition. We strongly recommend professional help."}
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">Recommendations</h2>
                <ul className="space-y-3">
                  {assessment.result.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Assessment Questions & Answers</h2>
          {assessment.responses && assessment.responses.length > 0 ? (
            <div className="space-y-6">
              {assessment.responses.map((response, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <p className="font-medium mb-2">
                    {index + 1}. {response.question.text}
                  </p>
                  <div className="pl-6">
                    <p className="text-gray-700">
                      <span className="font-medium">Your answer: </span>
                      {Array.isArray(response.answer) ? response.answer.join(", ") : response.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No responses recorded for this assessment.</p>
          )}
        </div>
      </div>
    </div>
  )
}
