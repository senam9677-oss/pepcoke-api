const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();

const Withdrawal = require("../models/Withdrawal");


// Create Withdrawal Request
router.post("/", auth, async (req, res) => {

  try {

    const {

      amount,

      paymentMethod,

      accountNumber,

      accountName

    } = req.body;


    const withdrawal = await Withdrawal.create({

      user: req.user.id,

      amount,

      paymentMethod,

      accountNumber,

      accountName,

      status: "Pending"

    });


    res.status(201).json({

      success: true,

      message: "Withdrawal request submitted successfully",

      withdrawal

    });


  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

});


// Get Logged-in User Withdrawals
router.get("/", auth, async (req, res) => {

  try {

    const withdrawals = await Withdrawal.find({

      user: req.user.id

    }).sort({

      createdAt: -1

    });


    res.json({

      success: true,

      withdrawals

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

});


module.exports = router;
