const mongoose = require("mongoose");

const investmentPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    duration: {
      type: String,
      required: true,
    },

    percentage: {
      type: Number,
      required: true,
    },

    totalReturn: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.InvestmentPlan ||
  mongoose.model("InvestmentPlan", investmentPlanSchema);
