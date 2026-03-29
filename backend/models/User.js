const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,

  role: {
    type: String,
    enum: ["admin", "teacher", "student"],
    default: "student",
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
});

module.exports = mongoose.model("User", userSchema);
