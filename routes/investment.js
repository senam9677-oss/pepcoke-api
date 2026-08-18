const express = require("express");
const auth = require("../middleware/auth");

const Investment = require("../models/Investment");
const InvestmentPlan = require("../models/InvestmentPlan");
const Deposit = require("../models/Deposit");

const router = express.Router();


// ======================================================
// CREATE INVESTMENT
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
    // FIND PLAN
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
    // GET APPROVED DEPOSITS
    // ==================================================

    const approvedDeposits =
      await Deposit.find({

        user: req.user.id,

        status: "Approved"

      });


    const totalApprovedDeposits =
      approvedDeposits.reduce(
        (total, deposit) =>
          total + Number(deposit.amount || 0),
        0
      );


    // ==================================================
    // GET EXISTING INVESTMENTS
    // ==================================================

    const existingInvestments =
      await Investment.find({

        user: req.user.id,

        status: "Active"

      });


    const totalInvested =
      existingInvestments.reduce(
        (total, investment) =>
          total + Number(investment.amount || 0),
        0
      );


    // ==================================================
    // AVAILABLE BALANCE
    // ==================================================

    const availableBalance =
      totalApprovedDeposits - totalInvested;


    // ==================================================
    // PLAN AMOUNT
    // ==================================================

    const investmentAmount =
      Number(investmentPlan.amount);


    // ==================================================
    // CHECK AVAILABLE BALANCE
    // ==================================================

    if (
      availableBalance < investmentAmount
    ) {

      return res.status(400).json({

        success: false,

        message:
          `Insufficient balance. You need GH₵${investmentAmount.toLocaleString()} to choose this plan, but your available balance is GH₵${availableBalance.toLocaleString()}.`

      });

    }


    // ==================================================
    // DAILY RATE
    // ==================================================

    const DAILY_RATE = 2.22;


    const dailyEarning =
      (investmentAmount * DAILY_RATE) / 100;


    // ==================================================
    // INVESTMENT PERIOD
    // ==================================================

    const startDate = new Date();

    const endDate =
      new Date(startDate);

    endDate.setDate(
      endDate.getDate() + 365
    );


    // ==================================================
    // TOTAL INTEREST
    // ==================================================

    const totalInterest =
      dailyEarning * 365;


    // ==================================================
    // TOTAL RETURN
    // ==================================================

    const totalReturn =
      investmentAmount + totalInterest;


    // ==================================================
    // CREATE INVESTMENT
    // ==================================================

    const investment =
      await Investment.create({

        user: req.user.id,

        plan: investmentPlan._id,

        amount: investmentAmount,

        dailyEarning,

        totalReturn,

        status: "Active",

        startDate,

        endDate

      });


    // ==================================================
    // RESPONSE
    // ==================================================

    res.status(201).json({

      success: true,

      message:
        "Investment created successfully.",

      investment,

      balance: {

        previous:
          availableBalance,

        invested:
          investmentAmount,

        remaining:
          availableBalance - investmentAmount

      }

    });


  } catch (error) {

    console.error(
      "Create investment error:",
      error
    );


    res.status(500).json({

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

    console.error(
      "Get investments error:",
      error
    );


    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

});


module.exports = router;
