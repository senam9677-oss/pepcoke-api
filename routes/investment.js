const express = require("express");
const auth = require("../middleware/auth");

const Investment = require("../models/Investment");
const InvestmentPlan = require("../models/InvestmentPlan");

const router = express.Router();


// Create Investment
router.post("/", auth, async (req, res) => {

  try {

    const { plan, amount } = req.body;


    const investmentPlan = await InvestmentPlan.findById(plan);


    if (!investmentPlan) {

      return res.status(404).json({
        success: false,
        message: "Investment plan not found"
      });

    }


    const dailyEarning =
      (investmentPlan.amount * investmentPlan.returnPercentage) / 100;


    const totalReturn =
      investmentPlan.totalReturn;



    const investment = await Investment.create({

      user: req.user.id,

      plan: investmentPlan._id,

      amount: amount || investmentPlan.amount,

      dailyEarning,

      totalReturn,

      status: "Active"

    });



    res.status(201).json({

      success: true,

      message: "Investment created successfully",

      investment

    });



  } catch (error) {


    res.status(500).json({

      success: false,

      message: error.message

    });


  }


});





// Get User Investments
router.get("/", auth, async (req, res) => {


  try {


    const investments = await Investment.find({

      user: req.user.id

    }).populate("plan");



    res.json({

      success: true,

      investments

    });



  } catch(error) {


    res.status(500).json({

      success:false,

      message:error.message

    });


  }


});




module.exports = router;
