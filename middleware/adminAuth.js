const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    // Make sure the normal authentication middleware
    // has already identified the user.
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    // Get the user from the database
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found."
      });
    }

    // Check administrator role
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Administrator access required."
      });
    }

    // Attach the complete user to the request
    req.admin = user;

    next();

  } catch (error) {

    console.error("Admin authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while checking administrator access."
    });

  }
};
