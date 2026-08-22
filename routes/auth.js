const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();


// ======================================================
// REGISTER
// ======================================================

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      referredBy
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required."
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: cleanEmail
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists."
      });
    }

    // Validate referral code if provided
    let validReferredBy = "";

    if (referredBy && referredBy.trim()) {
      const referralCodeInput =
        referredBy.trim().toUpperCase();

      const referrer = await User.findOne({
        referralCode: referralCodeInput
      });

      if (!referrer) {
        return res.status(400).json({
          success: false,
          message: "Invalid referral code."
        });
      }

      validReferredBy = referrer.referralCode;
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // Generate unique referral code
    let referralCode = "";
    let codeExists = true;

    while (codeExists) {
      referralCode =
        "PEP" +
        Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

      const existingCode =
        await User.findOne({
          referralCode
        });

      codeExists = !!existingCode;
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : "",
      password: hashedPassword,
      balance: 0,
      referralCode,
      referredBy: validReferredBy,
      role: "user",
      status: "Active"
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        balance: user.balance,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to register user."
    });
  }
});


// ======================================================
// LOGIN
// ======================================================

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    if (user.status === "Suspended") {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been suspended. Please contact PEPCOKE support."
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET is not configured."
      );
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        balance: user.balance,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to login."
    });
  }
});


// ======================================================
// GET LOGGED-IN USER REFERRAL DATA
// ======================================================

router.get("/referrals", auth, async (req, res) => {
  try {
    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const referrals = await User.find({
      referredBy: user.referralCode
    })
      .select("name email createdAt")
      .sort({
        createdAt: -1
      });

    return res.json({
      success: true,
      referralCode: user.referralCode,
      totalReferrals: referrals.length,
      totalCommission: 0,
      referrals
    });

  } catch (error) {
    console.error(
      "Referral data error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to load referral data."
    });
  }
});


module.exports = router;
