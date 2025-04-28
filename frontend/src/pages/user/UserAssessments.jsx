"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../../services/api"
import { FileText, Calendar, Clock, ChevronRight, AlertCircle, Loader2 } from "lucide-react"

export default function UserAssessments() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAssessments()
  }, [])

  const fetchAssessments = async () => {
    try {
      setLoading(true)
      const response = await api.get("/assessments/user")
      setAssessments(response.assessments)
      setError(null)
    } catch (err) {
      setError("Failed to load your assessments. Please try again later.")
      console.error("Error fetching assessments:", err)
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

  const getSeverityColor = (level) => {
    if (level < 3) return "bg-green-100 text-green-800"
    if (level < 6) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getSeverityText = (level) => {
    if (level < 3) return "Mild"
    if (level < 6) return "Moderate"
    return "Severe"
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Assessments</h1>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading assessments...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Assessments</h1>
        <button
          onClick={() => navigate("/user/assessment")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Take New Assessment
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {assessments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 text-lg">No assessments found</p>
          <p className="text-gray-500 mb-4">Take your first assessment to track your mental health</p>
          <button
            onClick={() => navigate("/user/assessment")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Start Assessment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {assessments.map((assessment) => (
            <div
              key={assessment._id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/user/assessments/${assessment._id}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold mb-2">{assessment.result?.condition || "Incomplete Assessment"}</h2>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(assessment.createdAt)}</span>
                    <Clock className="h-4 w-4 ml-3 mr-1" />
                    <span>{formatTime(assessment.createdAt)}</span>
                  </div>
                  {assessment.result ? (
                    <p className="text-gray-700 line-clamp-2">{assessment.result.description}</p>
                  ) : (
                    <p className="text-yellow-600">This assessment was not completed.</p>
                  )}
                </div>
                <div className="flex items-center">
                  {assessment.result && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${getSeverityColor(
                        assessment.result.severityLevel,
                      )}`}
                    >
                      {getSeverityText(assessment.result.severityLevel)}
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
