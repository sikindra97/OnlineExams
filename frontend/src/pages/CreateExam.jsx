import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function CreateExam() {

const navigate = useNavigate();

const [title,setTitle] = useState("");
const [description,setDescription] = useState("");
const [subject,setSubject] = useState("");
const [numberOfQuestions,setNumberOfQuestions] = useState(10);
const [examType,setExamType] = useState("TIMED");
const [duration,setDuration] = useState(60);
const [startTime,setStartTime] = useState("");
const [endTime,setEndTime] = useState("");

const [difficulty,setDifficulty] = useState("EASY");
const [marksPerQuestion,setMarksPerQuestion] = useState(1);

// NEW
const [passingPercentage,setPassingPercentage] = useState(40);

const totalMarks = numberOfQuestions * marksPerQuestion;
const passingMarks = Math.ceil((passingPercentage/100) * totalMarks);
const [watermarkEnabled,setWatermarkEnabled] = useState(false);
const [watermarkText,setWatermarkText] = useState("");
const createExam = async () => {

try{

const examData = {
title,
description,
subject,
numberOfQuestions,
examType,
difficulty,
marksPerQuestion,
totalMarks,
passingPercentage,
passingMarks,
duration: Number(duration),
startTime,
endTime,
watermark:{
enabled: watermarkEnabled,
text: watermarkText || "CONFIDENTIAL"
}
};

await api.post("/exam",examData);

navigate("/");

}catch(err){

console.error(err);
alert("Failed to create exam");

}

};

return(

<Box sx={{p:4}}>

<Typography variant="h4" mb={3}>
Create Exam
</Typography>

<Paper sx={{p:3}}>

<Stack spacing={3}>

<TextField
label="Exam Title"
value={title}
onChange={(e)=>setTitle(e.target.value)}
fullWidth
/>

<TextField
label="Description"
value={description}
onChange={(e)=>setDescription(e.target.value)}
multiline
rows={2}
fullWidth
/>

<FormControl fullWidth>

<InputLabel>Subject</InputLabel>

<Select
value={subject}
label="Subject"
onChange={(e)=>setSubject(e.target.value)}
>

<MenuItem value="math">Math</MenuItem>
<MenuItem value="java">Java</MenuItem>
<MenuItem value="dsa">DSA</MenuItem>
<MenuItem value="dbms">DBMS</MenuItem>
<MenuItem value="aptitude">Aptitude</MenuItem>

</Select>

</FormControl>

<FormControl fullWidth>

<InputLabel>Difficulty</InputLabel>

<Select
value={difficulty}
label="Difficulty"
onChange={(e)=>setDifficulty(e.target.value)}
>

<MenuItem value="EASY">Easy</MenuItem>
<MenuItem value="MEDIUM">Medium</MenuItem>
<MenuItem value="HARD">Hard</MenuItem>

</Select>

</FormControl>

<TextField
label="Number Of Questions"
type="number"
value={numberOfQuestions}
onChange={(e)=>setNumberOfQuestions(Number(e.target.value))}
fullWidth
/>

<TextField
label="Marks Per Question"
type="number"
value={marksPerQuestion}
onChange={(e)=>setMarksPerQuestion(Number(e.target.value))}
fullWidth
/>

<TextField
label="Passing Percentage (%)"
type="number"
value={passingPercentage}
onChange={(e)=>setPassingPercentage(Number(e.target.value))}
fullWidth
/>

<TextField
label="Total Marks"
value={totalMarks}
InputProps={{readOnly:true}}
fullWidth
/>

<TextField
label="Passing Marks (Auto Calculated)"
value={passingMarks}
InputProps={{readOnly:true}}
fullWidth
/>

<FormControl fullWidth>

<InputLabel>Exam Type</InputLabel>

<Select
value={examType}
label="Exam Type"
onChange={(e)=>setExamType(e.target.value)}
>

<MenuItem value="TIMED">Timed</MenuItem>
<MenuItem value="PRACTICE">Practice</MenuItem>

</Select>

</FormControl>
<FormControl fullWidth>

<InputLabel>Watermark</InputLabel>

<Select
value={watermarkEnabled}
label="Watermark"
onChange={(e)=>setWatermarkEnabled(e.target.value)}
>

<MenuItem value={false}>Disabled</MenuItem>
<MenuItem value={true}>Enabled</MenuItem>

</Select>

</FormControl>
{watermarkEnabled && (

<TextField
label="Watermark Text"
value={watermarkText}
onChange={(e)=>setWatermarkText(e.target.value)}
placeholder="Example: Confidential"
fullWidth
/>

)}

{examType==="TIMED" && (

<TextField
label="Duration (Minutes)"
type="number"
value={duration}
onChange={(e)=>setDuration(Number(e.target.value))}
fullWidth
/>

)}

{examType==="TIMED" && (

<Grid container spacing={2}>

<Grid item xs={6}>

<TextField
type="datetime-local"
label="Start Time"
InputLabelProps={{shrink:true}}
value={startTime}
onChange={(e)=>setStartTime(e.target.value)}
fullWidth
/>

</Grid>

<Grid item xs={6}>

<TextField
type="datetime-local"
label="End Time"
InputLabelProps={{shrink:true}}
value={endTime}
onChange={(e)=>setEndTime(e.target.value)}
fullWidth
/>

</Grid>

</Grid>

)}

<Button
variant="contained"
color="success"
onClick={createExam}
>

Create Exam

</Button>

</Stack>

</Paper>

</Box>

);

}