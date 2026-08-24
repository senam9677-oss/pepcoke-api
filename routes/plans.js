const express = require("express");
const InvestmentPlan = require("../models/InvestmentPlan");

const router = express.Router();


// ==========================================
// GET ALL INVESTMENT PLANS
// ==========================================

router.get("/", async (req, res) => {

  try {

    const plans = await InvestmentPlan
      .find({})
      .sort({
        amount: 1,
        minimumAmount: 1
      });


    return res.status(200).json({

      success: true,

      plans

    });

  } catch (error) {

    console.error(
      "Get investment plans error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Unable to load investment plans."

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
      returnPercentage
    } = req.body;


    const planAmount =
      Number(amount);


    if (!name || !name.trim()) {

      return res.status(400).json({

        success: false,

        message:
          "Plan name is required."

      });

    }


    if (
      !Number.isFinite(planAmount) ||
      planAmount <= 0
    ) {

      return res.status(400).json({

        success: false,

        message:
          "A valid plan amount is required."

      });

    }


    const plan =
      await InvestmentPlan.create({

        name:
          name.trim(),

        amount:
          planAmount,

        minimumAmount:
          planAmount,

        duration:
          duration || "1 Year",

        returnPercentage:
          Number(returnPercentage) || 2.22,

        active:
          true

      });


    return res.status(201).json({

      success: true,

      message:
        "Investment plan created successfully.",

      plan

    });


  } catch (error) {

    console.error(
      "Create investment plan error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

});


// ==========================================
// UPDATE ALL PLAN RATES
// ==========================================

router.put(
  "/update-rate",
  async (req, res) => {

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

        message:
          error.message

      });

    }

  }
);


module.exports = router;
