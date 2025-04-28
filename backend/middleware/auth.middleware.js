const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const ErrorResponse = require("../utils/errorResponse");

exports.protect = async (req, res, next) => {
  let token;

  try {
    // Get token from header or cookie
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      console.error('No token provided');
      return res.status(401).json({
        success: false,
        error: "Not authorized to access this route - no token"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user with password field excluded
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      console.error('User not found for token');
      return res.status(401).json({
        success: false,
        error: "User not found"
      });
    }

    // Add user role to request for easier access
    req.userRole = req.user.role;
    
    next();
  } catch (err) {
    console.error('Authentication error:', err.message);
    
    let errorMessage = "Not authorized to access this route";
    if (err.name === 'JsonWebTokenError') {
      errorMessage = "Invalid token";
    } else if (err.name === 'TokenExpiredError') {
      errorMessage = "Token expired";
    }

    return res.status(401).json({
      success: false,
      error: errorMessage
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        console.error('No user in request during authorization');
        return res.status(401).json({
          success: false,
          error: "User not authenticated"
        });
      }

      if (!roles.includes(req.user.role)) {
        console.error(`User role ${req.user.role} not authorized`);
        return res.status(403).json({
          success: false,
          error: `User role ${req.user.role} is not authorized to access this route`
        });
      }

      next();
    } catch (err) {
      console.error('Authorization error:', err);
      return res.status(500).json({
        success: false,
        error: "Authorization check failed"
      });
    }
  };
};