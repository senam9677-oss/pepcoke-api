const express = require("express");
const auth = require("../middleware/auth");

const Investment = require("../models/Investment");
const InvestmentPlan = require("../models/InvestmentPlan");

const router = express.Router();


// ======================================================
// CREATE INVESTMENT
// ======================================================

router.post("/", auth, async (req, res) => {

  try {

    const { plan, amount } = req.body;


    // Check that a plan was provided

    if (!plan) {

      return res.status(400).json({

        success: false,

        message: "Investment plan is required."

      });

    }


    // Find the investment plan

    const investmentPlan =
      await InvestmentPlan.findById(plan);


    if (!investmentPlan || !investmentPlan.active) {

      return res.status(404).json({

        success: false,

        message: "Investment plan not found or inactive."

      });

    }


    // Use the actual investment amount

    const investmentAmount =
      Number(amount || investmentPlan.amount);


    // Make sure the amount is valid

    if (
      !Number.isFinite(investmentAmount) ||
      investmentAmount <= 0
    ) {

      return res.status(400).json({

        success: false,

        message: "Invalid investment amount."

      });

    }


    // Make sure the amount matches the plan

    if (investmentAmount !== investmentPlan.amount) {

      return res.status(400).json({

        success: false,

        message:
          `This plan requires an investment of GH₵${investmentPlan.amount}.`

      });

    }


    // ==================================================
    // 2.22% DAILY SIMPLE INTEREST
    // ==================================================

    const DAILY_RATE = 2.22;

    const dailyEarning =
      (investmentAmount * DAILY_RATE) / 100;


    // ==================================================
    // 365-DAY INVESTMENT
    // ==================================================

    const startDate = new Date();

    const endDate = new Date(startDate);

    endDate.setDate(
      endDate.getDate() + 365
    );


    // Total interest over 365 days

    const totalInterest =
      dailyEarning * 365;


    // Original investment + interest

    const totalReturn =
      investmentAmount + totalInterest;


    // ==================================================
    // CREATE INVESTMENT
    // ==================================================

    const investment = await Investment.create({

      user: req.user.id,

      plan: investmentPlan._id,

      amount: investmentAmount,

      dailyEarning,

      totalReturn,

      status: "Active",

      startDate,

      endDate

    });


    res.status(201).json({

      success: true,

      message: "Investment created successfully.",

      investment

    });


  } catch (error) {

    console.error("Create investment error:", error);

    res.status(500).json({

      success: false,

      message: error.message

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
        "name amount duration returnPercentage totalReturn active"
      )
      .sort({
        createdAt: -1
      });


    res.json({

      success: true,

      investments

    });


  } catch (error) {

    console.error("Get investments error:", error);

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

});


module.exports = router;
