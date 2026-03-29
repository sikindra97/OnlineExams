

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

import Swal from "sweetalert2";
import {
  Box,
  Typography,
  Button,
  Paper,
  Radio,
  RadioGroup,
  Divider,
  Alert,
  LinearProgress
} from "@mui/material";

export default function Exam(){

const { id } = useParams();
const navigate = useNavigate();

const [exam,setExam] = useState(null);
const [answers,setAnswers] = useState([]);
const [timeLeft,setTimeLeft] = useState(null);
const [submitted,setSubmitted] = useState(false);
const [error,setError] = useState("");
const [loading,setLoading] = useState(true);



/* ================= FETCH EXAM ================= */

useEffect(()=>{

api.get(`/exam/${id}`)

.then(res=>{

setExam(res.data);

setAnswers(Array(res.data.questions.length).fill(null));


/* TIMER SETUP */

if(res.data.examType==="TIMED"){

const key=`exam_start_${id}`;

let startTime = localStorage.getItem(key);

if(!startTime){

startTime = Date.now();
localStorage.setItem(key,startTime);

}else{

startTime = Number(startTime);

}

const durationSeconds = res.data.duration * 60;

const elapsed = Math.floor((Date.now() - startTime)/1000);

const remaining = durationSeconds - elapsed;

setTimeLeft(remaining > 0 ? remaining : 0);

}

})

.catch(err=>{
setError(err.response?.data?.message || "Failed to load exam");
})

.finally(()=>{
setLoading(false);
});

},[id]);



/* ================= TIMER ================= */

useEffect(()=>{

if(timeLeft > 0 && !submitted){

const t = setTimeout(()=>{
setTimeLeft(v=>v-1);
},1000);

return ()=>clearTimeout(t);

}

if(timeLeft === 0 && !submitted && exam?.examType==="TIMED"){
submitExam();
}

},[timeLeft,submitted,exam]);
/* ================= ANTI CHEATING ================= */
useEffect(() => {

  let violations = 0;

  const enterFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(()=>{});
    }
  };

  /* START FULLSCREEN */
  enterFullscreen();

  const addViolation = async (msg) => {

    violations++;

    await Swal.fire({
      icon: "warning",
      title: "Violation Detected",
      text: `${msg} (${violations}/3)`,
      confirmButtonColor: "#d33",
      allowOutsideClick:false
    });

    if(violations >= 3){

      await Swal.fire({
        icon:"error",
        title:"Exam Submitted",
        text:"Too many violations detected"
      });

      submitExam();
      return;
    }

    /* ALERT CLOSE -> FORCE FULLSCREEN AGAIN */

    setTimeout(()=>{
      enterFullscreen();
    },200);

  };


  /* TAB SWITCH */

  const handleVisibilityChange = () => {
    if (document.hidden) {
      addViolation("Tab switching detected");
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);


  /* RIGHT CLICK */

  const disableRightClick = (e) => e.preventDefault();
  document.addEventListener("contextmenu", disableRightClick);


  /* COPY PASTE */

  const disableCopyPaste = (e) => e.preventDefault();
  document.addEventListener("copy", disableCopyPaste);
  document.addEventListener("paste", disableCopyPaste);
  document.addEventListener("cut", disableCopyPaste);


  /* KEY SHORTCUTS */

  const disableKeys = (e) => {

    if(e.ctrlKey && ["c","v","x","a"].includes(e.key.toLowerCase())){
      e.preventDefault();
    }

    if(e.key==="PrintScreen"){
      e.preventDefault();
      addViolation("Screenshot attempt detected");
    }

  };

  document.addEventListener("keydown", disableKeys);


  /* TEXT SELECT */

  const disableSelection = (e)=>e.preventDefault();
  document.addEventListener("selectstart", disableSelection);


  /* FULLSCREEN EXIT */

  const handleFullscreenExit = () => {
    if(!document.fullscreenElement){
      addViolation("Fullscreen exited");
    }
  };

  document.addEventListener("fullscreenchange", handleFullscreenExit);


  /* DEVTOOLS */

  const detectDevTools = setInterval(()=>{

    if(window.outerWidth - window.innerWidth > 160){
      addViolation("Developer tools detected");
    }

  },2000);


  return () => {

    document.removeEventListener("visibilitychange", handleVisibilityChange);
    document.removeEventListener("contextmenu", disableRightClick);
    document.removeEventListener("copy", disableCopyPaste);
    document.removeEventListener("paste", disableCopyPaste);
    document.removeEventListener("cut", disableCopyPaste);
    document.removeEventListener("keydown", disableKeys);
    document.removeEventListener("selectstart", disableSelection);
    document.removeEventListener("fullscreenchange", handleFullscreenExit);

    clearInterval(detectDevTools);

  };

}, []);

