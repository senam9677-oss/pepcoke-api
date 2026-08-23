const express = require("express");
const auth = require("../middleware/auth");
const Support = require("../models/Support");

const router = express.Router();


// ==========================================
// CREATE SUPPORT MESSAGE
// ==========================================

router.post("/", auth, async (req, res) => {

  try {

    const {
      subject,
      message
    } = req.body;


    // Validate subject

    if (
      !subject ||
      !subject.trim()
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Support subject is required."

      });

    }


    // Validate message

    if (
      !message ||
      !message.trim()
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Support message is required."

      });

    }


    // Create support message

    const supportMessage =
      await Support.create({

        user:
          req.user.id,

        subject:
          subject.trim(),

        message:
          message.trim(),

        status:
          "Open"

      });


    return res.status(201).json({

      success: true,

      message:
        "Your support message has been sent successfully.",

      supportMessage

    });


  } catch (error) {

    console.error(
      "Create support message error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

});


// ==========================================
// GET LOGGED-IN USER'S SUPPORT MESSAGES
// ==========================================

router.get("/", auth, async (req, res) => {

  try {

    const supportMessages =
      await Support.find({

        user:
          req.user.id

      })
      .sort({

        createdAt:
          -1

      });


    return res.json({

      success: true,

      supportMessages

    });


  } catch (error) {

    console.error(
      "Get support messages error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

});


module.exports = router;
