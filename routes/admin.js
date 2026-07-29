const express = require("express");
const auth = require("../middleware/auth");

const Deposit = require("../models/Deposit");
const Withdrawal = require("../models/Withdrawal");
const User = require("../models/User");
const Investment = require("../models/Investment");
const InvestmentPlan = require("../models/InvestmentPlan");

const router = express.Router();


// Get all users
router.get("/users", auth, async (req, res) => {
  try {

    const users = await User.find().select("-password");

    res.json({
      success: true,
      users,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
});



// Get all deposits
router.get("/deposits", auth, async (req, res) => {
  try {

    const deposits = await Deposit.find();

console.log(deposits);

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



// Approve Deposit and Create Investment
router.put("/deposit/:id", auth, async (req, res) => {
  try {

    const deposit = await Deposit.findById(req.params.id);


    if (!deposit) {

      return res.status(404).json({
        success: false,
        message: "Deposit not found",
      });

    }


    const plan = await InvestmentPlan.findById(deposit.plan);


    if (!plan) {

      return res.status(404).json({
        success: false,
        message: "Investment plan not found",
      });

    }


    deposit.status = "Approved";
    await deposit.save();



    await User.findByIdAndUpdate(deposit.user, {

      $inc: {
        balance: deposit.amount
      }

    });



    await Investment.create({

      user: deposit.user,

      plan: plan._id,

      amount: deposit.amount,

      dailyEarning:
        (plan.amount * plan.returnPercentage) / 100,

      totalReturn:
        plan.totalReturn,

      status: "Active"

    });



    res.json({

      success: true,

      message:
      "Deposit approved and investment created",

    });


  } catch (error) {


    res.status(500).json({

      success: false,

      message: error.message,

    });


  }
});




// Get all withdrawals
router.get("/withdrawals", auth, async (req, res) => {
  try {

    const withdrawals = await Withdrawal.find()
      .populate("user");

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




// Approve Withdrawal
router.put("/withdrawal/:id", auth, async (req, res) => {
  try {

    const withdrawal = await Withdrawal.findById(req.params.id);


    if (!withdrawal) {

      return res.status(404).json({
        success: false,
        message: "Withdrawal not found",
      });

    }


    withdrawal.status = "Approved";

    await withdrawal.save();


    res.json({

      success: true,

      message: "Withdrawal approved",

    });


  } catch (error) {


    res.status(500).json({

      success: false,

      message: error.message,

    });


  }
});




// Suspend or Activate User
router.put("/user/:id", auth, async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.status =
      user.status === "Active"
        ? "Suspended"
        : "Active";

    await user.save();

    res.json({
      success: true,
      message: `User ${user.status.toLowerCase()} successfully`,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
});



module.exports = router;
