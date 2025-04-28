"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAppointment } from "../../context/AppointmentContext";
import {
  CalendarIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowRightIcon,
  ClipboardDocumentCheckIcon,
  VideoCameraIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  HeartIcon,
  LightBulbIcon,
  UsersIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const UserDashboard = () => {
  const { user } = useAuth();
  const {
    userAppointments = [],
    getUserAppointments,
    loading,
    error: appointmentError,
  } = useAppointment();
  const [quote, setQuote] = useState("");

  useEffect(() => {
    if (user) {
      getUserAppointments();
    }

    // Set a random mental health quote
    const quotes = [
      "Mental health is not a destination, but a process. It's about how you drive, not where you're going.",
      "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared, or anxious.",
      "Recovery is not one and done. It is a lifelong journey that takes place one day, one step at a time.",
      "Self-care is how you take your power back.",
      "It's okay to not be okay – it means that your mind is trying to heal itself.",
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, [user]);

  const formatDate = (dateString) => {
    try {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return "Invalid date";
    }
  };

  const formatTime = (dateString) => {
    try {
      const options = { hour: "2-digit", minute: "2-digit" };
      return new Date(dateString).toLocaleTimeString(undefined, options);
    } catch {
      return "Invalid time";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const upcomingAppointments = Array.isArray(userAppointments)
    ? userAppointments
        .filter((appointment) => {
          try {
            return (
              appointment &&
              ["confirmed", "pending"].includes(appointment.status) &&
              new Date(appointment.dateTime) > new Date()
            );
          } catch {
            return false;
          }
        })
        .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
        .slice(0, 3)
    : [];

  if (appointmentError) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-6">{appointmentError}</p>
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
    );
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
                    <span className="text-white font-bold text-lg">HM</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Welcome back, {user?.name}!
                  </h2>
                </div>
                <p className="text-gray-600 max-w-3xl">{quote}</p>
              </div>
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-blue-100 flex items-center justify-center">
                <HeartIcon className="h-12 w-12 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/user/counselors"
            className="bg-white rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-100 p-3 mr-4">
                  <UserCircleIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Find a Counselor
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Browse our professional counselors
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <ArrowRightIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </Link>

          <Link
            to="/assessment"
            className="bg-white rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-100 p-3 mr-4">
                  <ClipboardDocumentCheckIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Self-Assessment
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Take a mental health assessment
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <ArrowRightIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </Link>

          <Link
            to="/user/appointments"
            className="bg-white rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-100 p-3 mr-4">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    My Appointments
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    View your scheduled sessions
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <ArrowRightIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </Link>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-8">
          <div className="px-6 py-5 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Upcoming Appointments
              </h3>
              <Link
                to="/user/appointments"
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
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">
                  You don't have any upcoming appointments.
                </p>
                <Link
                  to="/user/counselors"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-300"
                >
                  Find a Counselor
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-blue-100">
                {upcomingAppointments.map((appointment) => (
                  <li key={appointment._id} className="py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center mb-3 sm:mb-0">
                        <img
                          className="h-12 w-12 rounded-full border-2 border-blue-100 object-cover"
                          src={
                            appointment.counselor?.avatar ||
                            "/default-avatar.png"
                          }
                          alt={appointment.counselor?.name}
                          onError={(e) => {
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-gray-900">
                            {appointment.counselor?.name}
                          </h4>
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
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 sm:mt-0">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status?.charAt(0).toUpperCase() +
                            appointment.status?.slice(1)}
                        </span>
                        {appointment.status === "confirmed" && (
                          <div className="flex space-x-2">
                            {appointment.type === "video" && (
                              <Link
                                to={`/user/video-chat/${appointment._id}`}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
                              >
                                <VideoCameraIcon className="mr-1 h-4 w-4" />
                                Join
                              </Link>
                            )}
                            <Link
                              to={`/user/chat/${appointment._id}`}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors duration-300"
                            >
                              <ChatBubbleOvalLeftEllipsisIcon className="mr-1 h-4 w-4" />
                              Chat
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Mental Health Tips */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="px-6 py-5 border-b border-blue-100">
            <h3 className="text-lg font-medium text-gray-900">
              Mental Wellness Tips
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 hover:shadow-sm transition-all duration-300">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <HeartIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-blue-800">
                    Practice Mindfulness
                  </h4>
                </div>
                <p className="text-blue-700 text-sm">
                  Take a few minutes each day to sit quietly and focus on your
                  breath. Mindfulness reduces stress and improves focus.
                </p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 hover:shadow-sm transition-all duration-300">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <LightBulbIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-blue-800">Stay Active</h4>
                </div>
                <p className="text-blue-700 text-sm">
                  Regular exercise releases endorphins and improves mood. Even a
                  short walk can make a difference.
                </p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 hover:shadow-sm transition-all duration-300">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <UsersIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-blue-800">
                    Connect with Others
                  </h4>
                </div>
                <p className="text-blue-700 text-sm">
                  Maintaining social connections is vital for mental health.
                  Reach out to a friend or family member today.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;