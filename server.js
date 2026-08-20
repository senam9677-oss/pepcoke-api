const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the PEPCOKE API"
  });
});

// Load routes
const authRoutes = require("./routes/auth");
const planRoutes = require("./routes/plans");
const depositRoutes = require("./routes/deposit");
const withdrawalRoutes = require("./routes/withdrawal");
const adminRoutes = require("./routes/admin");
const investmentRoutes = require("./routes/investment");
const dashboardRoutes = require("./routes/dashboard");
const notificationRoutes = require("./routes/notification");

app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/deposit", depositRoutes);
app.use("/api/withdrawal", withdrawalRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`PEPCOKE API running on port ${PORT}`);

  // Connect to MongoDB after server starts
  const connectDB = require("./config/db");

  connectDB();
});
