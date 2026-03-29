const router = require("express").Router();

const Question = require("../models/Question");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

/* =========================
   CREATE QUESTION
========================= */

router.post("/", auth, role("teacher","admin"), async (req,res)=>{
  try{

    const {
      questionText,
      options,
      correctAnswer,
      subject,
      difficulty
    } = req.body;

    const question = await Question.create({
      questionText,
      options,
      correctAnswer: Number(correctAnswer) - 1,
      subject,
      difficulty,
      createdBy:req.user.id
    });

    res.status(201).json(question);

  }catch(err){
    console.error(err);
    res.status(500).json({message:"Failed to create question"});
  }
});

/* =========================
   GET ALL QUESTIONS
========================= */

router.get("/", auth, async(req,res)=>{
try{

const questions = await Question.find()
.populate("createdBy","name email")
.sort({createdAt:-1});

res.json(questions);

}catch(err){
res.status(500).json({message:"Failed to fetch questions"});
}
});


/* =========================
   DELETE QUESTION
========================= */

router.delete("/:id", auth, role("teacher","admin"), async(req,res)=>{
try{

await Question.findByIdAndDelete(req.params.id);

res.json({message:"Question deleted"});

}catch(err){
res.status(500).json({message:"Delete failed"});
}
});


module.exports = router;