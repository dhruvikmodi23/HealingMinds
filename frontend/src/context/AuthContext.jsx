"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { API_URL } from "../config/constants"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token")

      if (token) {
        try {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

          const response = await axios.get(`${API_URL}/auth/me`)
          setUser(response.data)
          setIsAuthenticated(true)
        } catch (err) {
          console.error("Auth verification failed:", err)
          localStorage.removeItem("token")
          delete axios.defaults.headers.common["Authorization"]
        }
      }

      setLoading(false)
    }

    checkAuthStatus()
  }, [])

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (response.data.token && response.data.user) {
        localStorage.setItem("token", response.data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response.data.user;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
      
      return response.data;
    } catch (err) {
      let errorMessage = "Registration failed";
      if (err.response) {
        errorMessage = err.response.data.error || err.response.data.message || errorMessage;
      }
      setError(errorMessage);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  // AuthContext.js
const updateProfile = async (userData) => {
  try {
    const response = await axios.put(`${API_URL}/users/profile`, userData);
    
    // Ensure we're getting the user object directly
    const updatedUser = response.data;
    setUser(updatedUser);
    return updatedUser;
  } catch (err) {
    const errorMessage = err.response?.data?.message || "Profile update failed";
    setError(errorMessage);
    throw new Error(errorMessage);
  }
};

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updateUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}