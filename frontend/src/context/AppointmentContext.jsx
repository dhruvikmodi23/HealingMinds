// "use client"

// import { createContext, useContext, useState, useCallback } from "react"
// import axios from "axios"
// import { API_URL } from "../config/constants"
// import { useAuth } from "./AuthContext"

// const AppointmentContext = createContext()

// export const useAppointment = () => useContext(AppointmentContext)

// export const AppointmentProvider = ({ children }) => {
//   const [userAppointments, setUserAppointments] = useState(null) // null indicates initial load
//   const [counselorAppointments, setCounselorAppointments] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState(null)
//   const { user } = useAuth()
  
//   const getAuthHeader = useCallback(() => {
//     const token = localStorage.getItem("token")
//     return {
//       headers: {
//         Authorization: token ? `Bearer ${token}` : '',
//         'Content-Type': 'application/json'
//       }
//     }
//   }, [])

//   const clearError = useCallback(() => setError(null), [])

//   const getUserAppointments = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await axios.get(`${API_URL}/appointments/user`, getAuthHeader());
      
//       // Handle different possible response formats
//       let appointments = [];
      
//       if (Array.isArray(response.data)) {
//         // Case 1: Direct array response
//         appointments = response.data;
//       } else if (response.data?.appointments && Array.isArray(response.data.appointments)) {
//         // Case 2: Object with appointments array
//         appointments = response.data.appointments;
//       } else if (response.data?.data && Array.isArray(response.data.data)) {
//         // Case 3: Object with data array (common with some APIs)
//         appointments = response.data.data;
//       } else {
//         console.warn("Unexpected API response format:", response.data);
//         throw new Error("Unexpected data format received from server");
//       }
      
//       setUserAppointments(appointments);
//       return appointments;
//     } catch (err) {
//       console.error("Error fetching user appointments:", {
//         error: err,
//         response: err.response?.data
//       });
      
//       const errorMsg = err.response?.data?.message || 
//                       err.message || 
//                       "Failed to fetch your appointments";
//       setError(errorMsg);
//       setUserAppointments([]);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, [getAuthHeader()]);

//   const getCounselorAppointments = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await axios.get(`${API_URL}/appointments/counselor`, getAuthHeader());
      
//       console.log("Raw API Response:", response.data); // Debug log
      
//       // Handle different possible response formats
//       let appointments = [];
      
//       if (Array.isArray(response.data)) {
//         // Case 1: Direct array response
//         appointments = response.data;
//       } else if (response.data?.appointments && Array.isArray(response.data.appointments)) {
//         // Case 2: Object with appointments array
//         appointments = response.data.appointments;
//       } else if (response.data?.data && Array.isArray(response.data.data)) {
//         // Case 3: Common API wrapper format
//         appointments = response.data.data;
//       } else if (response.data?.items && Array.isArray(response.data.items)) {
//         // Case 4: Another common format
//         appointments = response.data.items;
//       } else {
//         console.warn("Unexpected API response format:", response.data);
//         throw new Error("Unexpected data format received from server");
//       }
      
//       setCounselorAppointments(appointments);
//       return appointments;
//     } catch (err) {
//       console.error("Error fetching counselor appointments:", {
//         error: err,
//         response: err.response?.data
//       });
      
//       const errorMsg = err.response?.data?.message || 
//                       err.message || 
//                       "Failed to fetch counselor appointments";
//       setError(errorMsg);
//       setCounselorAppointments([]);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, [getAuthHeader]);

//   const bookAppointment = useCallback(async (appointmentData) => {
//     try {
//       setLoading(true)
//       setError(null)
      
//       if (!appointmentData.counselor || !appointmentData.dateTime || !appointmentData.type) {
//         throw new Error("Missing required appointment fields")
//       }

//       const fullAppointmentData = {
//         counselor: appointmentData.counselor,
//         dateTime: appointmentData.dateTime,
//         duration: appointmentData.duration || 60,
//         type: appointmentData.type,
//         topic: appointmentData.topic || "",
//         notes: appointmentData.notes || "",
//         status: "pending"
//       }

