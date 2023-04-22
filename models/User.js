// mongoose user model

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    id: String,
    money: Number,
    bank: Number,
    lastDaily: Number,
    lastWork: Number,
    lastRob: Number,
    lastCrime: Number,
    lastWeekly: Number,
    lastMonthly: Number,
    grantedAccess: Boolean,
    stocks: Array,
    crypto: Array,
});

module.exports = mongoose.model("User", userSchema);