const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");

// Add subject
router.post("/add", async (req, res) => {
  try {
    const { name } = req.body;

    const subject = new Subject({ name });
    await subject.save();

    res.json({ message: "Subject Added" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all subjects
router.get("/", async (req, res) => {
  const subjects = await Subject.find();
  res.json(subjects);
});

module.exports = router;