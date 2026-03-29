import { useEffect, useState } from "react";
import {
Box,
Typography,
Paper,
Stack,
TextField,
Button
} from "@mui/material";
import api from "../api/axios";

export default function Subjects(){

const [subjects,setSubjects] = useState([]);
const [newSubject,setNewSubject] = useState("");

const loadSubjects = async ()=>{
try{
const res = await api.get("/subject");
setSubjects(res.data);
}catch(err){
console.error(err);
}
};

useEffect(()=>{
loadSubjects();
},[]);

const addSubject = async()=>{

if(!newSubject.trim()) return;

try{

await api.post("/subject/add", {
  name: newSubject
});

setNewSubject("");
loadSubjects();

}catch(err){
console.error(err);
}

};

return(

<Box sx={{p:4}}>

<Typography variant="h4" mb={3}>
Subjects
</Typography>

<Paper sx={{p:3}}>

<Stack spacing={2}>

{subjects.map((s)=>(
<Typography key={s._id}>
{s.name}
</Typography>
))}

<TextField
label="New Subject"
value={newSubject}
onChange={(e)=>setNewSubject(e.target.value)}
/>

<Button variant="contained" onClick={addSubject}>
Add Subject
</Button>

</Stack>

</Paper>

</Box>

);

}