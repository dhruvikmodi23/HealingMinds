"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAppointment } from "../../context/AppointmentContext";
import { toast } from "react-hot-toast";
import {
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  VideoCameraIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const UserAppointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    userAppointments, 
    loading, 
    error,
    getUserAppointments,
    cancelAppointment,
    clearError
  } = useAppointment();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      getUserAppointments();
    }
  }, [user, getUserAppointments]);

  // Check if appointment is today
  const isAppointmentToday = (appointmentDate) => {
    if (!appointmentDate) return false;

    const today = new Date();
    const apptDate = new Date(appointmentDate);

    return (
      today.getFullYear() === apptDate.getFullYear() &&
      today.getMonth() === apptDate.getMonth() &&
      today.getDate() === apptDate.getDate()
    );
  };

  // Check if current time is within 10 minutes of appointment time
  const isWithinTimeWindow = (appointmentDate) => {
    if (!appointmentDate) return false;

    const apptTime = new Date(appointmentDate).getTime();
    const currentTimeMs = currentTime.getTime();

    // 10 minutes before appointment
    const windowStart = apptTime - 10 * 60 * 1000;
    // 10 minutes after appointment
    const windowEnd = apptTime + 10 * 60 * 1000;

    return currentTimeMs >= windowStart && currentTimeMs <= windowEnd;
  };

  // Check if video call button should be shown
  const shouldShowVideoButton = (appointment) => {
    if (!appointment || appointment.status !== "confirmed" || appointment.type !== "video") {
      return false;
    }

    return isAppointmentToday(appointment.dateTime) && isWithinTimeWindow(appointment.dateTime);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return "Invalid date";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = { hour: "2-digit", minute: "2-digit" };
      return new Date(dateString).toLocaleTimeString(undefined, options);
    } catch (e) {
      return "Invalid time";
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "rescheduled":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCancel = async (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await cancelAppointment(appointmentId);
        toast.success("Appointment cancelled successfully");
        await getUserAppointments();
      } catch (err) {
        console.error("Error cancelling appointment:", err);
        const errorMsg = err.response?.data?.message || 
                        err.message || 
                        "Failed to cancel appointment";
        toast.error(errorMsg);
      }
    }
  };

  const handleRetry = () => {
    clearError();
    getUserAppointments();
  };

  // Calculate time remaining until appointment
  const getTimeRemaining = (appointmentDate) => {
    if (!appointmentDate) return null;

    const apptTime = new Date(appointmentDate).getTime();
    const currentTimeMs = currentTime.getTime();
    const diffMs = apptTime - currentTimeMs;

    if (diffMs <= 0) return "Now";

    const diffMins = Math.floor(diffMs / (60 * 1000));

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? "s" : ""}`;
    }

    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;

    if (diffHours < 24) {
      return `${diffHours} hr${diffHours !== 1 ? "s" : ""} ${remainingMins > 0 ? `${remainingMins} min${remainingMins !== 1 ? "s" : ""}` : ""}`;
    }

    return null;
  };

  const filteredAppointments = (userAppointments || []).filter((appointment) => {
    if (!appointment) return false;
    if (selectedStatus === "all") return true;
    return appointment.status?.toLowerCase() === selectedStatus.toLowerCase();
  });

  const capitalizeFirstLetter = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            <p className="mt-1 text-sm text-gray-500">View and manage your counseling sessions</p>
          </div>

          <div className="p-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                  Filter by:
                </label>
                <select
                  id="status-filter"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Appointments</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading appointments...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRetry}
                    className="text-sm font-medium text-red-700 hover:text-red-600"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {!loading && filteredAppointments.length === 0 && (
              <div className="text-center py-8">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedStatus === "all"
                    ? "You don't have any appointments yet."
                    : `You don't have any ${selectedStatus} appointments.`}
                </p>
                <div className="mt-6">
                  <Link
                    to="/user/counselors"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Find a Counselor
                  </Link>
                </div>
              </div>
            )}

            {!loading && filteredAppointments.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Counselor
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
                      <tr key={appointment._id || Math.random().toString(36).substring(2, 9)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full"
                                src={appointment.counselor?.avatar || "/default-avatar.png"}
                                alt={appointment.counselor?.name || "Counselor"}
                                onError={(e) => {
                                  e.target.src = "/default-avatar.png";
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.counselor?.name || "Unknown Counselor"}
                              </div>
                              <div className="text-sm text-gray-500">{appointment.topic || "No topic specified"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(appointment.dateTime)}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <ClockIcon className="mr-1 h-4 w-4" />
                            {formatTime(appointment.dateTime)}
                          </div>
                          {/* Show time remaining for today's upcoming appointments */}
                          {isAppointmentToday(appointment.dateTime) &&
                            appointment.status === "confirmed" &&
                            new Date(appointment.dateTime) > currentTime && (
                              <div className="text-xs mt-1 text-blue-600 font-medium">
                                In {getTimeRemaining(appointment.dateTime)}
                              </div>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {appointment.type || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {capitalizeFirstLetter(appointment.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            {/* Video call button - only show if appointment is today and within time window */}
                            {shouldShowVideoButton(appointment) && (
                              <Link
                                to={`/user/video-chat/${appointment._id}`}
                                className="text-purple-600 hover:text-purple-900"
                                title="Join Session"
                              >
                                <VideoCameraIcon className="h-5 w-5" />
                              </Link>
                            )}

                            {["pending", "confirmed"].includes(appointment.status?.toLowerCase()) && (
                              <button
                                onClick={() => handleCancel(appointment._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Cancel"
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </button>
                            )}

                            <Link
                              to={`/user/appointments/${appointment._id}`}
                              className="text-gray-600 hover:text-gray-900"
                              title="View Details"
                            >
                              <ClipboardDocumentIcon className="h-5 w-5" />
                            </Link>
                          </div>
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
    </div>
  );
};

export default UserAppointments;