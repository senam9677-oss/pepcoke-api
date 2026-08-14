const mongoose = require("mongoose");
const dotenv = require("dotenv");

const InvestmentPlan = require("../models/InvestmentPlan");

dotenv.config();

const plans = [
  {
    name: "Plan 1",
    amount: 200,
    duration: "1 Year",
    returnPercentage: 2.22,
    totalReturn: 1620,
    active: true,
  },
  {
    name: "Plan 2",
    amount: 500,
    duration: "1 Year",
    returnPercentage: 2.22,
    totalReturn: 4050,
    active: true,
  },
  {
    name: "Plan 3",
    amount: 800,
    duration: "1 Year",
    returnPercentage: 2.22,
    totalReturn: 6480,
    active: true,
  },
  {
    name: "Plan 4",
    amount: 1400,
    duration: "1 Year",
    returnPercentage: 2.22,
    totalReturn: 11340,
    active: true,
  },
  {
    name: "Plan 5",
    amount: 2400,
    duration: "1 Year",
    returnPercentage: 2.22,
    totalReturn: 19440,
    active: true,
  },
  {
    name: "Plan 6",
    amount: 3400,
    duration: "1 Year",
    returnPercentage: 2.22,
    totalReturn: 27540,
    active: true,
  },
  {
    name: "Plan 7",
    amount: 4400,
    duration: "1 Year",
    returnPercentage: 2.22,
    totalReturn: 35640,
    active: true,
  },
  {
    name: "Plan 8",
    amount: 5000,
    duration: "1 Year",
    returnPercentage: 2.22,
    totalReturn: 40500,
    active: true,
  },
];

async function seedPlans() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // Remove the old plans
    await InvestmentPlan.deleteMany({});

    // Create the new 8 plans
    await InvestmentPlan.insertMany(plans);

    console.log("✅ 8 PEPCOKE investment plans created successfully");

    await mongoose.disconnect();

    process.exit(0);

  } catch (error) {

    console.error("❌ Error:", error);

    process.exit(1);

  }
}

seedPlans();
