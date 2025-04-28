const User = require('../models/User.model');
const Counselor = require('../models/Counselor.model');
const Appointment = require('../models/Appointment.model');
const Payment = require('../models/Payment.model');
const mongoose = require('mongoose');

// Helper function for pagination
const getPaginationOptions = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

// @desc    Get all users with pagination, filtering, sorting
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req);
    
    // Filtering
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isVerified) filter.isVerified = req.query.isVerified === 'true';
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Sorting
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }
    
    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort(sort);
      
    const totalUsers = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total: totalUsers,
      page,
      pages: Math.ceil(totalUsers / limit),
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    // Prevent updating password via this route
    if (req.body.password) {
      delete req.body.password;
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Also delete associated counselor profile if exists
    await Counselor.findOneAndDelete({ user: user._id });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all counselors with pagination, filtering, sorting
// @route   GET /api/admin/counselors
// @access  Private/Admin
exports.getAllCounselors = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req);
    
    // Filtering
    const filter = {};
    if (req.query.isVerified) filter.isVerified = req.query.isVerified === 'true';
    if (req.query.isActive) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      filter.$or = [
        { bio: { $regex: req.query.search, $options: 'i' } },
        { specializations: { $regex: req.query.search, $options: 'i' } },
        { 'user.name': { $regex: req.query.search, $options: 'i' } },
        { 'user.email': { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Sorting
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }
    
    const counselors = await Counselor.find(filter)
      .populate('user', 'name email avatar isVerified')
      .skip(skip)
      .limit(limit)
      .sort(sort);
      
    const totalCounselors = await Counselor.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: counselors.length,
      total: totalCounselors,
      page,
      pages: Math.ceil(totalCounselors / limit),
      data: counselors
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify counselor
// @route   PATCH /api/admin/counselors/:id/verify
// @access  Private/Admin
exports.verifyCounselor = async (req, res, next) => {
  try {
    const counselor = await Counselor.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).populate('user', 'name email avatar');

    if (!counselor) {
      return res.status(404).json({ success: false, message: 'Counselor not found' });
    }

    // Also update user's isVerified status
    await User.findByIdAndUpdate(counselor.user._id, { isVerified: true });

    res.status(200).json({
      success: true,
      data: counselor
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all appointments with pagination, filtering
// @route   GET /api/admin/appointments
// @access  Private/Admin
exports.getAllAppointments = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req);
    
    // Filtering
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.dateFrom || req.query.dateTo) {
      filter.dateTime = {};
      if (req.query.dateFrom) filter.dateTime.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) filter.dateTime.$lte = new Date(req.query.dateTo);
    }
    if (req.query.userId) filter.user = new mongoose.Types.ObjectId(req.query.userId);
    if (req.query.counselorId) filter.counselor = new mongoose.Types.ObjectId(req.query.counselorId);
    
    const appointments = await Appointment.find(filter)
      .populate('user', 'name email')
      .populate({ 
        path: 'counselor',
        populate: { path: 'user', select: 'name email' }
      })
      .skip(skip)
      .limit(limit)
      .sort({ dateTime: -1 });
      
    const totalAppointments = await Appointment.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total: totalAppointments,
      page,
      pages: Math.ceil(totalAppointments / limit),
      data: appointments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Counts
    const usersCount = await User.countDocuments();
    const counselorsCount = await Counselor.countDocuments();
    const appointmentsCount = await Appointment.countDocuments();
    const pendingCounselorsCount = await Counselor.countDocuments({ isVerified: false });
    
    // Recent appointments
    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name')
      .populate({ path: 'counselor', populate: { path: 'user', select: 'name' } });

    // Weekly stats
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyStats = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: oneWeekAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          users: usersCount,
          counselors: counselorsCount,
          appointments: appointmentsCount,
          pendingCounselors: pendingCounselorsCount
        },
        recentAppointments,
        weeklyStats
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get revenue stats
// @route   GET /api/admin/revenue
// @access  Private/Admin
exports.getRevenueStats = async (req, res, next) => {
  try {
    // Total revenue
    const revenueStats = await Payment.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly revenue
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          _id: 0,
          month: { $concat: [
            { $toString: '$_id.year' },
            '-',
            { $toString: '$_id.month' }
          ]},
          total: 1,
          count: 1
        }
      }
    ]);

    // Revenue by plan
    const revenueByPlan = await Payment.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: '$plan',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0,
        totalPayments: revenueStats.length > 0 ? revenueStats[0].count : 0,
        monthlyRevenue,
        revenueByPlan
      }
    });
  } catch (err) {
    next(err);
  }
};