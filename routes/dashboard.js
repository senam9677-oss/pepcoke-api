const express = require("express");
const auth = require("../middleware/auth");

const Investment = require("../models/Investment");
const Deposit = require("../models/Deposit");
const Withdrawal = require("../models/Withdrawal");
const User = require("../models/User");

const router = express.Router();


// ======================================================
// GET CUSTOMER DASHBOARD
// ======================================================

router.get("/", auth, async (req, res) => {

  try {

    // Get the logged-in user
    const user = await User.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found."
      });
    }


    // ==================================================
    // GET INVESTMENTS
    // ==================================================

    const investments = await Investment.find({
      user: req.user.id
    })
      .populate(
        "plan",
        "name amount duration returnPercentage totalReturn"
      )
      .sort({
        createdAt: -1
      });


    // ==================================================
    // GET DEPOSITS
    // ==================================================

    const deposits = await Deposit.find({
      user: req.user.id
    })
      .populate(
        "plan",
        "name amount"
      )
      .sort({
        createdAt: -1
      });


    // ==================================================
    // GET WITHDRAWALS
    // ==================================================

    const withdrawals = await Withdrawal.find({
      user: req.user.id
    })
      .sort({
        createdAt: -1
      });


    // ==================================================
    // ACTIVE INVESTMENTS
    // ==================================================

    const activeInvestments =
      investments.filter(
        investment =>
          investment.status === "Active"
      );


    // ==================================================
    // TOTAL INVESTED
    // ==================================================

    const totalInvested =
      investments.reduce(
        (total, investment) =>
          total + Number(investment.amount || 0),
        0
      );


    // ==================================================
    // TOTAL EARNINGS
    // ==================================================

    const totalEarnings =
      activeInvestments.reduce(
        (total, investment) =>
          total + Number(investment.dailyEarning || 0),
        0
      );


    // ==================================================
    // TOTAL DEPOSITS
    // ==================================================

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


    // ==================================================
    // TOTAL WITHDRAWALS
    // ==================================================

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


    // ==================================================
    // RECENT TRANSACTIONS
    // ==================================================

    const recentDeposits =
      deposits.slice(0, 5).map(deposit => ({

        type: "Deposit",

        amount: deposit.amount,

        status: deposit.status,

        paymentMethod:
          deposit.paymentMethod,

        date: deposit.createdAt,

        plan:
          deposit.plan
            ? deposit.plan.name
            : null

      }));


    const recentWithdrawals =
      withdrawals.slice(0, 5).map(withdrawal => ({

        type: "Withdrawal",

        amount: withdrawal.amount,

        status: withdrawal.status,

        paymentMethod:
          withdrawal.paymentMethod,

        date: withdrawal.createdAt

      }));


    const transactions = [
      ...recentDeposits,
      ...recentWithdrawals
    ]
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      )
      .slice(0, 10);


    // ==================================================
    // RESPONSE
    // ==================================================

    res.json({

      success: true,

      user: {

        id: user._id,

        name: user.name,

        email: user.email,

        phone: user.phone,

        referralCode:
          user.referralCode,

        role: user.role,

        status: user.status

      },

      balance:
        Number(user.balance || 0),

      activeInvestments:
        activeInvestments.length,

      totalInvested,

      totalEarnings,

      totalDeposits,

      totalWithdrawals,

      investments,

      transactions

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
