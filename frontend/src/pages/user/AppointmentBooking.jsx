"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAppointment } from "../../context/AppointmentContext";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import {
  XCircleIcon,
  ArrowPathIcon,
  VideoCameraIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AppointmentBooking = () => {
  const { counselorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { bookAppointment } = useAppointment();
  const [counselor, setCounselor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    type: "video",
    topic: "",
    notes: "",
  });
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // Utility functions
  const formatTimeSlot = (isoString) => {
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Error formatting time:", e);
      return "Invalid time";
    }
  };

  const calculateSlotDuration = (slot) => {
    return Math.round(
      (new Date(slot.end) - new Date(slot.start)) / 60000
    );
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins}m`;
  };

  const generateMockSlots = () => {
    const slots = [];
    const baseDate = new Date(selectedDate);
    baseDate.setHours(9, 0, 0, 0);

    for (let i = 0; i < 8; i++) {
      const startTime = new Date(baseDate);
      startTime.setHours(startTime.getHours() + i);

      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      slots.push({
        start: startTime.toISOString(),
        end: endTime.toISOString(),
      });
    }

    return slots;
  };

  useEffect(() => {
    const fetchCounselor = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/counselors/${counselorId}`);
        console.log("Counselor response:", response);

        let counselorData = null;
        if (response && response._id) {
          counselorData = response;
        } else if (response && response.data && response.data._id) {
          counselorData = response.data;
        } else if (response && response.data && response.data.data && response.data.data._id) {
          counselorData = response.data.data;
        } else if (response && response.success && response.data && response.data._id) {
          counselorData = response.data;
        }

        if (!counselorData) {
          console.error("Invalid counselor data format:", response);
          throw new Error("Counselor data not found or in unexpected format");
        }

        setCounselor(counselorData);
      } catch (err) {
        console.error("Error fetching counselor:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch counselor"
        );
      } finally {
        setLoading(false);
      }
    };

    if (counselorId) {
      fetchCounselor();
    }
  }, [counselorId]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!counselorId || !selectedDate) return;

      try {
        setAvailabilityLoading(true);
        setAvailableSlots([]);
        const formattedDate = selectedDate.toISOString().split("T")[0];

        try {
          const response = await api.get(`/appointments/available-slots`, {
            params: {
              counselorId: counselorId,
              date: formattedDate,
            },
          });

          console.log("Availability response:", response);

          let slots = [];
          if (response && Array.isArray(response)) {
            slots = response;
          } else if (response && response.data && Array.isArray(response.data)) {
            slots = response.data;
          } else if (response && response.data && response.data.availableSlots && Array.isArray(response.data.availableSlots)) {
            slots = response.data.availableSlots;
          } else {
            slots = generateMockSlots();
          }

          setAvailableSlots(slots);
        } catch (err) {
          console.error("Error fetching from appointments endpoint:", err);
          const counselorResponse = await api.get(`/counselors/${counselorId}`);
          console.log("Counselor availability response:", counselorResponse);

          let counselorData = null;
          if (counselorResponse && counselorResponse._id) {
            counselorData = counselorResponse;
          } else if (counselorResponse && counselorResponse.data) {
            counselorData = counselorResponse.data;
          }

          if (counselorData && counselorData.availability) {
            const dayOfWeek = [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ][selectedDate.getDay()];
            const dayAvailability = counselorData.availability.find(
              (d) => d.day === dayOfWeek
            );

            if (dayAvailability && dayAvailability.slots && dayAvailability.slots.length > 0) {
              const availableTimeSlots = dayAvailability.slots.map((slot) => {
                const startDateTime = new Date(selectedDate);
                const [startHours, startMinutes] = slot.startTime
                  .split(":")
                  .map(Number);
                startDateTime.setHours(startHours, startMinutes, 0);

                const endDateTime = new Date(selectedDate);
                const [endHours, endMinutes] = slot.endTime
                  .split(":")
                  .map(Number);
                endDateTime.setHours(endHours, endMinutes, 0);

                return {
                  start: startDateTime.toISOString(),
                  end: endDateTime.toISOString(),
                };
              });

              setAvailableSlots(availableTimeSlots);
            } else {
              setAvailableSlots(generateMockSlots());
            }
          } else {
            setAvailableSlots(generateMockSlots());
          }
        }

        setSelectedSlot(null);
      } catch (err) {
        console.error("Error fetching availability:", err);
        toast.error("Failed to load available time slots");
        setAvailableSlots(generateMockSlots());
      } finally {
        setAvailabilityLoading(false);
      }
    };

    fetchAvailability();
  }, [counselorId, selectedDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to book an appointment");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (!counselorId) {
      toast.error("No counselor selected");
      navigate("/user/counselors");
      return;
    }

    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }

    if (!formData.topic) {
      toast.error("Please enter a topic for your session");
      return;
    }

    setShowConfirmation(true);
  };

  const confirmBooking = async () => {
    setShowConfirmation(false);
    
    try {
      setBookingLoading(true);
      setError(null);

      if (user?.subscription?.plan === "free" && formData.type !== "chat") {
        setSubscriptionRequired(true);
        return;
      }

      const appointmentData = {
        counselor: counselorId,
        dateTime: selectedSlot.start,
        duration: calculateSlotDuration(selectedSlot),
        type: formData.type,
        topic: formData.topic,
        notes: formData.notes
      };

      console.log("Attempting to book with data:", appointmentData);

      const result = await bookAppointment(appointmentData);
      console.log("Booking successful:", result);

      toast.success("Appointment booked successfully!");
      navigate("/user/appointments");
    } catch (err) {
      console.error("Booking error:", err);
      
      if (err.response) {
        if (err.response.status === 401) {
          toast.error("Please login to book an appointment");
          navigate("/login");
        } else if (err.response.status === 403) {
          toast.error("You don't have permission to book this appointment");
        } else if (err.response.status === 409) {
          toast.error("This time slot is no longer available");
          const formattedDate = selectedDate.toISOString().split("T")[0];
          const response = await api.get(`/appointments/available-slots`, {
            params: { counselorId, date: formattedDate }
          });
          setAvailableSlots(response.data || []);
        } else {
          toast.error(err.response.data.message || "Booking failed");
        }
      } else {
        toast.error(err.message || "Failed to book appointment");
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const handleUpgradeClick = () => {
    navigate("/user/upgrade");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !counselor) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">{error}</h3>
          <div className="mt-6">
            <button
              onClick={() => navigate("/user/counselors")}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Counselors
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayCounselor = counselor || {
    user: {
      name: "Counselor",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    specializations: ["Counseling"],
    bio: "No bio available",
    rating: 0,
    reviewCount: 0,
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-blue-100">
            <h1 className="text-2xl font-bold text-gray-900">
              Book Appointment
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Schedule a session with {displayCounselor?.user?.name || "Counselor"}
            </p>
          </div>

          <div className="p-6">
            {subscriptionRequired && (
              <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Subscription Required
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        You need a premium subscription to access video and
                        phone calls.
                      </p>
                      <button
                        onClick={handleUpgradeClick}
                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600"
                      >
                        Upgrade Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Counselor Info */}
              <div className="lg:col-span-1">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                  <div className="flex flex-col items-center">
                    <img
                      className="h-24 w-24 rounded-full border-2 border-white shadow-sm object-cover mb-4"
                      src={
                        displayCounselor?.user?.avatar ||
                        "/placeholder.svg?height=100&width=100"
                      }
                      alt={displayCounselor?.user?.name || "Counselor"}
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=100&width=100";
                      }}
                    />
                    <h3 className="text-lg font-medium text-gray-900">
                      {displayCounselor?.user?.name || "Counselor"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {displayCounselor?.specializations?.join(", ") ||
                        "Counselor"}
                    </p>
                    <div className="mt-4 flex items-center">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.round(displayCounselor?.rating || 0)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        ({displayCounselor?.reviewCount || 0} reviews)
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-gray-500 text-center">
                      {displayCounselor?.bio || "No bio available"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <XCircleIcon
                            className="h-5 w-5 text-red-400"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-6">
                    {/* Date Picker */}
                    <div>
                      <label
                        htmlFor="date"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Select Date
                      </label>
                      <div className="mt-1">
                        <DatePicker
                          selected={selectedDate}
                          onChange={(date) => {
                            if (date) {
                              setSelectedDate(date);
                              setSelectedSlot(null);
                            }
                          }}
                          minDate={new Date()}
                          filterDate={(date) => {
                            return date.getDay() !== 0 && date.getDay() !== 6;
                          }}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          inline
                        />
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Available Time Slots
                        {availabilityLoading && (
                          <span className="ml-2 text-sm text-gray-500">
                            (Loading...)
                          </span>
                        )}
                      </label>
                      {availableSlots.length === 0 ? (
                        <div className="text-center py-4 bg-gray-50 rounded-md border border-gray-200">
                          <p className="text-sm text-gray-500">
                            No available slots for this date. Please select
                            another date.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                          {availableSlots.map((slot, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2 px-3 border rounded-md text-sm font-medium ${
                                selectedSlot?.start === slot.start
                                  ? "bg-blue-100 border-blue-500 text-blue-700"
                                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <div>
                                {formatTimeSlot(slot.start)}
                                <div className="text-xs text-gray-500">
                                  {formatDuration(calculateSlotDuration(slot))}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Appointment Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Session Type
                      </label>
                      <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="flex items-center">
                          <input
                            id="type-video"
                            name="type"
                            type="radio"
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                            checked={formData.type === "video"}
                            onChange={() =>
                              setFormData({ ...formData, type: "video" })
                            }
                          />
                          <label
                            htmlFor="type-video"
                            className="ml-3 flex items-center text-sm font-medium text-gray-700"
                          >
                            <VideoCameraIcon className="h-4 w-4 mr-1 text-blue-500" />
                            Video
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="type-phone"
                            name="type"
                            type="radio"
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                            checked={formData.type === "phone"}
                            onChange={() =>
                              setFormData({ ...formData, type: "phone" })
                            }
                          />
                          <label
                            htmlFor="type-phone"
                            className="ml-3 flex items-center text-sm font-medium text-gray-700"
                          >
                            <PhoneIcon className="h-4 w-4 mr-1 text-blue-500" />
                            Phone
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="type-chat"
                            name="type"
                            type="radio"
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                            checked={formData.type === "chat"}
                            onChange={() =>
                              setFormData({ ...formData, type: "chat" })
                            }
                          />
                          <label
                            htmlFor="type-chat"
                            className="ml-3 flex items-center text-sm font-medium text-gray-700"
                          >
                            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1 text-blue-500" />
                            Chat
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Topic */}
                    <div>
                      <label
                        htmlFor="topic"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        What would you like to discuss?
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="topic"
                          id="topic"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          value={formData.topic}
                          onChange={handleInputChange}
                          placeholder="e.g., Anxiety management, Relationship issues"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label
                        htmlFor="notes"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Additional Notes (Optional)
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="notes"
                          name="notes"
                          rows={3}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          value={formData.notes}
                          onChange={handleInputChange}
                          placeholder="Any specific concerns or preferences"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!selectedSlot || bookingLoading}
                        className={`inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                          selectedSlot && !bookingLoading
                            ? "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {bookingLoading ? (
                          <>
                            <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                            Booking...
                          </>
                        ) : (
                          "Book Appointment"
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Booking</h3>
            <div className="mb-4 space-y-2">
              <p>
                <span className="font-medium">Counselor:</span> {counselor?.user?.name}
              </p>
              <p>
                <span className="font-medium">Date:</span> {new Date(selectedDate).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Time:</span> {formatTimeSlot(selectedSlot.start)}
              </p>
              <p>
                <span className="font-medium">Duration:</span> {formatDuration(calculateSlotDuration(selectedSlot))}
              </p>
              <p>
                <span className="font-medium">Type:</span> {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
              </p>
              <p>
                <span className="font-medium">Topic:</span> {formData.topic}
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <span className="flex items-center">
                    <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                    Processing...
                  </span>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentBooking;