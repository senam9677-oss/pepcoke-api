const express = require("express");
const InvestmentPlan = require("../models/InvestmentPlan");

const router = express.Router();

// Get all active investment plans
router.get("/", async (req, res) => {
  try {
    const plans = await InvestmentPlan.find({ active: true });

    res.json({
      success: true,
      plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Create a new investment plan (Admin)
router.post("/", async (req, res) => {
  try {
    const {
      name,
      amount,
      duration,
      returnPercentage,
      totalReturn,
    } = req.body;

    const plan = await InvestmentPlan.create({
      name,
      amount,
      duration,
      returnPercentage,
      totalReturn,
    });

    res.status(201).json({
      success: true,
      message: "Investment plan created successfully",
      plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;