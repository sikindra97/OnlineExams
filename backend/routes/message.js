const express = require("express");
const router = express.Router();

const Message = require("../models/Message"); 
const authMiddleware = require("../middleware/authMiddleware");

//student send message 

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

// admin/teacher get all messages
router.get("/", authMiddleware, async (req, res) => {
  if (!["admin", "teacher"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }

  const messages = await Message.find()
    .populate("sender", "name email role")
    .sort({ createdAt: -1 });

  res.json(messages);
});
//delete message 
router.delete("/:id", authMiddleware, async (req, res) => {
  try {

    console.log("DELETE ID:", req.params.id);
    console.log("USER:", req.user);

    const message =
      await Message.findByIdAndDelete(req.params.id);

    console.log("DELETED:", message);

    res.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: err.message
    });

  }
});
// seen
router.put("/:id/seen", authMiddleware, async (req, res) => {
  await Message.findByIdAndUpdate(req.params.id, { seen: true });
  res.json({ success: true });
});

module.exports = router;
