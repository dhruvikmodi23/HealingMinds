"use client"

import { useState, useEffect } from "react"
import api from "../../services/api"
import { Download, Search, Filter, AlertCircle } from "lucide-react"

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  useEffect(() => {
    fetchPayments()
  }, [pagination.page, statusFilter])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: statusFilter !== "all" ? statusFilter : "",
        search: searchTerm,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })

      const response = await api.get(`/admin/payments?${queryParams}`)
      setPayments(response.data)
      setPagination({
        ...pagination,
        total: response.total,
      })
      setError(null)
    } catch (err) {
      setError("Failed to load payment data. Please try again later.")
      console.error("Error fetching payments:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination({ ...pagination, page: 1 })
    fetchPayments()
  }

  const handleDateChange = (e) => {
    const { name, value } = e.target
    setDateRange({
      ...dateRange,
      [name]: value,
    })
  }

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value)
    setPagination({ ...pagination, page: 1 })
  }

  const handleRefund = async (paymentId) => {
    if (!window.confirm("Are you sure you want to process this refund?")) {
      return
    }

    try {
      await api.post(`/admin/payments/${paymentId}/refund`)
      fetchPayments()
      alert("Refund processed successfully")
    } catch (err) {
      alert("Failed to process refund. Please try again.")
      console.error("Error processing refund:", err)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount / 100)
  }

  if (loading && payments.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Payment Management</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Payment Management</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <form onSubmit={handleSearch} className="flex">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by user email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 pl-10 border rounded-md"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <button type="submit" className="ml-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                Search
              </button>
            </form>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <select value={statusFilter} onChange={handleStatusFilterChange} className="p-2 border rounded-md">
                <option value="all">All Statuses</option>
                <option value="captured">Paid</option>
                <option value="created">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="flex gap-2">
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="p-2 border rounded-md"
                placeholder="Start Date"
              />
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="p-2 border rounded-md"
                placeholder="End Date"
              />
              <button
                onClick={fetchPayments}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 px-4 text-center text-gray-500">
                    No payment records found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                      {payment._id.substring(0, 8)}...
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-gray-900">{payment.user.name}</div>
                      <div className="text-sm text-gray-500">{payment.user.email}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900">{payment.description}</div>
                      <div className="text-sm text-gray-500">
                        {payment.plan.charAt(0).toUpperCase() + payment.plan.slice(1)} Plan
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.status === "captured"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "created"
                              ? "bg-yellow-100 text-yellow-800"
                              : payment.status === "refunded"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {payment.status === "captured"
                          ? "Paid"
                          : payment.status === "created"
                            ? "Pending"
                            : payment.status === "refunded"
                              ? "Refunded"
                              : "Failed"}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        {payment.status === "captured" && (
                          <>
                            <button
                              onClick={() => window.open(`/admin/payments/${payment._id}/invoice`, "_blank")}
                              className="text-blue-600 hover:text-blue-800"
                              title="View Invoice"
                            >
                              <Download className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleRefund(payment._id)}
                              className="text-red-600 hover:text-red-800"
                              title="Process Refund"
                            >
                              Refund
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className={`px-3 py-1 rounded-md ${
                  pagination.page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page * pagination.limit >= pagination.total}
                className={`px-3 py-1 rounded-md ${
                  pagination.page * pagination.limit >= pagination.total
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
