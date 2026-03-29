
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const Exam = require("../models/Exam");
const Result = require("../models/Result");
const Question = require("../models/Question");

/* =========================
   CREATE EXAM
========================= */
router.post("/", auth, role("teacher","admin"), async(req,res)=>{
try{
console.log("BODY DATA:", req.body); 
const {
title,
description,
subject,
numberOfQuestions,
examType,
duration,
startTime,
endTime,
watermark

} = req.body;

if(!title || !subject || !numberOfQuestions){
return res.status(400).json({
message:"title, subject and numberOfQuestions required"
});
}

const exam = await Exam.create({
title,
description,
subject:subject.trim().toLowerCase(),
numberOfQuestions,
examType,
duration:Number(duration),

startTime,
endTime,
watermark: watermark || {
enabled:false,
text:""
},
createdBy:req.user.id
});

res.status(201).json(exam);

}catch(err){
console.error(err);
res.status(500).json({message:"Failed to create exam"});
}
});


/* =========================
   GET ALL EXAMS
========================= */
router.get("/", auth, async (req, res) => {

try{

const now = Date.now();

const exams = await Exam.find().sort({createdAt:-1});

let attemptedMap={};

if(req.user.role==="student"){

const attempts = await Result.find({
student:req.user.id,
practice:false
}).select("exam");

attempts.forEach(a=>{
attemptedMap[a.exam.toString()]=true;
});

}

const examsWithStatus = exams.map(exam=>{

let status="PRACTICE";

if(exam.examType==="TIMED"){

const start = exam.startTime && new Date(exam.startTime).getTime();
const end = exam.endTime && new Date(exam.endTime).getTime();

if(!start || now < start) status="UPCOMING";
else if(now > end) status="ENDED";
else status="LIVE";

}

return{
...exam.toObject(),
status,
hasAttempted:attemptedMap[exam._id.toString()] || false
};

});

res.json(examsWithStatus);

}catch(err){

console.error(err);

res.status(500).json({
message:"Error fetching exams"
});
}

});


/* =========================
   GET EXAM FOR EDIT
========================= */
router.get("/edit/:id", auth, role("teacher","admin"), async(req,res)=>{

try{

const exam = await Exam.findById(req.params.id);

if(!exam){
return res.status(404).json({message:"Exam not found"});
}

res.json(exam);

}catch(err){

console.error(err);

res.status(500).json({
message:"Failed to load exam"
});
}

});


/* =========================
   UPDATE EXAM
========================= */
router.put("/:id", auth, role("teacher","admin"), async(req,res)=>{

try{

const exam = await Exam.findByIdAndUpdate(
req.params.id,
req.body,
{new:true,runValidators:true}
);

if(!exam){
return res.status(404).json({message:"Exam not found"});
}

res.json({
success:true,
exam
});

}catch(err){

console.error(err);

res.status(500).json({
message:"Failed to update exam"
});
}

});


/* =========================
   DELETE EXAM
========================= */
router.delete("/:id", auth, role("admin"), async(req,res)=>{

try{

const exam = await Exam.findByIdAndDelete(req.params.id);

if(!exam){
return res.status(404).json({message:"Exam not found"});
}

res.json({
success:true,
message:"Exam deleted successfully"
});

}catch(err){

console.error(err);

res.status(500).json({
message:"Failed to delete exam"
});
}

});


