const express = require("express");
const auth = require("../middleware/auth");

const Investment = require("../models/Investment");
const Deposit = require("../models/Deposit");

const router = express.Router();


// Get Dashboard Data
router.get("/", auth, async (req, res) => {

  try {

    const investments = await Investment.find({
      user: req.user.id
    }).populate("plan");


    const deposits = await Deposit.find({
      user: req.user.id
    });


    res.json({

      success: true,

      investments,

      totalInvestments: investments.length,

      transactions: deposits.length

    });


  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

});


module.exports = router;
