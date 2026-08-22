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


    // Check whether the referral code is valid

    let validReferredBy = "";

    if (referredBy && referredBy.trim()) {

      const referrer = await User.findOne({
        referralCode: referredBy.trim().toUpperCase()
      });


      if (!referrer) {
        return res.status(400).json({
          success: false,
          message: "Invalid referral code."
        });
      }


      validReferredBy =
        referrer.referralCode;

    }


    // Hash password

    const hashedPassword =
      await bcrypt.hash(password, 10);


    // Generate a unique referral code

    let referralCode;
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

      email: email.toLowerCase().trim(),

      phone: phone ? phone.trim() : "",

      password: hashedPassword,

      referredBy: validReferredBy,

      referralCode,

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

        referralCode: user.referralCode,

        referredBy: user.referredBy,

        role: user.role

      }

    });


  } catch (error) {

    console.error(
      "Registration error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Unable to register user."

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

        message:
          "Email and password are required."

      });

    }


    // Find user

    const user = await User.findOne({

      email:
        email.toLowerCase().trim()

    });


    if (!user) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid email or password."

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

        message:
          "Invalid email or password."

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


    // Check JWT secret

    if (!process.env.JWT_SECRET) {

      throw new Error(
        "JWT_SECRET is not configured."
      );

    }


    // Create JWT

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


    // Send response

    return res.json({

      success: true,

      message:
        "Login successful.",

      token,

      user: {

        id: user._id,

        name: user.name,

        email: user.email,

        phone: user.phone,

        balance: user.balance,

        referralCode:
          user.referralCode,

        referredBy:
          user.referredBy,

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

      message:
        "Unable to login."

    });

  }

});


// ======================================================
// GET LOGGED-IN USER REFERRAL DATA
// ======================================================

router.get("/referrals", auth, async (req, res) => {

  try {

    const user =
      await User.findById(
        req.user.id
      );


    if (!user) {

      return res.status(404).json({

        success: false,

        message:
          "User not found."

      });

    }


    // Find users referred by this user

    const referrals =
      await User.find({

        referredBy:
          user.referralCode

      })
      .select(
        "name email createdAt"
      )
      .sort({

        createdAt: -1

      });


    return
