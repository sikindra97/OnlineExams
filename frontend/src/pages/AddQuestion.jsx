import { useState,useEffect } from "react";
import {
Box,
Typography,
TextField,
Button,
Paper,
Stack,
MenuItem
} from "@mui/material";

import api from "../api/axios";

export default function AddQuestion(){

const [questionText,setQuestionText] = useState("");
const [options,setOptions] = useState(["","","",""]);
const [correctAnswer,setCorrectAnswer] = useState(0);

const [subjects,setSubjects] = useState([]);   // NEW
const [subject,setSubject] = useState("");     // NEW

const [difficulty,setDifficulty] = useState("medium");

/* LOAD SUBJECTS */

useEffect(()=>{

fetch("http://localhost:5000/api/subject")
.then(res=>res.json())
.then(data=>{

setSubjects(data);

if(data.length>0){
setSubject(data[0].name);
}

});

},[]);

const updateOption=(i,val)=>{
const arr=[...options];
arr[i]=val;
setOptions(arr);
};

const addQuestion=async()=>{

try{

await api.post("/questions",{

questionText,
options,
correctAnswer:correctAnswer+1,
subject,
difficulty

});

alert("Question added");

setQuestionText("");
setOptions(["","","",""]);
setCorrectAnswer(0);
setDifficulty("medium");

}catch(err){

console.error(err);
alert("Failed to add question");

}

};

return(

<Box sx={{p:4}}>

<Typography variant="h4" mb={3}>
Add Question
</Typography>

<Paper sx={{p:3}}>

<Stack spacing={3}>

<TextField
label="Question"
value={questionText}
onChange={(e)=>setQuestionText(e.target.value)}
fullWidth
/>

<TextField
select
label="Subject"
value={subject}
onChange={(e)=>setSubject(e.target.value)}
>

{subjects.map((sub)=>(
<MenuItem key={sub._id} value={sub.name}>
{sub.name}
</MenuItem>
))}

</TextField>

<TextField
select
label="Difficulty"
value={difficulty}
onChange={(e)=>setDifficulty(e.target.value)}
>

<MenuItem value="easy">Easy</MenuItem>
<MenuItem value="medium">Medium</MenuItem>
<MenuItem value="hard">Hard</MenuItem>

</TextField>

{options.map((opt,i)=>(

<TextField
key={i}
label={`Option ${i+1}`}
value={opt}
onChange={(e)=>updateOption(i,e.target.value)}
fullWidth
/>

))}

<TextField
select
label="Correct Answer"
value={correctAnswer}
onChange={(e)=>setCorrectAnswer(Number(e.target.value))}
>

<MenuItem value={0}>Option 1</MenuItem>
<MenuItem value={1}>Option 2</MenuItem>
<MenuItem value={2}>Option 3</MenuItem>
<MenuItem value={3}>Option 4</MenuItem>

</TextField>

<Button
variant="contained"
color="success"
onClick={addQuestion}
>

Add Question

</Button>

</Stack>

</Paper>

</Box>

);

}