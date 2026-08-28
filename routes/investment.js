const express = require("express");
const auth = require("../middleware/auth");

const User = require("../models/User");
const Investment = require("../models/Investment");
const InvestmentPlan = require("../models/InvestmentPlan");

const router = express.Router();


// ======================================================
// CREATE INVESTMENT FROM APPROVED BALANCE
// ======================================================

router.post("/", auth, async (req, res) => {

  try {

    const { plan } = req.body;


    // ==================================================
    // CHECK PLAN
    // ==================================================

    if (!plan) {

      return res.status(400).json({

        success: false,

        message: "Investment plan is required."

      });

    }


    // ==================================================
    // FIND USER
    // ==================================================

    const user =
      await User.findById(req.user.id);


    if (!user) {

      return res.status(404).json({

        success: false,

        message: "User not found."

      });

    }


    // ==================================================
    // FIND INVESTMENT PLAN
    // ==================================================

    const investmentPlan =
      await InvestmentPlan.findById(plan);


    if (
      !investmentPlan ||
      !investmentPlan.active
    ) {

      return res.status(404).json({

        success: false,

        message:
          "Investment plan not found or inactive."

      });

    }


    // ==================================================
    // PLAN AMOUNT
    // ==================================================

    const investmentAmount =
      Number(investmentPlan.amount);


    if (
      !Number.isFinite(investmentAmount) ||
      investmentAmount <= 0
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid investment plan amount."

      });

    }


    // ==================================================
    // CHECK AVAILABLE BALANCE
    // ==================================================

    const currentBalance =
      Number(user.balance) || 0;


    if (currentBalance < investmentAmount) {

      const needed =
        investmentAmount - currentBalance;


      return res.status(400).json({

        success: false,

        message:
          `Insufficient balance. You need GH₵${needed.toFixed(2)} more.`

      });

    }


    // ==================================================
    // DAILY EARNING
    // ==================================================

    // Get the rate from the selected plan.
    // Falls back to 2.22 if no rate exists.

    const dailyRate =
      Number(investmentPlan.returnPercentage) || 2.22;


    const dailyEarning =
      Number(
        (
          investmentAmount *
          dailyRate / 100
        ).toFixed(2)
      );


    // ==================================================
    // INVESTMENT DATES
    // ==================================================

    const startDate =
      new Date();


    const lastEarningDate =
      new Date(startDate);


    const endDate =
      new Date(startDate);


    endDate.setDate(
      endDate.getDate() + 365
    );


    // ==================================================
    // TOTAL RETURN
    // ==================================================

    const totalInterest =
      dailyEarning * 365;


    const totalReturn =
      Number(
        (
          investmentAmount +
          totalInterest
        ).toFixed(2)
      );


    // ==================================================
    // DEDUCT PLAN AMOUNT FROM BALANCE
    // ==================================================

    user.balance =
      Number(
        (
          currentBalance -
          investmentAmount
        ).toFixed(2)
      );


    await user.save();


    // ==================================================
    // CREATE INVESTMENT
    // ==================================================

    const investment =
      await Investment.create({

        user: user._id,

        plan: investmentPlan._id,

        amount: investmentAmount,

        dailyEarning,

        totalReturn,

        totalEarned: 0,

        status: "Active",

        startDate,

        lastEarningDate,

        endDate

      });


    // ==================================================
    // SUCCESS
    // ==================================================

    return res.status(201).json({

      success: true,

      message:
        "Investment plan activated successfully.",

      investment,

      balance:
        user.balance

    });


  } catch (error) {

    console.error(
      "Create investment error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

});


// ======================================================
// GET USER INVESTMENTS
// ======================================================

router.get("/", auth, async (req, res) => {

  try {

    const investments =
      await Investment.find({

        user: req.user.id

      })
      .populate(
        "plan",
        "name amount duration returnPercentage active"
      )
      .sort({

        createdAt: -1

      });


    return res.json({

      success: true,

      investments

    });


  } catch (error) {

    console.error(
      "Get investments error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

});


module.exports = router;
