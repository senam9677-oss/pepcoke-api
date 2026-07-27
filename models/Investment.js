const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InvestmentPlan",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    dailyEarning: {
      type: Number,
      required: true,
    },

    totalReturn: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active",
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);


module.exports =
  mongoose.models.Investment ||
  mongoose.model("Investment", investmentSchema);
