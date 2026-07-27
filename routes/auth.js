const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();


// Register
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      referredBy
    } = req.body;


    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      referredBy
    });


    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone
      }
    });


  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});



// Login
router.post("/login", async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;


    const user = await User.findOne({ email });


    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }


    const validPassword = await bcrypt.compare(
      password,
      user.password
    );


    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }


    const token = jwt.sign(
      {
        id: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );


    res.json({
    success: true,
    token,
    user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        totalEarnings: user.totalEarnings || 0
    }
});


  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});


module.exports = router;
