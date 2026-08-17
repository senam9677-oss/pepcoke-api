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
      transactionId,
      senderName,
      senderPhone
    } = req.body;


    // ========================================
    // VALIDATE AMOUNT
    // ========================================

    if (
      !Number.isFinite(Number(amount)) ||
      Number(amount) < 100
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

    if (!paymentMethod) {

      return res.status(400).json({

        success: false,

        message:
          "Payment method is required."

      });

    }


    // ========================================
    // VALIDATE TRANSACTION ID
    // ========================================

    if (!transactionId || !transactionId.trim()) {

      return res.status(400).json({

        success: false,

        message:
          "Transaction ID is required."

      });

    }


    // ========================================
    // VALIDATE SENDER NAME
    // ========================================

    if (!senderName || !senderName.trim()) {

      return res.status(400).json({

        success: false,

        message:
          "Sender name is required."

      });

    }


    // ========================================
    // VALIDATE SENDER PHONE
    // ========================================

    if (!senderPhone || !senderPhone.trim()) {

      return res.status(400).json({

        success: false,

        message:
          "Sender phone number is required."

      });

    }


    // ========================================
    // CREATE DEPOSIT
    // ========================================

    const deposit = await Deposit.create({

      user: req.user.id,

      amount: Number(amount),

      paymentMethod,

      transactionId:
        transactionId.trim(),

      senderName:
        senderName.trim(),

      senderPhone:
        senderPhone.trim(),

      status: "Pending"

    });


    // ========================================
    // RESPONSE
    // ========================================

    res.status(201).json({

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


    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

});


// ==========================================
// GET USER DEPOSITS
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


    res.json({

      success: true,

      deposits

    });


  } catch (error) {

    console.error(
      "Get deposits error:",
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
