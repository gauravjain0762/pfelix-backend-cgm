const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true
        },

        email:{
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },

        resetOtp: String,
        otpExpiry: Date,

        userProfile: {
  type: Object,
  default: {}
        },
        notifications: {
  postMealWalkReminder: {
    type: Boolean,
    default: true
  }
},
    },
    { timestamps: true }
);


module.exports = mongoose.model("User", userSchema);