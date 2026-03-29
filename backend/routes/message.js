const express = require("express");
const router = express.Router();

const Message = require("../models/Message"); // ✅ CORRECT
const authMiddleware = require("../middleware/authMiddleware"); // ✅ CORRECT

/* ===============================
   STUDENT SEND ISSUE
================================ */
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (!req.body.message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const newMessage = await Message.create({
      sender: req.user.id,
      message: req.body.message,
    });

    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Message error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
});

/* ===============================
   ADMIN / TEACHER VIEW ISSUES
================================ */
router.get("/", authMiddleware, async (req, res) => {
  if (!["admin", "teacher"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }

  const messages = await Message.find()
    .populate("sender", "name email role")
    .sort({ createdAt: -1 });

  res.json(messages);
});

/* ===============================
   MARK AS SEEN
================================ */
router.put("/:id/seen", authMiddleware, async (req, res) => {
  await Message.findByIdAndUpdate(req.params.id, { seen: true });
  res.json({ success: true });
});

module.exports = router;
