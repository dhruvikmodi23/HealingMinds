// controllers/user.controller.js
const User = require('../models/User.model');
const Counselor = require('../models/Counselor.model');
const Assessment = require('../models/Assessment.model');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/errorResponse');

// Helper function for responses
const sendResponse = (res, statusCode, data) => {
  res.status(statusCode).json({
    success: true,
    data
  });
};

// Get user profile
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) throw new AppError('User not found', 404);

    if (user.role === 'counselor') {
      const counselorProfile = await Counselor.findOne({ user: req.user.id });
      return sendResponse(res, 200, { ...user.toObject(), counselorProfile });
    }

    sendResponse(res, 200, user);
  } catch (err) {
    next(err);
  }
};

// Update profile
// controllers/user.controller.js
exports.updateUserProfile = async (req, res, next) => {
  try {
    const { name, age, gender, profession } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, age, gender, profession },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) throw new AppError('User not found', 404);
    
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('Please upload a file', 400);
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'avatars',
      width: 500,
      height: 500,
      crop: 'fill',
      quality: 'auto:good'
    });

    // Delete temporary file
    const fs = require('fs');
    fs.unlinkSync(req.file.path);

    // Delete old avatar if exists
    const user = await User.findById(req.user.id);
    if (user.avatar) {
      const publicId = user.avatar.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`avatars/${publicId}`);
    }

    // Update user with new avatar URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      avatarUrl: updatedUser.avatar
    });
  } catch (err) {
    next(err);
  }
};

// Delete avatar
exports.deleteAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.avatar) throw new AppError('No avatar to delete', 400);

    const publicId = user.avatar.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`avatars/${publicId}`);

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: null },
      { new: true }
    ).select('-password');

    sendResponse(res, 200, updatedUser);
  } catch (err) {
    next(err);
  }
};

// Get subscription
exports.getUserSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('subscription');
    if (!user) throw new AppError('User not found', 404);
    sendResponse(res, 200, user.subscription);
  } catch (err) {
    next(err);
  }
};

// Update subscription
exports.updateUserSubscription = async (req, res, next) => {
  try {
    const { plan, status } = req.body;
    if (!['free', 'standard', 'premium'].includes(plan)) {
      throw new AppError('Invalid subscription plan', 400);
    }

    const subscription = {
      plan,
      status: status || 'active',
      startDate: plan !== 'free' ? new Date() : null,
      endDate: plan !== 'free' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { subscription },
      { new: true }
    ).select('subscription');

    sendResponse(res, 200, user.subscription);
  } catch (err) {
    next(err);
  }
};

// Get assessments
exports.getUserAssessments = async (req, res, next) => {
  try {
    const assessments = await Assessment.find({ user: req.user.id })
      .sort({ completedAt: -1 });

    sendResponse(res, 200, {
      count: assessments.length,
      data: assessments
    });
  } catch (err) {
    next(err);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) throw new AppError('User not found', 404);

    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) throw new AppError('Current password is incorrect', 401);

    user.password = req.body.newPassword;
    await user.save();

    sendResponse(res, 200, { message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

// Delete account
exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) throw new AppError('User not found', 404);

    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) throw new AppError('Password is incorrect', 401);

    if (user.avatar) {
      const publicId = user.avatar.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`avatars/${publicId}`);
    }

    await User.findByIdAndDelete(req.user.id);
    await Counselor.findOneAndDelete({ user: req.user.id });
    await Assessment.deleteMany({ user: req.user.id });

    sendResponse(res, 200, { message: 'Account deleted successfully' });
  } catch (err) {
    next(err);
  }
};