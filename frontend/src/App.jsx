"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import DashboardLayout from "./components/layouts/DashboardLayout"
import UserDashboard from "./pages/user/UserDashboard"
import CounselorDashboard from "./pages/counselor/CounselorDashboard"
import AdminDashboard from "./pages/admin/AdminDashboard"
import CounselorList from "./pages/user/CounselorList"
import AppointmentBooking from "./pages/user/AppointmentBooking"
import AppointmentManagement from "./pages/counselor/AppointmentManagment"
import UserAppointments from "./pages/user/UserAppointments"
import UserVideoChat from "./pages/user/UserVideoChat"
import CounselorVideoChat from "./pages/counselor/CounselorVideoChat"
import SelfAssessment from "./pages/user/SelfAssessment"
import ProfileSettings from "./pages/common/ProfileSettings"
import PaymentPage from "./pages/user/PaymentPage"
import PaymentHistory from "./pages/user/PaymentHistory"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminCounselors from "./pages/admin/AdminCounselors"
import AdminAnalytics from "./pages/admin/AdminAnalytics"
import AdminPayments from "./pages/admin/AdminPayments"
import NotFoundPage from "./pages/NotFoundPage"
import AboutPage from "./pages/AboutPage"
import ContactPage from "./pages/ContactPage"
import ForgotPasswordPage from "./pages/auth/ForgotPassword"
import ResetPasswordPage from "./pages/auth/ResetPasswordPage"
import CounselorProfileForm from "./pages/counselor/CounselorProfileForm"
import AvailabilityForm from "./pages/counselor/AvailabilityForm"
import CounselorProfile from "./pages/counselor/CounselorProfile"
import ChatInterface from "./pages/common/ChatInterface"
import CounselorDetail from "./pages/user/CounselorDetail"
import AdminUserEdit from "./pages/admin/adminUserEdit"
import AdminAppointments from "./pages/admin/AdminAppointments"
import UserAssessments from "./pages/user/UserAssessments"
import AssessmentDetail from "./pages/user/AssessmentDetail"
import ClientAssessments from "./pages/counselor/ClientAssessments"
import AdminAssessmentQuestions from "./pages/admin/AdminAssessmentQuestions"
import AdminQuestionForm from "./pages/admin/AdminQuestionForm"
import AdminAssessmentAnalytics from "./pages/admin/AdminAssessmentAnalytics"

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/assessment" element={<SelfAssessment />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
              <p className="text-xl text-gray-700">You are not authorized to access this page</p>
            </div>
          </div>
        }
      />

      {/* User routes */}
      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="counselors" element={<CounselorList />} />
        <Route path="counselors/:counselorId" element={<CounselorDetail />} />
        <Route path="book/:counselorId" element={<AppointmentBooking />} />
        <Route path="appointments" element={<UserAppointments />} />
        <Route path="video-chat/:appointmentId" element={<UserVideoChat />} />
        <Route path="profile" element={<ProfileSettings />} />
        <Route path="upgrade" element={<PaymentPage />} />
        <Route path="payments/history" element={<PaymentHistory />} />
        <Route path="assessment" element={<SelfAssessment />} />
        <Route path="assessments" element={<UserAssessments />} />
        <Route path="assessments/:assessmentId" element={<AssessmentDetail />} />
        <Route path="chat" element={<ChatInterface />} />
      </Route>

      {/* Counselor routes */}
      <Route
        path="/counselor"
        element={
          <ProtectedRoute allowedRoles={["counselor"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CounselorDashboard />} />
        <Route path="appointments" element={<AppointmentManagement />} />
        <Route path="video-chat/:appointmentId" element={<CounselorVideoChat />} />
        <Route path="profile" element={<CounselorProfile />} />
        <Route path="profileform" element={<CounselorProfileForm />} />
        <Route path="availability" element={<AvailabilityForm />} />
        <Route path="clients/:clientId/assessments" element={<ClientAssessments />} />
        <Route path="clients/:clientId/assessments/:assessmentId" element={<AssessmentDetail />} />
      </Route>

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="counselors" element={<AdminCounselors />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="users/edit/:id" element={<AdminUserEdit />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="assessment/questions" element={<AdminAssessmentQuestions />} />
        <Route path="assessment/questions/:questionId" element={<AdminQuestionForm />} />
        <Route path="assessment/analytics" element={<AdminAssessmentAnalytics />} />
        <Route path="profile" element={<ProfileSettings />} />
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
