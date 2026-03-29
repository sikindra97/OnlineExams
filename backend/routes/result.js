const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const Exam = require("../models/Exam");
const Result = require("../models/Result");

/* =========================
   STUDENT: GET ALL MY RESULTS
========================= */
router.get("/my-results", auth, async (req, res) => {
  try {
    console.log("📱 Fetching results for user:", req.user.id);
    
    if (req.user.role !== "student") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Students only." 
      });
    }

    const results = await Result.find({
      student: req.user.id,
      practice: false,
    })
      .populate("exam", "title examType description")
      .sort({ createdAt: -1 });

    console.log("✅ Found", results.length, "results for student");

    res.json({
      success: true,
      data: results.map(r => ({
        _id: r._id,
        exam: r.exam,
        score: r.score,
        total: r.total,
        percentage: r.percentage,
        status: r.status,
        submittedAt: r.submittedAt || r.createdAt,
      }))
    });
  } catch (err) {
    console.error("❌ Error fetching results:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to load result history" 
    });
  }
});

/* =========================
   STUDENT: GET SPECIFIC EXAM RESULT
========================= */
router.get("/exam/result/me/:examId", auth, async (req, res) => {
  try {
    // console.log("🚀 ====== FETCHING STUDENT RESULT ======");
    // console.log("📝 Exam ID:", req.params.examId);
    // console.log("👤 User ID:", req.user.id);
    // console.log("👤 User Role:", req.user.role);

    const { examId } = req.params;
    const userId = req.user.id;

    // Validate user is student
    if (req.user.role !== "student") {
      return res.status(403).json({ 
        success: false, 
        message: "Only students can access this endpoint" 
      });
    }

    // Validate examId format
    if (!examId || examId.length !== 24) {
      console.log("❌ Invalid exam ID format");
      return res.status(400).json({ 
        success: false,
        message: "Invalid exam ID format" 
      });
    }

    console.log("🔍 Searching for result...");
    
    // Find the student's result
    const result = await Result.findOne({
      exam: examId,
      student: userId,
      practice: false,
    }).populate("exam", "title examType description");

    // console.log("🔍 Query result:", result ? "Found" : "Not found");

    if (!result) {
      console.log("❌ No result found");
      
      // Check if exam exists
      const exam = await Exam.findById(examId).select("title");
      console.log("🔍 Exam exists:", exam ? "Yes" : "No");
      
      return res.status(404).json({ 
        success: false,
        message: exam 
          ? "You haven't attempted this exam yet." 
          : "Exam not found."
      });
    }

    console.log("✅ Result found!");
    
    // Calculate rank
    const totalStudents = await Result.countDocuments({ 
      exam: examId, 
      practice: false 
    });
    
    const betterThan = await Result.countDocuments({ 
      exam: examId, 
      practice: false,
      percentage: { $gt: result.percentage } 
    });
    
    const rank = betterThan + 1;

    // Prepare response
    const responseData = {
      success: true,
      data: {
        _id: result._id,
        exam: result.exam,
        score: result.score,
        total: result.total,
        percentage: result.percentage,
        status: result.status,
        submittedAt: result.submittedAt || result.createdAt,
        createdAt: result.createdAt,
        rank: rank,
        totalStudents: totalStudents,
      }
    };

    console.log("📤 Sending response");
    res.json(responseData);
    
  } catch (error) {
    console.error("🔥 ERROR:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching result",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/* =========================
   TEACHER/ADMIN: GET ALL RESULTS FOR EXAM
========================= */
router.get("/exam/results/:examId", auth, async (req, res) => {
  try {
    // console.log("👨‍🏫 ====== FETCHING ALL RESULTS FOR EXAM ======");
    // console.log("📝 Exam ID:", req.params.examId);
    // console.log("👤 User Role:", req.user.role);

    // Check permissions
    if (req.user.role !== "teacher" && req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Teachers/admins only." 
      });
    }

    const { examId } = req.params;

    // Get exam details
    const exam = await Exam.findById(examId).select("title description");
    if (!exam) {
      return res.status(404).json({ 
        success: false, 
        message: "Exam not found" 
      });
    }

    console.log("🔍 Fetching results for exam:", exam.title);
    
    // Get all results
    const results = await Result.find({ 
      exam: examId,
      practice: false 
    })
      .populate("student", "name email")
      .sort({ percentage: -1, createdAt: 1 });

    // console.log("✅ Found", results.length, "results");

    // Add ranking
    const rankedResults = results.map((result, index) => ({
      ...result.toObject(),
      rank: index + 1,
    }));

    res.json({
      success: true,
      data: {
        examTitle: exam.title,
        examDescription: exam.description,
        results: rankedResults,
        total: results.length,
        average: results.length > 0 
          ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(2)
          : 0
      }
    });

  } catch (error) {
    console.error("🔥 ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

/* =========================
   TEACHER/ADMIN: GET LIVE RESULTS
========================= */
router.get("/exam/results/live/:examId", auth, async (req, res) => {
  try {
    if (req.user.role !== "teacher" && req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Teachers/admins only." 
      });
    }

    const { examId } = req.params;

    const results = await Result.find({ 
      exam: examId,
      practice: false 
    })
      .populate("student", "name email")
      .sort({ percentage: -1 });

    res.json({
      success: true,
      data: results.map((r, i) => ({
        ...r.toObject(),
        rank: i + 1,
      }))
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================
   TEST ENDPOINT
========================= */
router.get("/test", auth, (req, res) => {
  res.json({
    success: true,
    message: "Result API is working!",
    user: {
      id: req.user.id,
      role: req.user.role,
      email: req.user.email
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;