const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

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


    // Basic validation

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required."
      });
    }


    // Check if email already exists

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists."
      });
    }


    // Hash password

    const hashedPassword =
      await bcrypt.hash(password, 10);


    // Generate referral code

    const referralCode =
      "PEP" +
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();


    // Create user

    const user = await User.create({

      name: name.trim(),

      email: email.toLowerCase().trim(),

      phone: phone || "",

      password: hashedPassword,

      referredBy: referredBy || "",

      referralCode,

      // IMPORTANT:
      // Every normal registration is a user.
      // A user cannot register themselves as admin.

      role: "user",

      status: "Active"

    });


    res.status(201).json({

      success: true,

      message: "Registration successful.",

      user: {

        id: user._id,

        name: user.name,

        email: user.email,

        phone: user.phone,

        referralCode: user.referralCode,

        role: user.role

      }

    });


  } catch (error) {

    console.error("Registration error:", error);

    res.status(500).json({

      success: false,

      message: error.message

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


    // Validation

    if (!email || !password) {

      return res.status(400).json({

        success: false,

        message: "Email and password are required."

      });

    }


    // Find user

    const user = await User.findOne({

      email: email.toLowerCase().trim()

    });


    if (!user) {

      return res.status(400).json({

        success: false,

        message: "Invalid email or password."

      });

    }


    // Check password

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


    // Check account status

    if (user.status === "Suspended") {

      return res.status(403).json({

        success: false,

        message:
          "Your account has been suspended. Please contact PEPCOKE support."

      });

    }


    // Create JWT

    const token = jwt.sign(

      {
        id: user._id,
        role: user.role
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d"
      }

    );


    // Send response

    res.json({

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

    console.error("Login error:", error);

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

});


module.exports = router;
