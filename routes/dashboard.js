const express = require("express");
const auth = require("../middleware/auth");

const User = require("../models/User");
const Investment = require("../models/Investment");
const Deposit = require("../models/Deposit");
const Withdrawal = require("../models/Withdrawal");

const router = express.Router();


// ==========================================
// GET USER DASHBOARD
// ==========================================

router.get("/", auth, async (req, res) => {

  try {

    // ========================================
    // GET USER
    // ========================================

    const user = await User.findById(req.user.id)
      .select("-password");


    if (!user) {

      return res.status(404).json({

        success: false,

        message: "User not found"

      });

    }


    // ========================================
    // GET INVESTMENTS
    // ========================================

    const investments = await Investment.find({

      user: req.user.id

    }).populate("plan");


    // ========================================
    // GET DEPOSITS
    // ========================================

    const deposits = await Deposit.find({

      user: req.user.id

    }).sort({

      createdAt: -1

    });


    // ========================================
    // GET WITHDRAWALS
    // ========================================

    const withdrawals = await Withdrawal.find({

      user: req.user.id

    }).sort({

      createdAt: -1

    });


    // ========================================
    // ACTIVE INVESTMENTS
    // ========================================

    const activeInvestments =
      investments.filter(
        investment =>
          investment.status === "Active"
      ).length;


    // ========================================
    // TOTAL DEPOSITS
    // ========================================

    const totalDeposits =
      deposits
        .filter(
          deposit =>
            deposit.status === "Approved"
        )
        .reduce(
          (total, deposit) =>
            total + Number(deposit.amount || 0),
          0
        );


    // ========================================
    // TOTAL WITHDRAWALS
    // ========================================

    const totalWithdrawals =
      withdrawals
        .filter(
          withdrawal =>
            withdrawal.status === "approved"
        )
        .reduce(
          (total, withdrawal) =>
            total + Number(withdrawal.amount || 0),
          0
        );


    // ========================================
    // TOTAL EARNINGS
    // ========================================
    //
    // At this stage, earnings are calculated
    // from the daily earnings recorded on
    // active investments.
    //
    // We will build the automatic daily
    // earnings system separately.
    //

    const totalEarnings =
      investments.reduce(
        (total, investment) =>
          total +
          Number(investment.dailyEarning || 0),
        0
      );


    // ========================================
    // RECENT TRANSACTIONS
    // ========================================

    const depositTransactions =
      deposits.map(deposit => ({

        type: "Deposit",

        amount: deposit.amount,

        status: deposit.status,

        date: deposit.createdAt

      }));


    const withdrawalTransactions =
      withdrawals.map(withdrawal => ({

        type: "Withdrawal",

        amount: withdrawal.amount,

        status: withdrawal.status,

        date: withdrawal.createdAt

      }));


    const transactions = [
      ...depositTransactions,
      ...withdrawalTransactions
    ]
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      )
      .slice(0, 5);


    // ========================================
    // SEND DASHBOARD DATA
    // ========================================

    res.json({

      success: true,

      user: {

        id: user._id,

        name: user.name,

        email: user.email,

        phone: user.phone

      },

      balance: user.balance || 0,

      activeInvestments,

      totalEarnings,

      totalDeposits,

      totalWithdrawals,

      transactions,

      investments

    });


  } catch (error) {

    console.error(
      "Dashboard error:",
      error
    );


    res.status(500).json({

      success: false,

      message: error.message

    });

  }

});


module.exports = router;
