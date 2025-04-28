"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import api from "../../services/api"
import {
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const AvailabilityForm = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [availability, setAvailability] = useState(daysOfWeek.map((day) => ({ day, slots: [] })))
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem("token")
        if (!token) {
          navigate("/login")
          return
        }

        // FIXED: Use the correct endpoint based on your routes.js file
        // The correct endpoint is /api/counselors/profile instead of /api/counselors/availability
        const response = await api.get("/counselors/profile")
        console.log("Counselor profile response:", response)

        // Extract availability from the counselor profile
        let availabilityData = []

        if (response && response.availability) {
          availabilityData = response.availability
        } else if (response && response.data && response.data.availability) {
          availabilityData = response.data.availability
        } else if (response && response.data) {
          // If the counselor profile exists but has no availability yet
          console.log("No availability data found in profile, using empty array")
        } else {
          console.warn("Unexpected response format:", response)
        }

        // Ensure we have all days of the week
        const formattedAvailability = daysOfWeek.map((day) => {
          const existingDay = Array.isArray(availabilityData) ? availabilityData.find((d) => d.day === day) : null
          return existingDay || { day, slots: [] }
        })

        setAvailability(formattedAvailability)
      } catch (err) {
        console.error("Fetch availability error:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          stack: err.stack,
        })

        if (err.response?.status === 401) {
          localStorage.removeItem("token")
          navigate("/login")
        } else {
          const errorMsg = err.response?.data?.error || err.response?.data?.message || "Failed to load availability"
          setError(errorMsg)
          toast.error(errorMsg)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAvailability()
  }, [navigate])

  const addTimeSlot = (dayIndex) => {
    const updatedAvailability = [...availability]
    updatedAvailability[dayIndex].slots.push({
      startTime: "09:00",
      endTime: "10:00",
    })
    setAvailability(updatedAvailability)
    setFormErrors({})
  }

  const removeTimeSlot = (dayIndex, slotIndex) => {
    const updatedAvailability = [...availability]
    updatedAvailability[dayIndex].slots.splice(slotIndex, 1)
    setAvailability(updatedAvailability)
    setFormErrors({})
  }

  const handleTimeChange = (dayIndex, slotIndex, field, value) => {
    const updatedAvailability = [...availability]
    updatedAvailability[dayIndex].slots[slotIndex][field] = value
    setAvailability(updatedAvailability)

    // Clear any existing error for this slot
    const errorKey = `${dayIndex}-${slotIndex}`
    if (formErrors[errorKey]) {
      const updatedErrors = { ...formErrors }
      delete updatedErrors[errorKey]
      setFormErrors(updatedErrors)
    }
  }

  const validateTimeSlot = (slot) => {
    if (!slot.startTime || !slot.endTime) {
      return "Start time and end time are required"
    }

    // Ensure times are in proper format
    const startTime = slot.startTime.includes(":") ? slot.startTime : `${slot.startTime}:00`
    const endTime = slot.endTime.includes(":") ? slot.endTime : `${slot.endTime}:00`

    const start = new Date(`2000-01-01T${startTime}`)
    const end = new Date(`2000-01-01T${endTime}`)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return "Invalid time format"
    }

    if (start >= end) {
      return "End time must be after start time"
    }

    return null
  }

  const validateForm = () => {
    const errors = {}
    let isValid = true

    availability.forEach((day, dayIndex) => {
      day.slots.forEach((slot, slotIndex) => {
        // Validate individual slot
        const slotError = validateTimeSlot(slot)
        if (slotError) {
          errors[`${dayIndex}-${slotIndex}`] = slotError
          isValid = false
          return
        }

        // Check for overlapping slots
        day.slots.forEach((otherSlot, otherIndex) => {
          if (slotIndex !== otherIndex) {
            const startTime = slot.startTime.includes(":") ? slot.startTime : `${slot.startTime}:00`
            const endTime = slot.endTime.includes(":") ? slot.endTime : `${slot.endTime}:00`
            const otherStartTime = otherSlot.startTime.includes(":") ? otherSlot.startTime : `${otherSlot.startTime}:00`
            const otherEndTime = otherSlot.endTime.includes(":") ? otherSlot.endTime : `${otherSlot.endTime}:00`

            const start = new Date(`2000-01-01T${startTime}`)
            const end = new Date(`2000-01-01T${endTime}`)
            const otherStart = new Date(`2000-01-01T${otherStartTime}`)
            const otherEnd = new Date(`2000-01-01T${otherEndTime}`)

            if (
              (start >= otherStart && start < otherEnd) ||
              (end > otherStart && end <= otherEnd) ||
              (start <= otherStart && end >= otherEnd)
            ) {
              errors[`${dayIndex}-${slotIndex}`] = "Time slots cannot overlap"
              isValid = false
            }
          }
        })
      })
    })

    setFormErrors(errors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting")
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      // Filter out days with no slots and ensure proper time format
      const payload = availability
        .filter((day) => day.slots.length > 0)
        .map((day) => ({
          day: day.day,
          slots: day.slots.map((slot) => ({
            startTime: slot.startTime.includes(":") ? slot.startTime : `${slot.startTime}:00`,
            endTime: slot.endTime.includes(":") ? slot.endTime : `${slot.endTime}:00`,
          })),
        }))

      console.log("Submitting availability payload:", payload)

      // FIXED: Use the correct endpoint based on your routes.js file
      // The correct endpoint is /api/counselors/availability
      const response = await api.put("/counselors/availability", { availability: payload })
      console.log("Update response:", response)

      // Handle successful response
      setSuccess(true)
      toast.success("Availability updated successfully!")
      setTimeout(() => navigate("/counselor"), 2000)
    } catch (err) {
      console.error("Update availability error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        stack: err.stack,
      })

      if (err.response?.status === 401) {
        localStorage.removeItem("token")
        navigate("/login")
      } else {
        const errorMsg =
          err.response?.data?.error || err.response?.data?.message || err.message || "Failed to update availability"
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Set Your Weekly Availability</h1>
            <button
              type="button"
              onClick={() => navigate("/counselor")}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg flex items-center">
              <CheckIcon className="h-5 w-5 mr-2" />
              Availability updated successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {availability.map((day, dayIndex) => (
                <div key={day.day} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
                      {day.day}
                    </h3>
                    <button
                      type="button"
                      onClick={() => addTimeSlot(dayIndex)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Time Slot
                    </button>
                  </div>

                  {day.slots.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No availability set for this day</p>
                  ) : (
                    <div className="space-y-3">
                      {day.slots.map((slot, slotIndex) => (
                        <div
                          key={slotIndex}
                          className={`flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 bg-gray-50 p-3 rounded-md ${
                            formErrors[`${dayIndex}-${slotIndex}`] ? "border border-red-300" : ""
                          }`}
                        >
                          <div className="flex items-center">
                            <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-700 mr-2">From:</span>
                            <input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => handleTimeChange(dayIndex, slotIndex, "startTime", e.target.value)}
                              className={`block w-32 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                                formErrors[`${dayIndex}-${slotIndex}`] ? "border-red-300" : "border-gray-300"
                              }`}
                              required
                              step="900" // 15 minute increments
                            />
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-700 mr-2">To:</span>
                            <input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => handleTimeChange(dayIndex, slotIndex, "endTime", e.target.value)}
                              className={`block w-32 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                                formErrors[`${dayIndex}-${slotIndex}`] ? "border-red-300" : "border-gray-300"
                              }`}
                              required
                              step="900" // 15 minute increments
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                            className="inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 hover:bg-red-50 sm:ml-auto"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>

                          {formErrors[`${dayIndex}-${slotIndex}`] && (
                            <p className="text-sm text-red-600 mt-1 w-full">{formErrors[`${dayIndex}-${slotIndex}`]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    Saving...
                  </>
                ) : (
                  "Save Availability"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AvailabilityForm

