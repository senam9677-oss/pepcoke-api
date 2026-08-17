const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema(
  {
    // ==========================================
    // USER
    // ==========================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


    // ==========================================
    // DEPOSIT AMOUNT
    // ==========================================

    amount: {
      type: Number,
      required: true,
      min: 100,
    },


    // ==========================================
    // PAYMENT METHOD
    // ==========================================

    paymentMethod: {
      type: String,
      required: true,
    },


    // ==========================================
    // TRANSACTION ID
    // ==========================================

    transactionId: {
      type: String,
      required: true,
      trim: true,
    },


    // ==========================================
    // SENDER NAME
    // ==========================================

    senderName: {
      type: String,
      required: true,
      trim: true,
    },


    // ==========================================
    // SENDER PHONE
    // ==========================================

    senderPhone: {
      type: String,
      required: true,
      trim: true,
    },


    // ==========================================
    // DEPOSIT STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected"
      ],
      default: "Pending",
    },
  },


  // ==========================================
  // TIMESTAMPS
  // ==========================================

  {
    timestamps: true,
  }
);


module.exports =
  mongoose.models.Deposit ||
  mongoose.model("Deposit", depositSchema);