/* ================= HANDLE ANSWER ================= */

const handleSelect = (questionIndex, optionIndex) => {

setAnswers(prev => {

const updated = [...prev];
updated[questionIndex] = optionIndex;

return updated;

});

};



/* ================= SUBMIT EXAM ================= */

const submitExam = async ()=>{

console.log("Submitting answers:", answers);

if(submitted) return;

if(!answers.some(a=>a!==null)){

setError("Please attempt at least one question");
return;

}

setSubmitted(true);

try{

let res;

if(exam.examType === "PRACTICE"){

  // calculate simple result locally
  res = {
    data:{
      score: answers.filter(a => a !== null).length,
      total: exam.questions.length
    }
  };

}else{

  res = await api.post(`/exam/${id}/submit`,{answers});

}

/* CLEAR TIMER */

localStorage.removeItem(`exam_start_${id}`);

/* PRACTICE EXAM RESULT */

if(exam.examType==="PRACTICE"){

localStorage.setItem(

`practice_result_${id}`,

JSON.stringify({

...res.data,
examTitle: exam.title,
practice: true,
attemptedAt: new Date().toISOString()

})

);

}

navigate(`/exam/result/${id}`,{state:res.data});

}catch(err){

setSubmitted(false);

setError(err.response?.data?.message || "Failed to submit exam");

}

};



/* ================= TIME FORMAT ================= */

const formatTime = s =>{

const h = Math.floor(s/3600);
const m = Math.floor((s%3600)/60);
const sec = s%60;

return `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${sec.toString().padStart(2,"0")}`;

};



/* ================= LOADING ================= */

if(loading) return <LinearProgress/>;



/* ================= ERROR ================= */

if(error){

return(

<Box
sx={{
minHeight:"70vh",
display:"flex",
alignItems:"center",
justifyContent:"center"
}}
>

<Paper
elevation={3}
sx={{
p:5,
textAlign:"center",
maxWidth:420
}}
>

<Typography variant="h5" color="error" mb={2}>
⚠ Exam Already Attempted
</Typography>

<Typography color="text.secondary" mb={3}>
You have already submitted this exam.
Each student is allowed only one attempt.
</Typography>

<Box sx={{display:"flex",gap:2,justifyContent:"center"}}>

<Button
variant="contained"
onClick={()=>navigate("/history")}
>
View Result
</Button>

<Button
variant="outlined"
onClick={()=>navigate("/")}
>
Back to Dashboard
</Button>

</Box>

</Paper>

</Box>

);

}



/* ================= UI ================= */

return(

<Box sx={{p:4}}>


{/* TIMER */}

{timeLeft!==null && exam.examType==="TIMED" && (

<Box
sx={{
position:"fixed",
top:80,
right:30,
background: timeLeft<=300 ? "#d32f2f" : "#1e1e1e",
color:"#fff",
px:2.5,
py:1,
borderRadius:2,
fontWeight:"bold",
zIndex:1200
}}
>

⏱ Time Left: {formatTime(timeLeft)}

</Box>

)}



<Paper className="exam-paper" sx={{p:4}}>

{/* WATERMARK GRID */}
<div className="exam-watermark">
{Array.from({length:24}).map((_,i)=>(
<span key={i}>
{exam?.watermark?.text || "CONFIDENTIAL"}
</span>
))}
</div>

<Typography variant="h4" mb={1}>
{exam.title}
</Typography>

<Typography color="text.secondary" mb={2}>
{exam.description}
</Typography>

<Divider/>


{/* QUESTIONS */}

{exam.questions.map((q,qi)=>(

<Box key={qi} sx={{mt:4}}>

<Typography fontWeight="bold">
{qi+1}. {q.questionText}
</Typography>


<RadioGroup
value={answers[qi]!==null ? answers[qi] : ""}
onChange={(e)=>handleSelect(qi, Number(e.target.value))}
>

{q.options.map((opt,oi)=>(

<Box key={oi} sx={{display:"flex",gap:2,mb:1}}>

<Radio value={oi}/>

<Typography>
{opt}
</Typography>

</Box>

))}

</RadioGroup>

</Box>

))}



<Box sx={{mt:4,display:"flex",justifyContent:"space-between"}}>

<Typography>
Answered: {answers.filter(a=>a!==null).length} / {exam.questions.length}
</Typography>


<Button
variant="contained"
color="success"
disabled={submitted}
onClick={submitExam}
>
Submit Exam
</Button>

</Box>


</Paper>

</Box>

);

}
