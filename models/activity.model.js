const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    mealScanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MealScan"
    },

    suggestedSteps: Number,

    stepsCompleted: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: ["active", "completed", "expired"],
        default: "active"
    },

    startedAt: Date,

    expiresAt: Date,

    notifiedAt1Hour: {
        type: Boolean,
        default: false
    },

    notifiedAt2Hour: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Activity", activitySchema);