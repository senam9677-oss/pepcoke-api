const express = require("express");
const InvestmentPlan = require("../models/InvestmentPlan");

const router = express.Router();

// ==========================================
// GET ALL ACTIVE INVESTMENT PLANS
// ==========================================

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


// ==========================================
// CREATE INVESTMENT PLAN
// ==========================================

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

      // PEPCOKE daily rate
      returnPercentage: 2.22,

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


// ==========================================
// UPDATE ALL PLANS TO 2.22% DAILY
// ==========================================

router.put("/update-rate", async (req, res) => {

  try {

    const result =
      await InvestmentPlan.updateMany(
        {},
        {
          $set: {
            returnPercentage: 2.22,
          },
        }
      );


    res.json({

      success: true,

      message:
        "All investment plans updated to 2.22% daily rate.",

      modifiedCount:
        result.modifiedCount,

    });


  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

});


module.exports = router;
