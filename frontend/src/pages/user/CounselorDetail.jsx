import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../../services/api"
import { API_URL } from "../../config/constants"
import { format } from "date-fns"
import { toast } from "react-hot-toast"
import {
  CalendarIcon,
  ClockIcon,
  StarIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  CurrencyRupeeIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  LanguageIcon,
} from "@heroicons/react/24/outline"

const CounselorDetail = () => {
  const { counselorId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [counselor, setCounselor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedType, setSelectedType] = useState("video")
  const [topic, setTopic] = useState("")
  const [notes, setNotes] = useState("")
  const [availableSlots, setAvailableSlots] = useState([])
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchCounselorDetails = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/counselors/${counselorId}`)
        
        // Handle different response structures
        let counselorData = response.data || response
        if (counselorData.data) {
          counselorData = counselorData.data
        }

        // Ensure reviews array exists
        if (!counselorData.reviews) {
          counselorData.reviews = []
        }

        // Ensure specialties array exists
        if (!counselorData.specialties) {
          counselorData.specialties = []
        }

        // Ensure languages array exists
        if (!counselorData.languages) {
          counselorData.languages = []
        }
        
        // Ensure avatar URL is properly formatted
        if (counselorData.avatar && !counselorData.avatar.startsWith('http')) {
          counselorData.avatar = `${API_URL}/${counselorData.avatar.replace(/\\/g, '/')}`
        }

        // If avatar comes from user object
        if (counselorData.user?.avatar && !counselorData.user.avatar.startsWith('http')) {
          counselorData.user.avatar = `${API_URL}/${counselorData.user.avatar.replace(/\\/g, '/')}`
        }

        setCounselor(counselorData)
      } catch (error) {
        console.error("Error fetching counselor details:", error)
        toast.error(error.response?.data?.message || "Failed to load counselor details")
      } finally {
        setLoading(false)
      }
    }

    fetchCounselorDetails()
  }, [counselorId])

  const handleDateChange = async (e) => {
    const date = e.target.value
    setSelectedDate(date)
    setSelectedTime("")
    
    if (!date) {
      setAvailableSlots([])
      return
    }

    try {
      const response = await api.get(`/counselors/${counselorId}/availability`, {
        params: { date }
      })
      
      // Handle different response structures
      let slots = response.data?.availableSlots || response.data || []
      if (Array.isArray(slots)) {
        // Ensure slots are in proper format
        slots = slots.map(slot => {
          if (typeof slot === 'string') {
            return slot.includes(':') ? slot : `${slot}:00`
          }
          return slot
        })
        setAvailableSlots(slots)
      } else {
        console.error("Unexpected slots format:", slots)
        setAvailableSlots([])
        toast.error("Failed to parse available time slots")
      }
    } catch (error) {
      console.error("Error fetching availability:", error)
      toast.error(error.response?.data?.message || "Failed to load available time slots")
      setAvailableSlots([])
    }
  }

  const handleBookAppointment = async (e) => {
    e.preventDefault()
    
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time")
      return
    }
    
    if (!topic) {
      toast.error("Please enter a topic for the session")
      return
    }
    
    try {
      setIsSubmitting(true)
      
      // Format time to HH:MM if needed
      const formattedTime = selectedTime.includes(':') ? selectedTime : `${selectedTime}:00`
      
      const appointmentData = {
        counselorId,
        dateTime: `${selectedDate}T${formattedTime}`,
        type: selectedType,
        topic,
        notes,
      }
      
      const response = await api.post(`/appointments`, appointmentData)
      
      if (response.data) {
        toast.success("Appointment booked successfully")
        setIsBookingModalOpen(false)
        navigate("/user/appointments")
      } else {
        throw new Error("No data in response")
      }
    } catch (error) {
      console.error("Error booking appointment:", error)
      toast.error(error.response?.data?.message || "Failed to book appointment")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading counselor details...</p>
        </div>
      </div>
    )
  }


  if (!counselor) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Counselor Not Found</h2>
          <p className="text-gray-600 mb-4">The counselor you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/user/counselors")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Counselors
          </button>
        </div>
      </div>
    )
  }

  const avatarUrl = counselor.avatar || counselor.user?.avatar || "/default-avatar.png"

  return (
    <div className="space-y-6">
      {/* Counselor Profile */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 p-6 flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-200">
            <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-indigo-100">
              <img
                className="h-full w-full object-cover"
                src={avatarUrl}
                alt={counselor.name}
                onError={(e) => {
                  e.target.src = "/default-avatar.png"
                  e.target.onerror = null // Prevent infinite loop if default image fails
                }}
              />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">{counselor.name}</h2>
            <p className="text-sm text-gray-500">{counselor.specialization}</p>
            
            <div className="flex items-center mt-2">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(counselor.rating || 0)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-1 text-sm text-gray-500">
                ({counselor.rating?.toFixed(1) || '0.0'})
              </span>
            </div>
            
            <div className="mt-6 w-full">
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <CalendarIcon className="mr-2 h-5 w-5" />
                Book Appointment
              </button>
            </div>
          </div>
          
          <div className="md:w-2/3 p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">About</h3>
                <p className="mt-2 text-sm text-gray-500">{counselor.bio || 'No bio available'}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AcademicCapIcon className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Education</h4>
                    <p className="text-sm text-gray-500">{counselor.education || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BriefcaseIcon className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Experience</h4>
                    <p className="text-sm text-gray-500">{counselor.experience || '0'} years</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <LanguageIcon className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Languages</h4>
                    <p className="text-sm text-gray-500">
                      {counselor.languages?.join(", ") || 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyRupeeIcon className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Session Fee</h4>
                    <p className="text-sm text-gray-500">
                      ₹{counselor.sessionPrice || '0'} per session
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">Specialties</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {counselor.specialties?.length > 0 ? (
                    counselor.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {specialty}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No specialties listed</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Client Reviews</h3>
        </div>
        <div className="p-6">
          {counselor.reviews?.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No reviews yet.</p>
          ) : (
            <div className="space-y-6">
              {counselor.reviews?.map((review) => {
                // Handle review avatar URL
                const reviewAvatarUrl = review.user?.avatar 
                  ? (review.user.avatar.startsWith('http') 
                      ? review.user.avatar 
                      : `${API_URL}/${review.user.avatar.replace(/\\/g, '/')}`)
                  : "/default-avatar.png"

                return (
                  <div key={review._id || review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-start">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden">
                        <img
                          className="h-full w-full object-cover"
                          src={reviewAvatarUrl}
                          alt={review.user?.name || 'Anonymous'}
                          onError={(e) => {
                            e.target.src = "/default-avatar.png"
                            e.target.onerror = null
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900">
                            {review.user?.name || 'Anonymous'}
                          </h4>
                          <span className="ml-2 text-xs text-gray-500">
                            {review.createdAt ? format(new Date(review.createdAt), "MMMM d, yyyy") : 'Unknown date'}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < (review.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-sm text-gray-500">{review.comment || review.review || 'No comment'}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Book an Appointment</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Schedule a session with {counselor.name}
                      </p>
                    </div>
                    
                    <form onSubmit={handleBookAppointment} className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                          Date
                        </label>
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={selectedDate}
                          onChange={handleDateChange}
                          min={new Date().toISOString().split("T")[0]}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                          Time
                        </label>
                        <select
                          id="time"
                          name="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          required
                          disabled={!selectedDate || availableSlots.length === 0}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="">Select a time</option>
                          {availableSlots.map((slot) => (
                            <option key={slot} value={slot}>
                              {format(new Date(`2000-01-01T${slot.includes(':') ? slot : `${slot}:00`}`), "h:mm a")}
                            </option>
                          ))}
                        </select>
                        {selectedDate && availableSlots.length === 0 && (
                          <p className="mt-1 text-sm text-red-600">No available slots for this date</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                          Session Type
                        </label>
                        <div className="mt-1 flex space-x-4">
                          <div className="flex items-center">
                            <input
                              id="video"
                              name="type"
                              type="radio"
                              value="video"
                              checked={selectedType === "video"}
                              onChange={() => setSelectedType("video")}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <label htmlFor="video" className="ml-2 block text-sm text-gray-700">
                              <VideoCameraIcon className="inline-block h-5 w-5 mr-1 text-gray-400" />
                              Video Call
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="chat"
                              name="type"
                              type="radio"
                              value="chat"
                              checked={selectedType === "chat"}
                              onChange={() => setSelectedType("chat")}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <label htmlFor="chat" className="ml-2 block text-sm text-gray-700">
                              <ChatBubbleLeftRightIcon className="inline-block h-5 w-5 mr-1 text-gray-400" />
                              Chat
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                          Topic
                        </label>
                        <input
                          type="text"
                          id="topic"
                          name="topic"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="What would you like to discuss?"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                          Additional Notes (Optional)
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Any specific concerns or information you'd like to share"
                        />
                      </div>
                      
                      <div className="mt-4 bg-gray-50 p-4 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">Session Fee:</span>
                          <span className="text-sm font-medium text-gray-900">₹{counselor.sessionPrice || '0'}</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Payment will be collected after the appointment is confirmed.
                        </p>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleBookAppointment}
                  disabled={isSubmitting || !selectedDate || !selectedTime || !topic}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Booking..." : "Book Appointment"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CounselorDetail