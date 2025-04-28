"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../services/api"
import {
  ChartBarIcon,
  UsersIcon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentAppointments, setRecentAppointments] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Use Promise.all to fetch data in parallel
        const [statsData, appointmentsData] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/appointments?limit=5"),
        ])

        setStats(
          statsData || {
            counts: { users: 0, counselors: 0, appointments: 0, pendingCounselors: 0 },
          },
        )

        setRecentAppointments(Array.isArray(appointmentsData) ? appointmentsData : [])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError(error.message || "Failed to load dashboard data")
        setStats(null)
        setRecentAppointments([])
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
                    <span className="text-white font-bold text-lg">AD</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
                </div>
                <p className="text-gray-600 max-w-3xl">
                  Manage your platform and support your users' mental health journey.
                </p>
              </div>
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-blue-100 flex items-center justify-center">
                <ChartBarIcon className="h-12 w-12 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-blue-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-100 p-3 mr-4">
                  <UsersIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? "--" : stats?.counts?.users || 0}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link to="/admin/users" className="text-sm text-blue-600 hover:text-blue-500 flex items-center">
                  View all <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-blue-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-100 p-3 mr-4">
                  <UserGroupIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Counselors</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {loading ? "--" : stats?.counts?.counselors || 0}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link to="/admin/counselors" className="text-sm text-blue-600 hover:text-blue-500 flex items-center">
                  View all <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Link>
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
                  <h3 className="text-lg font-medium text-gray-900">Appointments</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {loading ? "--" : stats?.counts?.appointments || 0}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link to="/admin/appointments" className="text-sm text-blue-600 hover:text-blue-500 flex items-center">
                  View all <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-blue-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-100 p-3 mr-4">
                  <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Pending Verifications</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {loading ? "--" : stats?.counts?.pendingCounselors || 0}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link to="/admin/counselors" className="text-sm text-blue-600 hover:text-blue-500 flex items-center">
                  Review <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-8">
          <div className="px-6 py-5 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Appointments</h3>
              <Link
                to="/admin/appointments"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-300"
              >
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
            ) : recentAppointments.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No recent appointments found.</p>
              </div>
            ) : (
              <ul className="divide-y divide-blue-100">
                {recentAppointments.map((appointment) => (
                  <li key={appointment._id} className="py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center mb-3 sm:mb-0">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                          <CalendarIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            {appointment.user?.name || "Unknown user"} with{" "}
                            {appointment.counselor?.user?.name || "Unknown counselor"}
                          </h4>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>{formatDate(appointment.dateTime)}</span>
                            <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 ml-3" />
                            <span>{formatTime(appointment.dateTime)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            appointment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "confirmed"
                                ? "bg-blue-100 text-blue-800"
                                : appointment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Platform Health */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="px-6 py-5 border-b border-blue-100">
            <h3 className="text-lg font-medium text-gray-900">Platform Health</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 hover:shadow-sm transition-all duration-300">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-blue-800">Active Sessions</h4>
                </div>
                <p className="text-blue-700 text-sm">
                  {loading ? "Loading..." : `${stats?.counts?.appointments || 0} appointments scheduled this month`}
                </p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 hover:shadow-sm transition-all duration-300">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <UserGroupIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-blue-800">Counselor Ratio</h4>
                </div>
                <p className="text-blue-700 text-sm">
                  {loading
                    ? "Loading..."
                    : `1 counselor for every ${stats?.counts?.counselors ? Math.round(stats.counts.users / stats.counts.counselors) : 0} users`}
                </p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 hover:shadow-sm transition-all duration-300">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <XCircleIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-blue-800">Issues to Resolve</h4>
                </div>
                <p className="text-blue-700 text-sm">
                  {loading ? "Loading..." : `${stats?.counts?.pendingCounselors || 0} counselors awaiting verification`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

