const express = require("express");
const InvestmentPlan = require("../models/InvestmentPlan");

const router = express.Router();


// ==========================================
// GET ALL ACTIVE INVESTMENT PLANS
// ==========================================

router.get("/", async (req, res) => {
  try {

    const plans = await InvestmentPlan.find({
      active: true
    }).sort({
      amount: 1
    });

    return res.status(200).json({
      success: true,
      plans
    });

  } catch (error) {

    console.error("Get investment plans error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load investment plans.",
      error: error.message
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
      totalReturn
    } = req.body;


    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Plan name is required."
      });
    }


    if (!Number.isFinite(Number(amount))) {
      return res.status(400).json({
        success: false,
        message: "Valid plan amount is required."
      });
    }


    const plan = await InvestmentPlan.create({

      name: name.trim(),

      amount: Number(amount),

      duration: duration || "1 Year",

      returnPercentage: 2.22,

      totalReturn: Number(totalReturn) || 0,

      active: true

    });


    return res.status(201).json({

      success: true,

      message: "Investment plan created successfully.",

      plan

    });

  } catch (error) {

    console.error("Create investment plan error:", error);

    return res.status(500).json({

      success: false,

      message: error.message

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
            returnPercentage: 2.22
          }
        }
      );


    return res.json({

      success: true,

      message:
        "All investment plans updated to 2.22% daily rate.",

      modifiedCount:
        result.modifiedCount

    });

  } catch (error) {

    console.error(
      "Update plan rate error:",
      error
    );

    return res.status(500).json({

      success: false,

      message: error.message

    });

  }

});


module.exports = router;
