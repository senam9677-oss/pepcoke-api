const express = require("express");
const auth = require("../middleware/auth");
const Withdrawal = require("../models/Withdrawal");

const router = express.Router();


// ==========================================
// CREATE WITHDRAWAL REQUEST
// ==========================================

router.post("/", auth, async (req, res) => {

  try {

    const {
      amount,
      paymentMethod,
      accountNumber,
      accountName
    } = req.body;


    // ======================================
    // VALIDATE AMOUNT
    // ======================================

    const withdrawalAmount =
      Number(amount);


    if (
      !Number.isFinite(withdrawalAmount) ||
      withdrawalAmount < 50
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Minimum withdrawal amount is GH₵50."

      });

    }


    // ======================================
    // VALIDATE PAYMENT METHOD
    // ======================================

    if (
      !paymentMethod ||
      !paymentMethod.trim()
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Withdrawal method is required."

      });

    }


    // ======================================
    // VALIDATE ACCOUNT NUMBER
    // ======================================

    if (
      !accountNumber ||
      !String(accountNumber).trim()
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Account or mobile money number is required."

      });

    }


    // ======================================
    // VALIDATE ACCOUNT NAME
    // ======================================

    if (
      !accountName ||
      !accountName.trim()
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Account name is required."

      });

    }


    // ======================================
    // CREATE WITHDRAWAL
    // ======================================

    const withdrawal =
      await Withdrawal.create({

        user: req.user.id,

        amount: withdrawalAmount,

        paymentMethod:
          paymentMethod.trim(),

        accountNumber:
          String(accountNumber).trim(),

        accountName:
          accountName.trim(),

        status: "Pending"

      });


    return res.status(201).json({

      success: true,

      message:
        "Withdrawal request submitted successfully",

      withdrawal

    });


  } catch (error) {

    console.error(
      "Create withdrawal error:",
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
// GET LOGGED-IN USER WITHDRAWALS
// ==========================================

router.get("/", auth, async (req, res) => {

  try {

    const withdrawals =
      await Withdrawal.find({

        user: req.user.id

      })
      .sort({

        createdAt: -1

      });


    return res.json({

      success: true,

      withdrawals

    });


  } catch (error) {

    console.error(
      "Get withdrawals error:",
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
