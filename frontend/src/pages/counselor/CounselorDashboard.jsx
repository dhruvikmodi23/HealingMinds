"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../services/api"
import {
  CalendarIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowRightIcon,
  VideoCameraIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"

const CounselorDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalSessions: 0,
      upcomingSessions: 0,
      averageRating: 0,
      totalReviews: 0,
    },
    appointments: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch data in parallel
        const [statsData, appointmentsData] = await Promise.all([
          api.get("/counselors/stats"),
          api.get("/appointments/counselor"),
        ])

        setDashboardData({
          stats: {
            totalSessions: statsData?.totalSessions || 0,
            upcomingSessions: statsData?.upcomingSessions || 0,
            averageRating: statsData?.averageRating || 0,
            totalReviews: statsData?.totalReviews || 0,
          },
          appointments: Array.isArray(appointmentsData) ? appointmentsData : [],
        })
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError(err.message || "Failed to load dashboard data. Please try again later.")
        setDashboardData({
          stats: {
            totalSessions: 0,
            upcomingSessions: 0,
            averageRating: 0,
            totalReviews: 0,
          },
          appointments: [],
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatDate = (dateString) => {
    try {
      const options = { year: "numeric", month: "long", day: "numeric" }
      return new Date(dateString).toLocaleDateString(undefined, options)
    } catch {
      return "Invalid date"
    }
  }

  const formatTime = (dateString) => {
    try {
      const options = { hour: "2-digit", minute: "2-digit" }
      return new Date(dateString).toLocaleTimeString(undefined, options)
    } catch {
      return "Invalid time"
    }
  }

  const upcomingAppointments = dashboardData.appointments
    .filter((appt) => {
      try {
        return new Date(appt.dateTime) > new Date()
      } catch {
        return false
      }
    })
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
    .slice(0, 3)

  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <Link
              to="/login"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 mr-3">
                    <UserCircleIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Counselor Dashboard</h2>
                </div>
                <p className="text-gray-600">Manage your practice and help your clients</p>
              </div>
              <div className="flex space-x-4">
                <Link
                  to="/counselor/profileform"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                >
                  Edit Profile
                </Link>
                <Link
                  to="/counselor/availability"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  Set Availability
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-blue-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-100 p-3 mr-4">
                  <UserCircleIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Total Sessions</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {loading ? "--" : dashboardData.stats.totalSessions}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-blue-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-100 p-3 mr-4">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Upcoming Sessions</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {loading ? "--" : dashboardData.stats.upcomingSessions}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-blue-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-100 p-3 mr-4">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Average Rating</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {loading ? "--" : dashboardData.stats.averageRating?.toFixed(1) || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-8">
          <div className="px-6 py-5 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
              <Link to="/counselor/appointments" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-pulse flex justify-center">
                  <div className="h-8 w-8 bg-blue-200 rounded-full"></div>
                </div>
                <p className="text-gray-500 mt-2">Loading appointments...</p>
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">You don't have any upcoming appointments.</p>
              </div>
            ) : (
              <ul className="divide-y divide-blue-100">
                {upcomingAppointments.map((appointment) => (
                  <li key={appointment._id} className="py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center mb-3 sm:mb-0">
                        <img
                          className="h-12 w-12 rounded-full border-2 border-blue-100 object-cover"
                          src={appointment.user?.avatar || "/default-avatar.png"}
                          alt={appointment.user?.name || "Client"}
                          onError={(e) => {
                            e.target.src = "/default-avatar.png"
                          }}
                        />
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-gray-900">{appointment.user?.name || "Client"}</h4>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>{formatDate(appointment.dateTime)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>{formatTime(appointment.dateTime)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {appointment.type === "video" && (
                          <Link
                            to={`/counselor/video-chat/${appointment._id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <VideoCameraIcon className="mr-1 h-4 w-4" />
                            Join
                          </Link>
                        )}
                        <Link
                          to={`/counselor/chat/${appointment._id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-blue-700 bg-blue-100 hover:bg-blue-200"
                        >
                          <ChatBubbleOvalLeftEllipsisIcon className="mr-1 h-4 w-4" />
                          Chat
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/counselor/appointments"
            className="bg-white rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-100 p-3 mr-4">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Manage Appointments</h3>
                  <p className="text-sm text-gray-500 mt-1">View and manage your upcoming sessions</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <ArrowRightIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </Link>

          <Link
            to="/counselor/profile"
            className="bg-white rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-100 p-3 mr-4">
                  <UserCircleIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">View Profile</h3>
                  <p className="text-sm text-gray-500 mt-1">See how clients view your profile</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <ArrowRightIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CounselorDashboard