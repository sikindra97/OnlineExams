const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },

  options: {
    type: [String],
    required: true,
  },

  correctAnswer: {
    type: Number,
    required: true,
  },

  subject: {
    type: String,
    required: true,
  },

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
},
{ timestamps: true });

module.exports = mongoose.model("Question", questionSchema);