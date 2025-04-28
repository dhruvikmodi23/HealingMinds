"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import api from "../../services/api"
import {
  StarIcon,
  CalendarIcon,
  ClockIcon,
  UserCircleIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CheckBadgeIcon,
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline"
import { toast } from "react-hot-toast"

const CounselorProfile = () => {
  const navigate = useNavigate()
  const [counselor, setCounselor] = useState(null)
  const [loading, setLoading] = useState({
    profile: true,
    avatar: false,
    reviews: false,
    availability: false,
  })
  const [reviews, setReviews] = useState([])
  const [availability, setAvailability] = useState([])
  const [error, setError] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState("")

  useEffect(() => {
    const fetchCounselorProfile = async () => {
      try {
        setLoading(prev => ({ ...prev, profile: true }))
        setError(null)

        // Fetch counselor profile
        const counselorData = await api.get("/counselors/profile")
        setCounselor(counselorData)
        setAvatarPreview(counselorData.user?.avatar || "")

        // Fetch reviews if counselor data is available
        if (counselorData && counselorData._id) {
          try {
            setLoading(prev => ({ ...prev, reviews: true }))
            const reviewsData = await api.get(`/counselors/${counselorData._id}/reviews`)
            setReviews(reviewsData || [])
          } catch (reviewErr) {
            console.error("Error fetching reviews:", reviewErr)
            setReviews([])
          } finally {
            setLoading(prev => ({ ...prev, reviews: false }))
          }

          // Fetch availability - use the same structure as AvailabilityForm
          try {
            setLoading(prev => ({ ...prev, availability: true }))
            const response = await api.get("/counselors/profile")
            let availabilityData = []
            
            if (response && response.availability) {
              availabilityData = response.availability
            } else if (response && response.data && response.data.availability) {
              availabilityData = response.data.availability
            }
            
            // Ensure we have all days of the week
            const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            const formattedAvailability = daysOfWeek.map(day => {
              const existingDay = Array.isArray(availabilityData) ? 
                availabilityData.find(d => d.day === day) : null
              return existingDay || { day, slots: [] }
            })
            
            setAvailability(formattedAvailability)
          } catch (availErr) {
            console.error("Error fetching availability:", availErr)
            // Initialize empty availability if fetch fails
            const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            setAvailability(daysOfWeek.map(day => ({ day, slots: [] })))
          } finally {
            setLoading(prev => ({ ...prev, availability: false }))
          }
        }
      } catch (err) {
        console.error("Error fetching counselor profile:", err)
        setError("Failed to load counselor profile. Please try again later.")
      } finally {
        setLoading(prev => ({ ...prev, profile: false }))
      }
    }

    fetchCounselorProfile()
  }, [])

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result)
    reader.readAsDataURL(file)

    const formData = new FormData()
    formData.append("avatar", file)

    setLoading(prev => ({ ...prev, avatar: true }))
    try {
      const response = await api.post("/users/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      
      // Update the counselor state with the new avatar
      setCounselor(prev => ({
        ...prev,
        user: {
          ...prev.user,
          avatar: response.avatarUrl
        }
      }))
      
      toast.success("Avatar updated successfully")
    } catch (error) {
      console.error("Error uploading avatar:", error)
      setError(error.response?.data?.message || "Failed to upload avatar")
      toast.error(error.response?.data?.message || "Failed to upload avatar")
    } finally {
      setLoading(prev => ({ ...prev, avatar: false }))
    }
  }

  const handleDeleteAvatar = async () => {
    setLoading(prev => ({ ...prev, avatar: true }))
    try {
      await api.delete("/users/avatar")
      
      // Update the counselor state by removing the avatar
      setCounselor(prev => ({
        ...prev,
        user: {
          ...prev.user,
          avatar: null
        }
      }))
      
      setAvatarPreview("")
      toast.success("Avatar removed successfully")
    } catch (error) {
      console.error("Error deleting avatar:", error)
      setError(error.response?.data?.message || "Failed to remove avatar")
      toast.error(error.response?.data?.message || "Failed to remove avatar")
    } finally {
      setLoading(prev => ({ ...prev, avatar: false }))
    }
  }

  const formatTimeSlot = (slot) => {
    if (!slot?.startTime || !slot?.endTime) return "Invalid time slot"
    
    // Ensure consistent time format (HH:MM)
    const formatTime = (time) => {
      if (!time.includes(':')) return `${time}:00`
      const [hours, minutes] = time.split(':')
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
    }
    
    return `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`
  }

  if (loading.profile) {
    return (
      <div className="min-h-screen bg-blue-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !counselor) {
    return (
      <div className="min-h-screen bg-blue-50 flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || "Profile not found"}</h1>
          <p className="text-gray-600 mb-4">
            {error ? "Please try again later." : "Your profile information could not be loaded."}
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/counselor"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
            <Link
              to="/counselor/profileform"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              Create Profile
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6 relative">
                <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden relative">
                  {avatarPreview ? (
                    <img
                      className="h-full w-full object-cover"
                      src={avatarPreview}
                      alt={counselor.user?.name || "Counselor"}
                      onError={(e) => {
                        e.target.src = "/default-avatar.png"
                      }}
                    />
                  ) : (
                    <div className="h-full w-full bg-blue-100 flex items-center justify-center">
                      <UserCircleIcon className="h-16 w-16 text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="flex justify-center mt-2 space-x-2">
                  <label
                    htmlFor="avatar-upload"
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-opacity-20 text-white hover:bg-opacity-30 cursor-pointer"
                    title="Change avatar"
                  >
                    {loading.avatar ? (
                      <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <PencilIcon className="h-3 w-3 mr-1" />
                    )}
                    Change
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={loading.avatar}
                    />
                  </label>
                  {avatarPreview && (
                    <button
                      onClick={handleDeleteAvatar}
                      disabled={loading.avatar}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-opacity-20 text-white hover:bg-opacity-30"
                      title="Remove avatar"
                    >
                      {loading.avatar ? (
                        <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <TrashIcon className="h-3 w-3 mr-1" />
                      )}
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-grow">
                <h1 className="text-2xl font-bold">{counselor.user?.name || "Counselor"}</h1>
                <div className="flex items-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(counselor.rating || 0) ? "text-yellow-300 fill-current" : "text-blue-200"
                      }`}
                    />
                  ))}
                  <span className="ml-2">
                    {counselor.rating?.toFixed(1) || "No"} rating ({counselor.reviewCount || 0} reviews)
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {counselor.specializations?.map((spec) => (
                    <span
                      key={spec}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 bg-opacity-20 text-white"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 md:mt-0 md:ml-auto">
                <Link
                  to="/counselor/profileform"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-blue-600 bg-white hover:bg-blue-50"
                >
                  <PencilSquareIcon className="h-5 w-5 mr-2" />
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Rest of the component remains the same */}
          {/* Main Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2">
                {/* About */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <UserCircleIcon className="h-6 w-6 text-blue-600 mr-2" />
                    About
                  </h2>
                  <p className="text-gray-700 whitespace-pre-line">{counselor.bio || "No bio available"}</p>
                </div>

                {/* Experience */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <BriefcaseIcon className="h-6 w-6 text-blue-600 mr-2" />
                    Experience
                  </h2>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Years of Experience</h3>
                        <p className="text-lg font-semibold text-gray-900">{counselor.experience || 0}+ years</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Credentials</h3>
                        <p className="text-lg font-semibold text-gray-900">
                          {counselor.credentials || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Education */}
                {counselor.education?.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <AcademicCapIcon className="h-6 w-6 text-blue-600 mr-2" />
                      Education
                    </h2>
                    <ul className="space-y-4">
                      {counselor.education.map((edu, index) => (
                        <li key={index} className="flex">
                          <CheckBadgeIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">{edu}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Certifications */}
                {counselor.certifications?.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <CheckBadgeIcon className="h-6 w-6 text-blue-600 mr-2" />
                      Certifications
                    </h2>
                    <ul className="space-y-4">
                      {counselor.certifications.map((cert, index) => (
                        <li key={index} className="flex">
                          <CheckBadgeIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Reviews */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600 mr-2" />
                    Reviews ({reviews.length})
                  </h2>
                  {reviews.length === 0 ? (
                    <p className="text-gray-500">No reviews yet</p>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-200 pb-6">
                          <div className="flex items-center mb-2">
                            <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                              <img
                                className="h-full w-full object-cover"
                                src={review.user?.avatar || "/default-avatar.png"}
                                alt={review.user?.name || "Client"}
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{review.user?.name || "Client"}</h4>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <StarIcon
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                                <span className="text-xs text-gray-500 ml-2">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 mt-2">{review.review}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Availability */}
              <div>
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sticky top-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <CalendarIcon className="h-6 w-6 text-blue-600 mr-2" />
                    Availability
                  </h2>

                  {availability?.length > 0 ? (
                    <div className="space-y-4">
                      {availability.map((day) => (
                        <div key={day.day} className="border-b border-gray-200 pb-4 last:border-0">
                          <h3 className="font-medium text-gray-900 mb-2">{day.day}</h3>
                          {day.slots && day.slots.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                              {day.slots.map((slot, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                >
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  {formatTimeSlot(slot)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Not available</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No availability set</p>
                  )}

                  <div className="mt-6">
                    <Link
                      to="/counselor/availability"
                      className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                    >
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      Set Availability
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CounselorProfile