/* =========================
   START EXAM
========================= */
router.get("/:id", auth, async(req,res)=>{

try{

const exam = await Exam.findById(req.params.id);

if(!exam){
return res.status(404).json({
message:"Exam not found"
});
}

if(req.user.role!=="student"){
return res.json(exam);
}

/* TIMED SECURITY */

const now = Date.now();

if(exam.examType==="TIMED"){

const start = new Date(exam.startTime).getTime();
const end = new Date(exam.endTime).getTime();

if(now < start){
return res.status(403).json({status:"UPCOMING"});
}

if(now > end){
return res.status(403).json({status:"ENDED"});
}

}

/* CHECK ATTEMPT */

let existingResult = null;

if(exam.examType === "TIMED"){

existingResult = await Result.findOne({
student:req.user.id,
exam:exam._id,
practice:false
});

}

console.log("Existing Result:", existingResult);

/* If exam already submitted → BLOCK */
/* If exam already submitted → BLOCK */

if (exam.examType === "TIMED" && existingResult && existingResult.status !== "PENDING") {
return res.status(403).json({
status:"LOCKED",
message:"You already attempted this exam"
});
}

/* If exam already started → RESUME */

if (existingResult && existingResult.status === "PENDING") {

if(!existingResult.questions){
return res.status(500).json({message:"Session data missing"});
}

const safeQuestions = existingResult.questions.map(q => ({
_id:q._id,
questionText:q.questionText || q.question,
options:q.options
}));

return res.json({
examId:exam._id,
title:exam.title,
questions:safeQuestions,
examType: exam.examType,
duration: exam.duration,
watermark: exam.watermark

});
}

/* FETCH QUESTIONS */

const subject = (exam.subject || "").trim().toLowerCase();
console.log("Exam subject:", subject);

let questions = await Question.find({
subject:new RegExp(`^${subject}$`,"i")
});

if(!questions.length){
return res.status(400).json({
message:"No questions found for this subject"
});
}

/* RANDOMIZE */

questions = questions.sort(()=>0.5-Math.random());

const selectedQuestions = questions.slice(0,Number(exam.numberOfQuestions));

/* STORE SESSION */

if(exam.examType === "TIMED"){

await Result.create({
student:req.user.id,
exam:exam._id,
questions:selectedQuestions.map(q => ({
questionText: q.questionText || q.question,
options: q.options,
correctAnswer: q.correctAnswer
})),
practice:false,
score:0,
total:0,
percentage:0,
status:"PENDING"
});

}

/* SEND SAFE QUESTIONS */

const safeQuestions = selectedQuestions.map(q=>({
_id:q._id,
questionText:q.questionText || q.question,
options:q.options
}));

res.json({
examId: exam._id,
title: exam.title,
questions: safeQuestions,
examType: exam.examType,
duration: exam.duration,
watermark: exam.watermark
});

}catch(err){

console.error(err);

res.status(500).json({
message:"Error fetching exam"
});
}

});

/* =========================
   SUBMIT EXAM
========================= */
router.post("/:id/submit", auth, async(req,res)=>{
console.log("🔥 SUBMIT ROUTE HIT");
console.log("BODY:",req.body);

try{

const exam = await Exam.findById(req.params.id);

if(!exam){
return res.status(404).json({
message:"Exam not found"
});
}

const answers = req.body.answers;

if(!Array.isArray(answers)){
return res.status(400).json({
message:"Answers must be an array"
});
}

let result = null;

if(exam.examType === "TIMED"){

result = await Result.findOne({
student:req.user.id,
exam:exam._id,
practice:false
});

}

if(exam.examType === "TIMED" && !result){
return res.status(400).json({
message:"Exam session not found"
});
}

/* =========================
   FIXED QUESTIONS FETCH
========================= */

let questions;

if(exam.examType === "TIMED"){

questions = result.questions;

}else{

questions = await Question.find({
subject:new RegExp(`^${exam.subject}$`,"i")
}).limit(exam.numberOfQuestions);

}

if(answers.length !== questions.length){
return res.status(400).json({
message:"Answer count mismatch"
});
}

/* =========================
   RESULT CALCULATION
========================= */

let correctCount = 0;
const answerDetails = [];

console.log("User Answers:", answers);

questions.forEach((q,i)=>{

const userAnswer = Number(answers[i]);
const correctAnswer = Number(q.correctAnswer);

console.log("Q:", i+1);
console.log("User:", userAnswer);
console.log("Correct:", correctAnswer);

let isCorrect = false;

if(!isNaN(userAnswer) && userAnswer === correctAnswer){
correctCount++;
isCorrect = true;
}

answerDetails.push({
question:q.questionText || q.question,
options:q.options,
userAnswer,
correctAnswer,
isCorrect
});

});

const marksPerQuestion = exam.marksPerQuestion || 1;

const total = questions.length * marksPerQuestion;

const score = correctCount * marksPerQuestion;

const percentage = Math.round((score/total)*100);

const passingPercentage = exam.passingPercentage || 40;

const status = percentage >= passingPercentage ? "PASS":"FAIL";

/* =========================
   SAVE RESULT ONLY FOR TIMED
========================= */

if(exam.examType === "TIMED"){

result.score=score;
result.total=total;
result.percentage=percentage;
result.status=status;

await result.save();

}

res.json({
examTitle:exam.title,
score,
total,
percentage,
status
});

}catch(err){

console.error(err);

res.status(500).json({
message:"Failed to submit exam"
});
}


});

module.exports = router;