const express = require("express");
const auth = require("../middleware/auth");

const Deposit = require("../models/Deposit");

const router = express.Router();


// ==========================================
// CREATE DEPOSIT
// ==========================================

router.post("/", auth, async (req, res) => {

  try {

    const {
      amount,
      paymentMethod,
      transactionId
    } = req.body;


    // ========================================
    // VALIDATE AMOUNT
    // ========================================

    const depositAmount = Number(amount);

    if (
      !Number.isFinite(depositAmount) ||
      depositAmount < 100
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Minimum deposit amount is GH₵100."

      });

    }


    // ========================================
    // VALIDATE PAYMENT METHOD
    // ========================================

    if (!paymentMethod || !paymentMethod.trim()) {

      return res.status(400).json({

        success: false,

        message:
          "Payment method is required."

      });

    }


    // ========================================
    // MTN ONLY
    // ========================================

    if (paymentMethod !== "MTN Mobile Money") {

      return res.status(400).json({

        success: false,

        message:
          "Only MTN Mobile Money is currently available."

      });

    }


    // ========================================
    // VALIDATE TRANSACTION ID
    // ========================================

    if (
      !transactionId ||
      !transactionId.trim()
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Transaction ID is required."

      });

    }


    // ========================================
    // CREATE DEPOSIT
    // ========================================

    const deposit = await Deposit.create({

      user: req.user.id,

      amount: depositAmount,

      paymentMethod:
        paymentMethod.trim(),

      transactionId:
        transactionId.trim(),

      status: "Pending"

    });


    // ========================================
    // RESPONSE
    // ========================================

    return res.status(201).json({

      success: true,

      message:
        "Deposit request submitted successfully",

      deposit

    });


  } catch (error) {

    console.error(
      "Create deposit error:",
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
// GET LOGGED-IN USER DEPOSITS
// ==========================================

router.get("/", auth, async (req, res) => {

  try {

    const deposits =
      await Deposit.find({
        user: req.user.id
      })
      .sort({
        createdAt: -1
      });


    return res.json({

      success: true,

      deposits

    });


  } catch (error) {

    console.error(
      "Get deposits error:",
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
