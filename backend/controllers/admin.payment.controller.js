const Payment = require("../models/Payment.model")
const User = require("../models/User.model")
const AppError = require("../utils/errorResponse")
const razorpay = require("../config/razorpay")

// Helper function for responses
const sendResponse = (res, statusCode, data) => {
  res.status(statusCode).json({
    success: true,
    data,
  })
}

// Get all payments with filtering and pagination
exports.getAllPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search, startDate, endDate } = req.query

    const query = {}

    // Filter by status
    if (status && status !== "all") {
      query.status = status
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) {
        query.createdAt.$gte = new Date(startDate)
      }
      if (endDate) {
        // Set to end of day
        const endOfDay = new Date(endDate)
        endOfDay.setHours(23, 59, 59, 999)
        query.createdAt.$lte = endOfDay
      }
    }

    // Search by user email or name
    if (search) {
      const users = await User.find({
        $or: [{ email: { $regex: search, $options: "i" } }, { name: { $regex: search, $options: "i" } }],
      }).select("_id")

      const userIds = users.map((user) => user._id)
      query.user = { $in: userIds }
    }

    // Count total documents for pagination
    const total = await Payment.countDocuments(query)

    // Get paginated results
    const payments = await Payment.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number.parseInt(limit))

    sendResponse(res, 200, {
      data: payments,
      total,
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    next(err)
  }
}

// Get payment by ID
exports.getPaymentById = async (req, res, next) => {
  try {
    const { paymentId } = req.params

    const payment = await Payment.findById(paymentId).populate("user", "name email")

    if (!payment) {
      throw new AppError("Payment not found", 404)
    }

    sendResponse(res, 200, payment)
  } catch (err) {
    next(err)
  }
}

// Process refund
exports.refundPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params

    const payment = await Payment.findById(paymentId)
    if (!payment) {
      throw new AppError("Payment not found", 404)
    }

    if (payment.status !== "captured") {
      throw new AppError("Only successful payments can be refunded", 400)
    }

    if (!payment.razorpayPaymentId) {
      throw new AppError("Cannot refund this payment", 400)
    }

    // Process refund in Razorpay
    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      notes: {
        reason: req.body.reason || "requested_by_admin",
      },
    })

    // Update payment status
    payment.status = "refunded"
    payment.refundedAt = new Date()
    payment.refundId = refund.id
    payment.metadata = {
      ...payment.metadata,
      refundReason: req.body.reason || "requested_by_admin",
    }
    await payment.save()

    // Update user subscription if needed
    if (payment.plan) {
      const user = await User.findById(payment.user)
      if (user && user.subscription && user.subscription.plan === payment.plan) {
        user.subscription = {
          plan: "free",
          status: "cancelled",
          startDate: null,
          endDate: null,
        }
        await user.save()
      }
    }

    sendResponse(res, 200, {
      message: "Payment refunded successfully",
      payment,
    })
  } catch (err) {
    next(err)
  }
}

// Get payment analytics
exports.getPaymentAnalytics = async (req, res, next) => {
  try {
    const { period = "month" } = req.query

    let startDate
    const endDate = new Date()

    // Set start date based on period
    if (period === "week") {
      startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)
    } else if (period === "month") {
      startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)
    } else if (period === "year") {
      startDate = new Date()
      startDate.setFullYear(startDate.getFullYear() - 1)
    } else {
      throw new AppError("Invalid period. Use week, month, or year", 400)
    }

    // Get total revenue
    const totalRevenue = await Payment.aggregate([
      {
        $match: {
          status: "captured",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ])

    // Get revenue by plan
    const revenueByPlan = await Payment.aggregate([
      {
        $match: {
          status: "captured",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$plan",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ])

    // Get revenue by day (for charts)
    const revenueByDay = await Payment.aggregate([
      {
        $match: {
          status: "captured",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
    ])

    // Format revenue by day for charts
    const formattedRevenueByDay = revenueByDay.map((item) => {
      const date = new Date(item._id.year, item._id.month - 1, item._id.day)
      return {
        date: date.toISOString().split("T")[0],
        total: item.total,
        count: item.count,
      }
    })

    sendResponse(res, 200, {
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      totalTransactions: totalRevenue.length > 0 ? totalRevenue[0].count : 0,
      revenueByPlan,
      revenueByDay: formattedRevenueByDay,
    })
  } catch (err) {
    next(err)
  }
}