//       const response = await axios.post(
//         `${API_URL}/appointments`, 
//         fullAppointmentData, 
//         getAuthHeader()
//       )

//       // Update local state optimistically
//       setUserAppointments(prev => prev ? [...prev, response.data] : [response.data])
      
//       if (user?.role === 'counselor') {
//         setCounselorAppointments(prev => prev ? [...prev, response.data] : [response.data])
//       }

//       return response.data
//     } catch (err) {
//       console.error("Booking error:", {
//         error: err,
//         response: err.response?.data
//       })
      
//       const errorMsg = err.response?.data?.message || 
//                      err.message || 
//                      "Failed to book appointment"
//       setError(errorMsg)
//       throw err
//     } finally {
//       setLoading(false)
//     }
//   }, [getAuthHeader, user?.role])

//   const updateAppointmentStatus = useCallback(async (appointmentId, status) => {
//     try {
//       setLoading(true)
//       setError(null)
      
//       const response = await axios.patch(
//         `${API_URL}/appointments/${appointmentId}/status`, 
//         { status }, 
//         getAuthHeader()
//       )

//       // Update both appointment lists
//       setCounselorAppointments(prev => 
//         prev?.map(apt => apt._id === appointmentId ? { ...apt, status } : apt)
//       )
//       setUserAppointments(prev => 
//         prev?.map(apt => apt._id === appointmentId ? { ...apt, status } : apt)
//       )

//       return response.data
//     } catch (err) {
//       console.error("Status update error:", {
//         error: err,
//         response: err.response?.data
//       })
      
//       const errorMsg = err.response?.data?.message || 
//                      "Failed to update appointment status"
//       setError(errorMsg)
//       throw err
//     } finally {
//       setLoading(false)
//     }
//   }, [getAuthHeader])

//   const rescheduleAppointment = useCallback(async (appointmentId, newDateTime) => {
//     try {
//       setLoading(true)
//       setError(null)
      
//       const response = await axios.patch(
//         `${API_URL}/appointments/${appointmentId}/reschedule`, 
//         { dateTime: newDateTime }, 
//         getAuthHeader()
//       )

//       // Update both appointment lists
//       setCounselorAppointments(prev => 
//         prev?.map(apt => apt._id === appointmentId ? { ...apt, dateTime: newDateTime } : apt)
//       )
//       setUserAppointments(prev => 
//         prev?.map(apt => apt._id === appointmentId ? { ...apt, dateTime: newDateTime } : apt)
//       )

//       return response.data
//     } catch (err) {
//       console.error("Reschedule error:", {
//         error: err,
//         response: err.response?.data
//       })
      
//       const errorMsg = err.response?.data?.message || 
//                      "Failed to reschedule appointment"
//       setError(errorMsg)
//       throw err
//     } finally {
//       setLoading(false)
//     }
//   }, [getAuthHeader])

//   const cancelAppointment = useCallback(async (appointmentId) => {
//     try {
//       setLoading(true)
//       setError(null)
      
//       const response = await axios.patch(
//         `${API_URL}/appointments/${appointmentId}/cancel`,
//         {}, // empty body since we're just cancelling
//         getAuthHeader()
//       )

//       // Update both appointment lists
//       setCounselorAppointments(prev => 
//         prev?.map(apt => apt._id === appointmentId ? { ...apt, status: 'cancelled' } : apt)
//       )
//       setUserAppointments(prev => 
//         prev?.map(apt => apt._id === appointmentId ? { ...apt, status: 'cancelled' } : apt)
//       )

//       return response.data
//     } catch (err) {
//       console.error("Cancel error:", {
//         error: err,
//         response: err.response?.data
//       })
      
//       const errorMsg = err.response?.data?.message || 
//                      "Failed to cancel appointment"
//       setError(errorMsg)
//       throw err
//     } finally {
//       setLoading(false)
//     }
//   }, [getAuthHeader])

//   const value = {
//     userAppointments,
//     counselorAppointments,
//     loading,
//     error,
//     clearError,
//     getUserAppointments,
//     getCounselorAppointments,
//     bookAppointment,
//     updateAppointmentStatus,
//     rescheduleAppointment,
//     cancelAppointment
//   }

