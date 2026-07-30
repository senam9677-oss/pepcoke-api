const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const Notification = require("../models/Notification");

// Get logged-in user's notifications
router.get("/", auth, async (req, res) => {
  try {

    const notifications = await Notification.find({
      user: req.user.id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      notifications,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
});

module.exports = router;
