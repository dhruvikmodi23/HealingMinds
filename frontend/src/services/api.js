import axios from "axios"

// Use NEXT_PUBLIC_ prefix for client-side accessible environment variables
const baseURL =
  typeof window !== "undefined"
    ? window.ENV?.VITE_API_URL || "http://localhost:5000/api"
    : process.env.VITE_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Only run this in browser environment
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Extract the data from the response to simplify access
    if (response.data && response.data.data) {
      return response.data.data
    }
    return response.data
  },
  (error) => {
    // Only run this in browser environment
    if (typeof window !== "undefined") {
      if (error.response?.status === 401) {
        localStorage.removeItem("token")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

export default api

