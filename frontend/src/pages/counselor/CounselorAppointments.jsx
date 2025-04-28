"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-hot-toast"
import axios from "axios"
import { API_URL } from "../../config/constants"
import Navbar from "../../components/common/Navbar"
import Footer from "../../components/common/Footer"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import { FiFilter, FiSearch, FiAlertCircle } from "react-icons/fi"

const CounselorAppointments = () => {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    dateRange: "all",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [rescheduleModal, setRescheduleModal] = useState({
    isOpen: false,
    appointmentId: null,
    date: "",
    time: "",
    availableTimes: [],
  })

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_URL}/counselor/appointments`)
        setAppointments(response.data)
        setFilteredAppointments(response.data)
      } catch (err) {
        console.error("Error fetching appointments:", err)
        setError("Failed to load appointments. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  useEffect(() => {
    // Apply filters and search
    let result = appointments

    // Apply search term
    if (searchTerm) {
      result = result.filter(
        (appointment) =>
          appointment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter((appointment) => appointment.status === filters.status)
    }

    // Apply type filter
    if (filters.type) {
      result = result.filter((appointment) => appointment.type === filters.type)
    }

    // Apply date range filter
    if (filters.dateRange !== "all") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (filters.dateRange === "today") {
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        result = result.filter((appointment) => {
          const appointmentDate = new Date(appointment.date)
          return appointmentDate >= today && appointmentDate < tomorrow
        })
      } else if (filters.dateRange === "upcoming") {
        result = result.filter((appointment) => {
          const appointmentDate = new Date(appointment.date)
          return appointmentDate >= today
        })
      } else if (filters.dateRange === "past") {
        result = result.filter((appointment) => {
          const appointmentDate = new Date(appointment.date)
          return appointmentDate < today
        })
      } else if (filters.dateRange === "week") {
        const nextWeek = new Date(today)
        nextWeek.setDate(nextWeek.getDate() + 7)

        result = result.filter((appointment) => {
          const appointmentDate = new Date(appointment.date)
          return appointmentDate >= today && appointmentDate < nextWeek
        })
      }
    }

    setFilteredAppointments(result)
  }, [searchTerm, filters, appointments])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const resetFilters = () => {
    setFilters({
      status: "",
      type: "",
      dateRange: "all",
    })
    setSearchTerm("")
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      setIsUpdating(true)

      await axios.put(`${API_URL}/appointments/${appointmentId}/status`, { status })

      // Update local state
      setAppointments((prev) =>
        prev.map((appointment) => (appointment._id === appointmentId ? { ...appointment, status } : appointment)),
      )

      toast.success(`Appointment ${status === "confirmed" ? "confirmed" : "rejected"} successfully`)
    } catch (err) {
      console.error("Error updating appointment status:", err)
      toast.error("Failed to update appointment status")
    } finally {
      setIsUpdating(false)
    }
  }

  const openRescheduleModal = async (appointmentId) => {
    try {
      setLoading(true)

      // Get the appointment details
      const appointment = appointments.find((a) => a._id === appointmentId)

      // Fetch available time slots for the current date
      const response = await axios.get(`${API_URL}/counselor/availability?date=${appointment.date}`)

      setRescheduleModal({
        isOpen: true,
        appointmentId,
        date: appointment.date,
        time: appointment.time,
        availableTimes: response.data,
      })
    } catch (err) {
      console.error("Error fetching available times:", err)
      toast.error("Failed to load available times for rescheduling")
    } finally {
      setLoading(false)
    }
  }

  const closeRescheduleModal = () => {
    setRescheduleModal({
      isOpen: false,
      appointmentId: null,
      date: "",
      time: "",
      availableTimes: [],
    })
  }

  const handleRescheduleChange = (e) => {
    const { name, value } = e.target
    setRescheduleModal((prev) => ({ ...prev, [name]: value }))
  }

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault()

    try {
      setIsUpdating(true)

      await axios.put(`${API_URL}/appointments/${rescheduleModal.appointmentId}/reschedule`, {
        date: rescheduleModal.date,
        time: rescheduleModal.time,
      })

      // Update local state
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment._id === rescheduleModal.appointmentId
            ? { ...appointment, date: rescheduleModal.date, time: rescheduleModal.time }
            : appointment,
        ),
      )

      toast.success("Appointment rescheduled successfully")
      closeRescheduleModal()
    } catch (err) {
      console.error("Error rescheduling appointment:", err)
      toast.error("Failed to reschedule appointment")
    } finally {
      setIsUpdating(false)
    }
  }

  const fetchAvailableTimes = async (date) => {
    try {
      setLoading(true)

      const response = await axios.get(`${API_URL}/counselor/availability?date=${date}`)

      setRescheduleModal((prev) => ({
        ...prev,
        date,
        time: "",
        availableTimes: response.data,
      }))
    } catch (err) {
      console.error("Error fetching available times:", err)
      toast.error("Failed to load available times for the selected date")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !appointments.length) return <LoadingSpinner />

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Appointments</h1>

            {/* Search and Filter Bar */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by client name or email..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <button
                  onClick={toggleFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <FiFilter className="mr-2" />
                  Filters
                </button>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="rejected">Rejected</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      >
                        <option value="">All Types</option>
                        <option value="text">Text</option>
                        <option value="video">Video</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
                        Date Range
                      </label>
                      <select
                        id="dateRange"
                        name="dateRange"
                        value={filters.dateRange}
                        onChange={handleFilterChange}
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      >
                        <option value="all">All Dates</option>
                        <option value="today">Today</option>
                        <option value="week">Next 7 Days</option>
                        <option value="upcoming">All Upcoming</option>
                        <option value="past">Past Appointments</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button onClick={resetFilters} className="text-sm text-primary hover:text-primary-dark">
                      Reset Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex">
                  <FiAlertCircle className="text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Appointments Table */}
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No appointments found matching your criteria</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Client
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date & Time
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full"
                                src={appointment.user.profilePicture || "/placeholder.svg?height=40&width=40"}
                                alt={appointment.user.name}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{appointment.user.name}</div>
                              <div className="text-sm text-gray-500">{appointment.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(appointment.date).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-500">{appointment.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              appointment.type === "video" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                            }`}
                          >
                            {appointment.type === "video" ? "Video" : "Text"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              appointment.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : appointment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : appointment.status === "completed"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {appointment.status === "confirmed" && (
                            <>
                              <Link
                                to={`/video-call/${appointment._id}`}
                                className="text-primary hover:text-primary-dark mr-3"
                              >
                                Join
                              </Link>
                              <button
                                className="text-gray-600 hover:text-gray-900 mr-3"
                                onClick={() => openRescheduleModal(appointment._id)}
                                disabled={isUpdating}
                              >
                                Reschedule
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleUpdateStatus(appointment._id, "cancelled")}
                                disabled={isUpdating}
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {appointment.status === "pending" && (
                            <>
                              <button
                                className="text-green-600 hover:text-green-900 mr-3"
                                onClick={() => handleUpdateStatus(appointment._id, "confirmed")}
                                disabled={isUpdating}
                              >
                                Accept
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleUpdateStatus(appointment._id, "rejected")}
                                disabled={isUpdating}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {appointment.status === "completed" && (
                            <Link
                              to={`/counselor/notes/${appointment._id}`}
                              className="text-primary hover:text-primary-dark"
                            >
                              View Notes
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleModal.isOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Reschedule Appointment</h2>

            <form onSubmit={handleRescheduleSubmit}>
              <div className="mb-4">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={rescheduleModal.date}
                  onChange={(e) => {
                    handleRescheduleChange(e)
                    fetchAvailableTimes(e.target.value)
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <select
                  id="time"
                  name="time"
                  value={rescheduleModal.time}
                  onChange={handleRescheduleChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                >
                  <option value="">Select a time</option>
                  {rescheduleModal.availableTimes.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeRescheduleModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!rescheduleModal.time || isUpdating}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default CounselorAppointments

