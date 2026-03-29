const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

/* =========================
REGISTER
========================= */
router.post("/register", async (req, res) => {
try {


const { name, email, password, role } = req.body;


if (!name || !email || !password) {
  return res.status(400).json({
    success: false,
    message: "Name, email and password are required",
  });
}

const existingUser = await User.findOne({ email });

if (existingUser) {
  return res.status(400).json({
    success: false,
    message: "User already exists",
  });
}

const hashedPassword = await bcrypt.hash(password, 10);

/* SAFE ROLE HANDLING */
const userRole = role === "teacher" ? "teacher" : "student";

const user = await User.create({
  name,
  email,
  password: hashedPassword,
  role: userRole,
  status: userRole === "teacher" ? "pending" : "approved",
});

console.log("USER SAVED:", user);

res.status(201).json({
  success: true,
  message: "User registered successfully",
  userId: user._id,
});

} catch (err) {
console.error("REGISTER ERROR:", err);
res.status(500).json({
success: false,
message: "Server error",
});
}
});

/* =========================
LOGIN
========================= */
router.post("/login", async (req, res) => {
try {
const { email, password } = req.body;

if (!email || !password) {
  return res.status(400).json({
    success: false,
    message: "Email and password required",
  });
}

const user = await User.findOne({ email });

if (!user) {
  return res.status(400).json({
    success: false,
    message: "Invalid credentials",
  });
}

const isMatch = await bcrypt.compare(password, user.password);

if (!isMatch) {
  return res.status(400).json({
    success: false,
    message: "Invalid credentials",
  });
}

if (user.status === "rejected") {
  return res.status(403).json({
    success: false,
    message: "Your account was rejected by admin",
  });
}

if (user.role === "teacher" && user.status !== "approved") {
  return res.status(403).json({
    success: false,
    message: "Account waiting for admin approval",
  });
}

const token = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

res.json({
  success: true,
  token,
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
});

} catch (err) {
console.error("LOGIN ERROR:", err);

res.status(500).json({
  success: false,
  message: "Server error",
});

}
});

/* =========================
CURRENT USER
========================= */
router.get("/me", auth, async (req, res) => {
const user = await User.findById(req.user.id).select("-password");

res.json({
success: true,
user,
});
});

/* =========================
pending teacher
========================= */

router.get("/pending-teachers", auth, roleMiddleware("admin"), async (req, res) => {

const teachers = await User.find({
role: "teacher",
status: "pending"
}).select("-password");

res.json({
success: true,
teachers
});

});

/* =========================
Approve Teacher
========================= */
router.put("/approve-teacher/:id", auth, roleMiddleware("admin"), async (req, res) => {

const teacher = await User.findById(req.params.id);

if (!teacher) {
return res.status(404).json({
success: false,
message: "Teacher not found"
});
}

teacher.status = "approved";
await teacher.save();

res.json({
success: true,
message: "Teacher approved"
});

});

/* =========================
REJECT TEACHER
========================= */

router.put("/reject-teacher/:id", auth, roleMiddleware("admin"), async (req, res) => {

const teacher = await User.findById(req.params.id);

if (!teacher) {
return res.status(404).json({
success: false,
message: "Teacher not found"
});
}

teacher.status = "rejected";
await teacher.save();

res.json({
success: true,
message: "Teacher rejected"
});

});

/* =========================
GET USERS (ADMIN)
========================= */
router.get("/users", auth, roleMiddleware("admin"), async (req, res) => {
const users = await User.find().select("-password");

res.json({
success: true,
users,
});
});

/* =========================
DELETE USER
========================= */
router.delete("/users/:id", auth, roleMiddleware("admin"), async (req, res) => {

if (req.user.id === req.params.id) {
return res.status(400).json({
success: false,
message: "Admin cannot delete himself",
});
}

await User.findByIdAndDelete(req.params.id);

res.json({
success: true,
message: "User deleted successfully",
});
});

module.exports = router;
