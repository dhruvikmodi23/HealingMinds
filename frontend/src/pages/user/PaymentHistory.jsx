"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import api from "../../services/api"
import { Download, AlertCircle } from "lucide-react"

export default function PaymentHistory() {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPaymentHistory()
  }, [])

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true)
      const response = await api.get("/payments/history")
      setPayments(response)
      setError(null)
    } catch (err) {
      setError("Failed to load payment history. Please try again later.")
      console.error("Error fetching payment history:", err)
    } finally {
      setLoading(false)
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

  const downloadInvoice = async (paymentId) => {
    try {
      const response = await api.get(`/payments/invoice/${paymentId}`, {
        responseType: "blob",
      })

      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `invoice-${paymentId}.pdf`)

      // Append to html link element page
      document.body.appendChild(link)

      // Start download
      link.click()

      // Clean up and remove the link
      link.parentNode.removeChild(link)
    } catch (err) {
      console.error("Error downloading invoice:", err)
      alert("Failed to download invoice. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Payment History</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Payment History</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {payments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No payment records found.</p>
          <p className="text-gray-500">Your payment history will appear here once you make a subscription payment.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
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
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="py-4 px-4 whitespace-nowrap">{formatDate(payment.createdAt)}</td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{payment.description}</div>
                    <div className="text-sm text-gray-500">
                      {payment.plan.charAt(0).toUpperCase() + payment.plan.slice(1)} Plan
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap font-medium">₹{(payment.amount / 100).toFixed(2)}</td>
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
                  <td className="py-4 px-4 whitespace-nowrap">
                    {payment.status === "captured" && (
                      <button
                        onClick={() => downloadInvoice(payment._id)}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        <span>Invoice</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
