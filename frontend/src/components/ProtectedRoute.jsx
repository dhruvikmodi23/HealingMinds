"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import LoadingSpinner from "./ui/LoadingSpinner"

const ProtectedRoute = ({ children, role }) => {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (role && currentUser.role !== role) {
    // Redirect to appropriate dashboard based on role
    if (currentUser.role === "user") {
      return <Navigate to="/user" replace />
    } else if (currentUser.role === "counselor") {
      return <Navigate to="/counselor" replace />
    } else if (currentUser.role === "admin") {
      return <Navigate to="/admin" replace />
    }
  }

  return children
}

export default ProtectedRoute

