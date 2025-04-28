"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../../services/api"
import { CheckCircle, AlertCircle } from "lucide-react"

const SUBSCRIPTION_PLANS = [
  {
    id: "free",
    name: "Free Plan",
    price: 0,
    features: ["Access to self-assessment tools", "Limited articles and resources", "Community forum access"],
    buttonText: "Current Plan",
    recommended: false,
  },
  {
    id: "standard",
    name: "Standard Plan",
    price: 79900,
    features: [
      "Everything in Free Plan",
      "2 counseling sessions per month",
      "Priority messaging with counselors",
      "Unlimited access to resources",
    ],
    buttonText: "Select Plan",
    recommended: true,
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: 99900,
    features: [
      "Everything in Standard Plan",
      "5 counseling sessions per month",
      "24/7 emergency support",
      "Personalized wellness plan",
      "Progress tracking tools",
    ],
    buttonText: "Select Plan",
    recommended: false,
  },
]

export default function PaymentPage() {
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    // Set the initial selected plan based on user's current subscription
    if (user && user.subscription) {
      setSelectedPlan(user.subscription.plan)
    }

    // Load Razorpay script
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [user])

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId)
    setError(null)
    setSuccess(null)
  }

  const handleSubscribe = async () => {
    if (!selectedPlan || selectedPlan === "free") {
      setError("Please select a paid subscription plan")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get the selected plan details
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlan)

      // Create order on the server
      const orderResponse = await api.post("/payments/create-order", {
        plan: selectedPlan,
        amount: plan.price,
      })

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: plan.price, // Amount in paise
        currency: "INR",
        name: "Mental Health Platform",
        description: `Subscription to ${plan.name}`,
        order_id: orderResponse.orderId,
        handler: async (response) => {
          try {
            // Verify payment on the server
            const verifyResponse = await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: selectedPlan,
            })

            setSuccess(`Successfully subscribed to ${selectedPlan} plan`)

            // Update user context with new subscription info
            if (updateProfile) {
              await updateProfile({ subscription: verifyResponse.subscription })
            }

            setTimeout(() => {
              navigate("/user/profile")
            }, 2000)
          } catch (err) {
            setError(err.response?.data?.message || "Payment verification failed")
          } finally {
            setLoading(false)
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#3B82F6",
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create payment order")
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return (price / 100).toFixed(2)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Subscription Plans</h1>

      {import.meta.env.VITE_RAZORPAY_KEY_ID?.startsWith("rzp_test_") && (
        <div className="mb-6 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-center text-yellow-700 text-sm">
          Test Mode - No real payments will be processed
        </div>
      )}

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

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`border rounded-lg overflow-hidden transition-all ${
              selectedPlan === plan.id
                ? "border-blue-500 shadow-lg transform scale-105"
                : "border-gray-200 hover:shadow-md"
            } ${plan.recommended ? "relative" : ""}`}
          >
            {plan.recommended && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-medium">
                Recommended
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-3xl font-bold mb-4">
                {plan.price === 0 ? "Free" : `₹${formatPrice(plan.price)}`}
                {plan.price > 0 && <span className="text-sm font-normal text-gray-500">/month</span>}
              </p>
              <ul className="mb-6 space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePlanSelect(plan.id)}
                disabled={user?.subscription?.plan === plan.id && plan.id === "free"}
                className={`w-full py-2 px-4 rounded-md font-medium ${
                  user?.subscription?.plan === plan.id
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : selectedPlan === plan.id
                      ? "bg-blue-600 text-white"
                      : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                }`}
              >
                {user?.subscription?.plan === plan.id ? "Current Plan" : plan.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedPlan && selectedPlan !== user?.subscription?.plan && selectedPlan !== "free" && (
        <div className="max-w-2xl mx-auto text-center">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 font-medium text-lg"
          >
            {loading
              ? "Processing..."
              : `Subscribe to ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan`}
          </button>
          <p className="mt-4 text-sm text-gray-500">
            You will be redirected to Razorpay to complete your payment securely.
          </p>
        </div>
      )}
    </div>
  )
}
