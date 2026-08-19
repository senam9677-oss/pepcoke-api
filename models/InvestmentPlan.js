const mongoose = require("mongoose");

const investmentPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    amount: {
      type: Number,
      required: true,
      min: 100
    },

    duration: {
      type: String,
      required: true,
      default: "1 Year"
    },

    returnPercentage: {
      type: Number,
      default: 2.22
    },

    totalReturn: {
      type: Number,
      default: 0
    },

    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.InvestmentPlan ||
  mongoose.model(
    "InvestmentPlan",
    investmentPlanSchema
  );
