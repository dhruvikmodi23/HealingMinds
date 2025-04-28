"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../services/api"
import {
  UserGroupIcon,
  CheckBadgeIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  HeartIcon,
} from "@heroicons/react/24/outline"
import { toast } from "react-hot-toast"

const AdminCounselors = () => {
  const [counselors, setCounselors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await api.get("/admin/counselors")
        setCounselors(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching counselors:", error)
        setError(error.message || "Failed to load counselors")
        setCounselors([])
      } finally {
        setLoading(false)
      }
    }

    fetchCounselors()
  }, [])

  const filteredCounselors = counselors.filter((counselor) => {
    const matchesSearch =
      counselor.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counselor.specializations?.some((spec) => spec.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && counselor.isVerified) ||
      (statusFilter === "pending" && !counselor.isVerified)
    return matchesSearch && matchesStatus
  })

  const handleVerify = async (counselorId) => {
    try {
      setActionLoading(counselorId)

      await api.patch(`/admin/counselors/${counselorId}/verify`)

      setCounselors(counselors.map((c) => (c._id === counselorId ? { ...c, isVerified: true } : c)))

      toast.success("Counselor verified successfully")
    } catch (error) {
      console.error("Error verifying counselor:", error)
      toast.error(error.message || "Failed to verify counselor")
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleActive = async (counselorId, isActive) => {
    try {
      setActionLoading(counselorId)

      await api.patch(`/admin/counselors/${counselorId}`, { isActive })

      setCounselors(counselors.map((c) => (c._id === counselorId ? { ...c, isActive } : c)))

      toast.success(`Counselor ${isActive ? "activated" : "deactivated"} successfully`)
    } catch (error) {
      console.error("Error toggling active status:", error)
      toast.error(error.message || "Failed to update status")
    } finally {
      setActionLoading(null)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Counselor Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <Link
              to="/admin"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 mr-3">
                    <UserGroupIcon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Counselor Management</h2>
                </div>
                <p className="text-gray-600 max-w-3xl">Review and manage all counselor profiles</p>
              </div>
              {/* <Link
                to="/admin/counselors/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-300"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Counselor
              </Link> */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-blue-100 flex items-center justify-center">
                <HeartIcon className="h-12 w-12 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-8 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search counselors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <button
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
              }}
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Counselors Table */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse flex justify-center">
                <div className="h-8 w-8 bg-blue-200 rounded-full"></div>
              </div>
              <p className="text-gray-500 mt-2">Loading counselors...</p>
            </div>
          ) : filteredCounselors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No counselors found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-100">
                <thead className="bg-blue-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                    >
                      Counselor
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                    >
                      Specializations
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-blue-100">
                  {filteredCounselors.map((counselor) => (
                    <tr key={counselor._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserGroupIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{counselor.user?.name || "No name"}</div>
                            <div className="text-sm text-gray-500">{counselor.experience || 0} years experience</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {counselor.specializations?.slice(0, 3).map((spec) => (
                            <span key={spec} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {spec}
                            </span>
                          ))}
                          {counselor.specializations?.length > 3 && (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                              +{counselor.specializations.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              counselor.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {counselor.isVerified ? "Verified" : "Pending Verification"}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              counselor.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {counselor.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {!counselor.isVerified && (
                            <button
                              onClick={() => handleVerify(counselor._id)}
                              disabled={actionLoading === counselor._id}
                              className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50 disabled:opacity-50"
                              title="Verify"
                            >
                              {actionLoading === counselor._id ? (
                                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckBadgeIcon className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleActive(counselor._id, !counselor.isActive)}
                            disabled={actionLoading === counselor._id}
                            className={`p-1 rounded-full disabled:opacity-50 ${
                              counselor.isActive
                                ? "text-red-600 hover:text-red-900 hover:bg-red-50"
                                : "text-green-600 hover:text-green-900 hover:bg-green-50"
                            }`}
                            title={counselor.isActive ? "Deactivate" : "Activate"}
                          >
                            {actionLoading === counselor._id ? (
                              <ArrowPathIcon className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircleIcon className="h-4 w-4" />
                            )}
                          </button>
                          {/* <Link
                            to={`/admin/users/edit/${counselor._id}`}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link> */}
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
  )
}

export default AdminCounselors

