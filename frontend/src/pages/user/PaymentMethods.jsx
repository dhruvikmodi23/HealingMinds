"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import api from "../../services/api"
import { CreditCard, Trash2, CheckCircle, AlertCircle } from "lucide-react"

export default function PaymentMethods() {
  const { user } = useAuth()
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showAddCard, setShowAddCard] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
  })
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true)
      const response = await api.get("/payments/methods")
      setPaymentMethods(response)
      setError(null)
    } catch (err) {
      setError("Failed to load payment methods. Please try again later.")
      console.error("Error fetching payment methods:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCardInputChange = (e) => {
    const { name, value } = e.target
    setCardDetails({
      ...cardDetails,
      [name]: value,
    })
  }

  const handleAddCard = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await api.post("/payments/methods", cardDetails)
      setSuccess("Payment method added successfully")
      setShowAddCard(false)
      setCardDetails({
        cardNumber: "",
        cardExpiry: "",
        cardCvc: "",
        cardName: "",
      })
      fetchPaymentMethods()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add payment method")
    } finally {
      setLoading(false)
    }
  }

  const handleSetDefault = async (methodId) => {
    try {
      setLoading(true)
      await api.put(`/payments/methods/${methodId}/default`)
      setSuccess("Default payment method updated")
      fetchPaymentMethods()
    } catch (err) {
      setError("Failed to update default payment method")
      console.error("Error setting default payment method:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMethod = async (methodId) => {
    try {
      setLoading(true)
      await api.delete(`/payments/methods/${methodId}`)
      setSuccess("Payment method deleted successfully")
      setDeleteConfirm(null)
      fetchPaymentMethods()
    } catch (err) {
      setError("Failed to delete payment method")
      console.error("Error deleting payment method:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatCardNumber = (number) => {
    return `•••• •••• •••• ${number.slice(-4)}`
  }

  if (loading && paymentMethods.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Payment Methods</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Payment Methods</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center text-green-700">
          <CheckCircle className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Cards</h2>
          <button
            onClick={() => setShowAddCard(!showAddCard)}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium flex items-center"
          >
            {showAddCard ? "Cancel" : "+ Add New Card"}
          </button>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 text-lg">No payment methods found</p>
            <p className="text-gray-500 mb-4">Add a credit or debit card to make payments</p>
            <button
              onClick={() => setShowAddCard(true)}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
            >
              Add Payment Method
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method._id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="mr-4 bg-gray-100 p-2 rounded-md">
                      {method.brand === "visa" ? (
                        <span className="text-blue-600 font-bold text-lg">VISA</span>
                      ) : method.brand === "mastercard" ? (
                        <span className="text-red-600 font-bold text-lg">MC</span>
                      ) : (
                        <span className="font-bold text-lg">{method.brand}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{formatCardNumber(method.last4)}</p>
                      <p className="text-sm text-gray-500">
                        Expires {method.expMonth}/{method.expYear}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {method.isDefault ? (
                      <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">Default</span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(method._id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Set as Default
                      </button>
                    )}

                    {deleteConfirm === method._id ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Confirm delete?</span>
                        <button
                          onClick={() => handleDeleteMethod(method._id)}
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(method._id)}
                        className="text-red-500 hover:text-red-700"
                        disabled={method.isDefault && paymentMethods.length > 1}
                        title={
                          method.isDefault && paymentMethods.length > 1 ? "Cannot delete default payment method" : ""
                        }
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddCard && (
        <div className="border rounded-lg p-6 bg-gray-50 mb-8">
          <h3 className="text-lg font-medium mb-4">Add New Card</h3>
          <form onSubmit={handleAddCard}>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={handleCardInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name on Card</label>
                <input
                  type="text"
                  name="cardName"
                  placeholder="John Doe"
                  value={cardDetails.cardName}
                  onChange={handleCardInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiration Date</label>
                <input
                  type="text"
                  name="cardExpiry"
                  placeholder="MM/YY"
                  value={cardDetails.cardExpiry}
                  onChange={handleCardInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CVC</label>
                <input
                  type="text"
                  name="cardCvc"
                  placeholder="123"
                  value={cardDetails.cardCvc}
                  onChange={handleCardInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
                disabled={loading}
              >
                {loading ? "Processing..." : "Add Card"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddCard(false)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
