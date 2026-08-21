const express = require("express");

const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

const Deposit = require("../models/Deposit");
const Withdrawal = require("../models/Withdrawal");
const User = require("../models/User");
const Investment = require("../models/Investment");
const InvestmentPlan = require("../models/InvestmentPlan");
const Notification = require("../models/Notification");

const router = express.Router();

const DAILY_RATE = 2.22;
const INVESTMENT_DAYS = 365;


// ======================================================
// GET ALL USERS
// ======================================================

router.get("/users", auth, adminAuth, async (req, res) => {
  try {

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
});


// ======================================================
// GET ALL DEPOSITS
// ======================================================

router.get("/deposits", auth, adminAuth, async (req, res) => {
  try {

    const deposits = await Deposit.find()
      .populate("user", "name email phone")
      .populate(
        "plan",
        "name amount duration returnPercentage totalReturn"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      deposits
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
});


// ======================================================
// APPROVE DEPOSIT
// ======================================================

router.put(
  "/deposit/:id",
  auth,
  adminAuth,
  async (req, res) => {

    try {

      // ==========================================
      // FIND DEPOSIT
      // ==========================================

      const deposit =
        await Deposit.findById(req.params.id);


      if (!deposit) {

        return res.status(404).json({

          success: false,

          message: "Deposit not found."

        });

      }


      // ==========================================
      // PREVENT DOUBLE APPROVAL
      // ==========================================

      if (deposit.status === "Approved") {

        return res.status(400).json({

          success: false,

          message:
            "This deposit has already been approved."

        });

      }


      // ==========================================
      // PREVENT APPROVING REJECTED DEPOSIT
      // ==========================================

      if (deposit.status === "Rejected") {

        return res.status(400).json({

          success: false,

          message:
            "A rejected deposit cannot be approved."

        });

      }


      // ==========================================
      // FIND USER
      // ==========================================

      const user =
        await User.findById(deposit.user);


      if (!user) {

        return res.status(404).json({

          success: false,

          message: "User not found."

        });

      }


      // ==========================================
      // VALIDATE AMOUNT
      // ==========================================

      const depositAmount =
        Number(deposit.amount);


      if (
        !Number.isFinite(depositAmount) ||
        depositAmount < 100
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid deposit amount."

        });

      }


      // ==========================================
      // APPROVE DEPOSIT
      // ==========================================

      deposit.status = "Approved";

      await deposit.save();


      // ==========================================
      // ADD MONEY TO USER BALANCE
      // ==========================================

      user.balance =
        Number(user.balance || 0) +
        depositAmount;

      await user.save();


      // ==========================================
      // NOTIFICATION
      // ==========================================

      await Notification.create({

        user: deposit.user,

        title: "Deposit Approved",

        message:
          `Your deposit of GH₵${depositAmount.toFixed(2)} has been approved and added to your available balance.`

      });


      // ==========================================
      // RESPONSE
      // ==========================================

      res.json({

        success: true,

        message:
          "Deposit approved and balance updated successfully.",

        deposit: {

          id: deposit._id,

          amount: depositAmount,

          status: deposit.status

        },

        balance:
          user.balance

      });


    } catch (error) {

      console.error(
        "Approve deposit error:",
        error
      );


      res.status(500).json({

        success: false,

        message:
          error.message

      });

    }

  }
);


// ======================================================
// REJECT DEPOSIT
// ======================================================

router.put(
  "/deposit/:id/reject",
  auth,
  adminAuth,
  async (req, res) => {

    try {

      const deposit =
  await Deposit.findById(req.params.id);

if (!deposit) {

  return res.status(404).json({

    success: false,

    message: "Deposit not found."

  });

}

if (deposit.status !== "Pending") {

  return res.status(400).json({

    success: false,

    message:
      `This deposit is already ${deposit.status}.`

  });

}

deposit.status = "Rejected";

await deposit.save();


      await Notification.create({

        user: deposit.user,

        title: "Deposit Rejected",

        message:
          `Your deposit of GH₵${deposit.amount.toFixed(2)} has been rejected.`

      });


      res.json({

        success: true,

        message: "Deposit rejected."

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message: error.message

      });

    }

  }
);


// ======================================================
// GET ALL WITHDRAWALS
// ======================================================

router.get(
  "/withdrawals",
  auth,
  adminAuth,
  async (req, res) => {

    try {

      const withdrawals =
        await Withdrawal.find()
          .populate(
            "user",
            "name email phone balance"
          )
          .sort({
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

  }
);


// ======================================================
// APPROVE WITHDRAWAL
// ======================================================

router.put(
  "/withdrawal/:id",
  auth,
  adminAuth,
  async (req, res) => {

    try {

      const withdrawal =
        await Withdrawal.findById(req.params.id);


      if (!withdrawal) {

        return res.status(404).json({

          success: false,

          message: "Withdrawal not found."

        });

      }


      if (withdrawal.status !== "pending") {

        return res.status(400).json({

          success: false,

          message:
            `This withdrawal is already ${withdrawal.status}.`

        });

      }


      const user =
        await User.findById(withdrawal.user);


      if (!user) {

        return res.status(404).json({

          success: false,

          message: "User not found."

        });

      }


      if (user.balance < withdrawal.amount) {

        return res.status(400).json({

          success: false,

          message:
            "User does not have enough available balance."

        });

      }


      user.balance -= withdrawal.amount;

      await user.save();


      withdrawal.status = "approved";

      await withdrawal.save();


      await Notification.create({

        user: withdrawal.user,

        title: "Withdrawal Approved",

        message:
          `Your withdrawal request of GH₵${withdrawal.amount.toFixed(2)} has been approved.`

      });


      res.json({

        success: true,

        message: "Withdrawal approved."

      });

    } catch (error) {

      console.error(
        "Approve withdrawal error:",
        error
      );

      res.status(500).json({

        success: false,

        message: error.message

      });

    }

  }
);


// ======================================================
// REJECT WITHDRAWAL
// ======================================================

router.put(
  "/withdrawal/:id/reject",
  auth,
  adminAuth,
  async (req, res) => {

    try {

      const withdrawal =
        await Withdrawal.findById(req.params.id);


      if (!withdrawal) {

        return res.status(404).json({

          success: false,

          message: "Withdrawal not found."

        });

      }


      if (withdrawal.status !== "pending") {

        return res.status(400).json({

          success: false,

          message:
            `This withdrawal is already ${withdrawal.status}.`

        });

      }


      withdrawal.status = "rejected";

      await withdrawal.save();


      await Notification.create({

        user: withdrawal.user,

        title: "Withdrawal Rejected",

        message:
          `Your withdrawal request of GH₵${withdrawal.amount.toFixed(2)} has been rejected.`

      });


      res.json({

        success: true,

        message: "Withdrawal rejected."

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message: error.message

      });

    }

  }
);


// ======================================================
// SUSPEND / ACTIVATE USER
// ======================================================

router.put(
  "/user/:id",
  auth,
  adminAuth,
  async (req, res) => {

    try {

      const user =
        await User.findById(req.params.id);


      if (!user) {

        return res.status(404).json({

          success: false,

          message: "User not found."

        });

      }


      user.status =
        user.status === "Active"
          ? "Suspended"
          : "Active";


      await user.save();


      res.json({

        success: true,

        message:
          `User ${user.status.toLowerCase()} successfully.`,

        status: user.status

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message: error.message

      });

    }

  }
);


// ======================================================
// GET ALL INVESTMENT PLANS
// ======================================================

router.get(
  "/plans",
  auth,
  adminAuth,
  async (req, res) => {

    try {

      const plans =
        await InvestmentPlan.find()
          .sort({
            amount: 1
          });


      res.json({

        success: true,

        plans

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message: error.message

      });

    }

  }
);


module.exports = router;
