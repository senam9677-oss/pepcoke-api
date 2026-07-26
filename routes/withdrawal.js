const express = require("express");
const router = express.Router();

const Withdrawal = require("../models/Withdrawal");

// Create a withdrawal request
router.post("/", async (req, res) => {
  try {
    const {
      user,
      amount,
      paymentMethod,
      accountNumber,
      accountName,
    } = req.body;

    const withdrawal = new Withdrawal({
      user,
      amount,
      paymentMethod,
      accountNumber,
      accountName,
    });

    await withdrawal.save();

    res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully",
      withdrawal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all withdrawal requests
router.get("/", async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().populate("user");

    res.json({
      success: true,
      withdrawals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
