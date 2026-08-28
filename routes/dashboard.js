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
    })
      .populate("plan")
      .sort({
        createdAt: -1
      });


    // ========================================
    // AUTOMATIC DAILY EARNINGS
    // ========================================

    const now = new Date();
    let userBalanceChanged = false;


    for (const investment of investments) {

      if (investment.status !== "Active") {
        continue;
      }


      const lastEarningDate = new Date(
        investment.lastEarningDate ||
        investment.startDate
      );


      const timeDifference =
        now.getTime() -
        lastEarningDate.getTime();


      let daysPassed = Math.floor(
        timeDifference /
        (1000 * 60 * 60 * 24)
      );


      if (daysPassed <= 0) {
        continue;
      }


      const earnedDays =
        Number(investment.earnedDays || 0);


      const remainingDays =
        365 - earnedDays;


      if (remainingDays <= 0) {

        investment.status = "Completed";

        await investment.save();

        continue;
      }


      if (daysPassed > remainingDays) {

        daysPassed = remainingDays;

      }


      const dailyEarning =
        Number(investment.dailyEarning || 0);


      const earningsToAdd =
        dailyEarning * daysPassed;


      // Add earnings to user balance

      user.balance =
        Number(user.balance || 0) +
        earningsToAdd;


      userBalanceChanged = true;


      // Update investment earnings

      investment.totalEarned =
        Number(investment.totalEarned || 0) +
        earningsToAdd;


      investment.earnedDays =
        earnedDays + daysPassed;


      // Move last earning date forward

      const newLastEarningDate =
        new Date(lastEarningDate);


      newLastEarningDate.setDate(
        newLastEarningDate.getDate() +
        daysPassed
      );


      investment.lastEarningDate =
        newLastEarningDate;


      // Complete after 365 earning days

      if (investment.earnedDays >= 365) {

        investment.status = "Completed";

      }


      await investment.save();

    }


    // Save user only if earnings changed

    if (userBalanceChanged) {

      await user.save();

    }


    // ========================================
    // GET DEPOSITS
    // ========================================

    const deposits = await Deposit.find({
      user: req.user.id
    })
      .sort({
        createdAt: -1
      });


    // ========================================
    // GET WITHDRAWALS
    // ========================================

    const withdrawals = await Withdrawal.find({
      user: req.user.id
    })
      .sort({
        createdAt: -1
      });


    // ========================================
    // ACTIVE INVESTMENTS
    // ========================================

    const activeInvestments =
      investments.filter(function (investment) {

        return investment.status === "Active";

      }).length;


    // ========================================
    // TOTAL DEPOSITS
    // ========================================

    const totalDeposits =
      deposits
        .filter(function (deposit) {

          return deposit.status === "Approved";

        })
        .reduce(function (total, deposit) {

          return total +
            Number(deposit.amount || 0);

        }, 0);


    // ========================================
    // TOTAL WITHDRAWALS
    // ========================================

    const totalWithdrawals =
      withdrawals
        .filter(function (withdrawal) {

          return (
            withdrawal.status === "Approved" ||
            withdrawal.status === "approved"
          );

        })
        .reduce(function (total, withdrawal) {

          return total +
            Number(withdrawal.amount || 0);

        }, 0);


    // ========================================
    // TOTAL EARNINGS
    // ========================================

    const totalEarnings =
      investments.reduce(function (
        total,
        investment
      ) {

        return total +
          Number(
            investment.totalEarned || 0
          );

      }, 0);


    // ========================================
    // DEPOSIT TRANSACTIONS
    // ========================================

    const depositTransactions =
      deposits.map(function (deposit) {

        return {
          type: "Deposit",
          amount: Number(deposit.amount || 0),
          status: deposit.status,
          date: deposit.createdAt
        };

      });


    // ========================================
    // WITHDRAWAL TRANSACTIONS
    // ========================================

    const withdrawalTransactions =
      withdrawals.map(function (withdrawal) {

        return {
          type: "Withdrawal",
          amount: Number(withdrawal.amount || 0),
          status: withdrawal.status,
          date: withdrawal.createdAt
        };

      });


    // ========================================
    // INVESTMENT TRANSACTIONS
    // ========================================

    const investmentTransactions =
      investments.map(function (investment) {

        return {
          type: "Investment",
          amount: Number(investment.amount || 0),
          status: investment.status,
          date: investment.startDate
        };

      });


    // ========================================
    // COMBINE RECENT TRANSACTIONS
    // ========================================

    const transactions = [
      ...depositTransactions,
      ...withdrawalTransactions,
      ...investmentTransactions
    ]
      .sort(function (a, b) {

        return (
          new Date(b.date) -
          new Date(a.date)
        );

      })
      .slice(0, 10);


    // ========================================
    // SEND DASHBOARD DATA
    // ========================================

    return res.json({

      success: true,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },

      balance:
        Number(user.balance || 0),

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


    return res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

});


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;
