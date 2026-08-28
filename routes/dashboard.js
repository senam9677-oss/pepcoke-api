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
    // GET ACTIVE AND COMPLETED INVESTMENTS
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


    for (const investment of investments) {

      // Only process active investments

      if (investment.status !== "Active") {

        continue;

      }


      // Get the last date earnings were paid

      const lastEarningDate =
        new Date(
          investment.lastEarningDate ||
          investment.startDate
        );


      // Calculate time passed

      const timeDifference =
        now.getTime() -
        lastEarningDate.getTime();


      // Number of FULL 24-hour periods passed

      let daysPassed =
        Math.floor(
          timeDifference /
          (1000 * 60 * 60 * 24)
        );


      // No full day has passed yet

      if (daysPassed <= 0) {

        continue;

      }


      // ======================================
      // CHECK REMAINING DAYS
      // ======================================

      const earnedDays =
        Number(
          investment.earnedDays || 0
        );


      const remainingDays =
        365 - earnedDays;


      // Investment has already completed

      if (remainingDays <= 0) {

        investment.status =
          "Completed";

        await investment.save();

        continue;

      }


      // Do not pay more than the remaining days

      if (daysPassed > remainingDays) {

        daysPassed =
          remainingDays;

      }


      // ======================================
      // CALCULATE EARNINGS
      // ======================================

      const dailyEarning =
        Number(
          investment.dailyEarning || 0
        );


      const earningsToAdd =
        dailyEarning *
        daysPassed;


      // ======================================
      // ADD EARNINGS TO USER BALANCE
      // ======================================

      user.balance =
        Number(user.balance || 0) +
        earningsToAdd;


      // ======================================
      // UPDATE INVESTMENT EARNINGS
      // ======================================

      investment.totalEarned =
        Number(
          investment.totalEarned || 0
        ) +
        earningsToAdd;


      investment.earnedDays =
        earnedDays +
        daysPassed;


      // Move last earning date forward
      // by the exact number of paid days

      const newLastEarningDate =
        new Date(lastEarningDate);


      newLastEarningDate.setDate(
        newLastEarningDate.getDate() +
        daysPassed
      );


      investment.lastEarningDate =
        newLastEarningDate;


      // ======================================
      // COMPLETE INVESTMENT IF 365 DAYS
      // ======================================

      if (investment.earnedDays >= 365) {

        investment.status =
          "Completed";

      }


      await investment.save();

    }


    // Save the user's updated balance

    await user.save();


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
            total +
            Number(
              deposit.amount || 0
            ),
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
            total +
            Number(
              withdrawal.amount || 0
            ),
          0
        );


    // ========================================
    // TOTAL EARNINGS
    // ========================================

    const totalEarnings =
      investments.reduce(
        (total, investment) =>
          total +
          Number(
            investment.totalEarned || 0
          ),
        0
      );


    // ========================================
    // DEPOSIT TRANSACTIONS
    // ========================================

    const depositTransactions =
      deposits.map(deposit => ({

        type: "Deposit",

        amount:
          Number(
            deposit.amount || 0
          ),

        status:
          deposit.status,

        date:
          deposit.createdAt

      }));


    // ========================================
    // WITHDRAWAL TRANSACTIONS
    // ========================================

    const withdrawalTransactions =
      withdrawals.map(withdrawal => ({

        type: "Withdrawal",

        amount:
          Number(
            withdrawal.amount || 0
          ),

        status:
          withdrawal.status,

        date:
          withdrawal.createdAt

      }));


    // ========================================
    // INVESTMENT TRANSACTIONS
    // ========================================

    const investmentTransactions =
      investments.map(investment => ({

        type: "Investment",

        amount:
          Number(
            investment.amount || 0
          ),

        status:
          investment.status,

        date:
          investment.startDate

      }));


    // ========================================
    // DAILY EARNING TRANSACTIONS
    // ========================================

    const earningTransactions =
      investments
        .filter(
          investment =>
            Number(
              investment.totalEarned || 0
            ) > 0
        )
        .map(investment => ({

          type: "Investment Earnings",

          amount:
            Number(
              investment.totalEarned || 0
            ),

         
