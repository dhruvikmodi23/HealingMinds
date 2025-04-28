"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../services/api"
import { ArrowLeft, FileText, Calendar, Clock, ChevronRight, AlertCircle, Loader2, User } from "lucide-react"

export default function ClientAssessments() {
  const { clientId } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchClientAssessments()
  }, [clientId])

  const fetchClientAssessments = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/assessments/client/${clientId}`)
      setClient(response.client)
      setAssessments(response.assessments)
      setError(null)
    } catch (err) {
      setError("Failed to load client assessments. Please try again later.")
      console.error("Error fetching client assessments:", err)
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
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading client assessments...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-3" />
            <p className="text-gray-600 text-lg">Client not found</p>
            <p className="text-gray-500 mb-4">
              The client you're looking for doesn't exist or you don't have permission to view their data.
            </p>
            <button
              onClick={() => navigate("/counselor/clients")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Clients
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
            onClick={() => navigate("/counselor/clients")}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Clients
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{client.name}</h1>
              <p className="text-gray-600">{client.email}</p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">Assessment History</h2>

        {assessments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 text-lg">No assessments found</p>
            <p className="text-gray-500">This client hasn't completed any assessments yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div
                key={assessment._id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/counselor/clients/${clientId}/assessments/${assessment._id}`)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold mb-2">
                      {assessment.result?.condition || "Incomplete Assessment"}
                    </h3>
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
    </div>
  )
}