//   return (
//     <AppointmentContext.Provider value={value}>
//       {children}
//     </AppointmentContext.Provider>
//   )
// }


"use client"

import { createContext, useContext, useState, useCallback } from "react"
import axios from "axios"
import { API_URL } from "../config/constants"
import { useAuth } from "./AuthContext"

const AppointmentContext = createContext()

export const useAppointment = () => useContext(AppointmentContext)

export const AppointmentProvider = ({ children }) => {
  const [userAppointments, setUserAppointments] = useState(null) // null indicates initial load
  const [counselorAppointments, setCounselorAppointments] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem("token")
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const getUserAppointments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_URL}/appointments/user`, getAuthHeader())

      // Handle different possible response formats
      let appointments = []

      if (Array.isArray(response.data)) {
        // Case 1: Direct array response
        appointments = response.data
      } else if (response.data?.appointments && Array.isArray(response.data.appointments)) {
        // Case 2: Object with appointments array
        appointments = response.data.appointments
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        // Case 3: Object with data array (common with some APIs)
        appointments = response.data.data
      } else {
        console.warn("Unexpected API response format:", response.data)
        throw new Error("Unexpected data format received from server")
      }

      setUserAppointments(appointments)
      return appointments
    } catch (err) {
      console.error("Error fetching user appointments:", {
        error: err,
        response: err.response?.data,
      })

      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch your appointments"
      setError(errorMsg)
      setUserAppointments([])
      throw err
    } finally {
      setLoading(false)
    }
  }, [getAuthHeader])

  const getCounselorAppointments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_URL}/appointments/counselor`, getAuthHeader())

      console.log("Raw API Response:", response.data) // Debug log

      // Handle different possible response formats
      let appointments = []

      if (Array.isArray(response.data)) {
        // Case 1: Direct array response
        appointments = response.data
      } else if (response.data?.appointments && Array.isArray(response.data.appointments)) {
        // Case 2: Object with appointments array
        appointments = response.data.appointments
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        // Case 3: Common API wrapper format
        appointments = response.data.data
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        // Case 4: Another common format
        appointments = response.data.items
      } else {
        console.warn("Unexpected API response format:", response.data)
        throw new Error("Unexpected data format received from server")
      }

      setCounselorAppointments(appointments)
      return appointments
    } catch (err) {
      console.error("Error fetching counselor appointments:", {
        error: err,
        response: err.response?.data,
      })

      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch counselor appointments"
      setError(errorMsg)
      setCounselorAppointments([])
      throw err
    } finally {
      setLoading(false)
    }
  }, [getAuthHeader])

  const bookAppointment = useCallback(
    async (appointmentData) => {
      try {
        setLoading(true)
        setError(null)

        if (!appointmentData.counselor || !appointmentData.dateTime || !appointmentData.type) {
          throw new Error("Missing required appointment fields")
        }

        const fullAppointmentData = {
          counselor: appointmentData.counselor,
          dateTime: appointmentData.dateTime,
          duration: appointmentData.duration || 60,
          type: appointmentData.type,
          topic: appointmentData.topic || "",
          notes: appointmentData.notes || "",
          status: "pending",
        }

        const response = await axios.post(`${API_URL}/appointments`, fullAppointmentData, getAuthHeader())

        // Update local state optimistically
        setUserAppointments((prev) => (prev ? [...prev, response.data] : [response.data]))

        if (user?.role === "counselor") {
          setCounselorAppointments((prev) => (prev ? [...prev, response.data] : [response.data]))
        }

        return response.data
      } catch (err) {
        console.error("Booking error:", {
          error: err,
          response: err.response?.data,
        })

        const errorMsg = err.response?.data?.message || err.message || "Failed to book appointment"
        setError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [getAuthHeader, user?.role],
  )

  const updateAppointmentStatus = useCallback(
    async (appointmentId, status) => {
      try {
        setLoading(true)
        setError(null)

        const response = await axios.patch(
          `${API_URL}/appointments/${appointmentId}/status`,
          { status },
          getAuthHeader(),
        )

        // Update both appointment lists
        setCounselorAppointments((prev) => prev?.map((apt) => (apt._id === appointmentId ? { ...apt, status } : apt)))
        setUserAppointments((prev) => prev?.map((apt) => (apt._id === appointmentId ? { ...apt, status } : apt)))

        return response.data
      } catch (err) {
        console.error("Status update error:", {
          error: err,
          response: err.response?.data,
        })

        const errorMsg = err.response?.data?.message || "Failed to update appointment status"
        setError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [getAuthHeader],
  )

  const rescheduleAppointment = useCallback(
    async (appointmentId, newDateTime) => {
      try {
        setLoading(true)
        setError(null)

        const response = await axios.patch(
          `${API_URL}/appointments/${appointmentId}/reschedule`,
          { dateTime: newDateTime },
          getAuthHeader(),
        )

        // Update both appointment lists
        setCounselorAppointments((prev) =>
          prev?.map((apt) => (apt._id === appointmentId ? { ...apt, dateTime: newDateTime } : apt)),
        )
        setUserAppointments((prev) =>
          prev?.map((apt) => (apt._id === appointmentId ? { ...apt, dateTime: newDateTime } : apt)),
        )

        return response.data
      } catch (err) {
        console.error("Reschedule error:", {
          error: err,
          response: err.response?.data,
        })

        const errorMsg = err.response?.data?.message || "Failed to reschedule appointment"
        setError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [getAuthHeader],
  )

  const cancelAppointment = useCallback(
    async (appointmentId) => {
      try {
        setLoading(true)
        setError(null)

        const response = await axios.patch(
          `${API_URL}/appointments/${appointmentId}/cancel`,
          {}, // empty body since we're just cancelling
          getAuthHeader(),
        )

        // Update both appointment lists
        setCounselorAppointments((prev) =>
          prev?.map((apt) => (apt._id === appointmentId ? { ...apt, status: "cancelled" } : apt)),
        )
        setUserAppointments((prev) =>
          prev?.map((apt) => (apt._id === appointmentId ? { ...apt, status: "cancelled" } : apt)),
        )

        return response.data
      } catch (err) {
        console.error("Cancel error:", {
          error: err,
          response: err.response?.data,
        })

        const errorMsg = err.response?.data?.message || "Failed to cancel appointment"
        setError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [getAuthHeader],
  )

  // New method for generating video session token
  const generateVideoToken = useCallback(
    async (appointmentId) => {
      try {
        setLoading(true)
        setError(null)

        const response = await axios.post(`${API_URL}/video/token/${appointmentId}`, {}, getAuthHeader())

        return response.data
      } catch (err) {
        console.error("Video token error:", {
          error: err,
          response: err.response?.data,
        })

        const errorMsg = err.response?.data?.message || "Failed to generate video session token"
        setError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [getAuthHeader],
  )

  // New method for ending video session
  const endVideoSession = useCallback(
    async (appointmentId) => {
      try {
        setLoading(true)
        setError(null)

        const response = await axios.post(`${API_URL}/video/end/${appointmentId}`, {}, getAuthHeader())

        // Update appointment status to completed
        const updatedAppointment = response.data?.data?.appointment || { status: "completed" }

        setCounselorAppointments((prev) =>
          prev?.map((apt) => (apt._id === appointmentId ? { ...apt, status: updatedAppointment.status } : apt)),
        )
        setUserAppointments((prev) =>
          prev?.map((apt) => (apt._id === appointmentId ? { ...apt, status: updatedAppointment.status } : apt)),
        )

        return response.data
      } catch (err) {
        console.error("End video session error:", {
          error: err,
          response: err.response?.data,
        })

        const errorMsg = err.response?.data?.message || "Failed to end video session"
        setError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [getAuthHeader],
  )

  const value = {
    userAppointments,
    counselorAppointments,
    loading,
    error,
    clearError,
    getUserAppointments,
    getCounselorAppointments,
    bookAppointment,
    updateAppointmentStatus,
    rescheduleAppointment,
    cancelAppointment,
    generateVideoToken,
    endVideoSession,
  }

  return <AppointmentContext.Provider value={value}>{children}</AppointmentContext.Provider>
}
