const express = require("express");
const auth = require("../middleware/auth");
const Deposit = require("../models/Deposit");

const router = express.Router();

// Create Deposit
router.post("/", auth, async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId, plan } = req.body;

    const deposit = await Deposit.create({
  user: req.user.id,
  plan,
  amount,
  paymentMethod,
  transactionId,
});

    res.status(201).json({
      success: true,
      message: "Deposit request submitted successfully",
      deposit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get User Deposits
router.get("/", auth, async (req, res) => {
  try {
    const deposits = await Deposit.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      deposits,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
