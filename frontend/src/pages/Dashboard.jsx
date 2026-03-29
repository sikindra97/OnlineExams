import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  CircularProgress,
  Box,
  Stack,
  Button
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EmailIcon from "@mui/icons-material/Email";
import MenuBookIcon from "@mui/icons-material/MenuBook";

import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";
import ExamCard from "../components/ExamCard";

export default function Dashboard({ filter }) {

  const { user } = useAuth();
  const role = user?.role;
  const navigate = useNavigate();

  const [exams,setExams] = useState([]);
  const [loading,setLoading] = useState(true);
  const [messageCount,setMessageCount] = useState(0);

  /* ================= FETCH EXAMS ================= */

  const fetchExams = async () => {

    try {

      const res = await api.get("/exam");

      const sorted = res.data.sort(
        (a,b)=> new Date(b.startTime) - new Date(a.startTime)
      );

      setExams(sorted);

    }
    catch(err){
      console.error(err);
    }
    finally{
      setLoading(false);
    }

  };

  /* ================= FETCH MESSAGE COUNT ================= */

  const fetchMessageCount = async () => {

    try{

      const res = await api.get("/messages");
      setMessageCount(res.data.length);

    }
    catch(err){
      console.error(err);
    }

  };

  /* ================= USE EFFECT ================= */

  useEffect(()=>{

    fetchExams();

    if(role === "admin" || role === "teacher"){
      fetchMessageCount();
    }

    const interval = setInterval(()=>{

      fetchExams();

      if(role === "admin" || role === "teacher"){
        fetchMessageCount();
      }

    },30000);

    return ()=> clearInterval(interval);

  },[role]);

  if(loading){
    return(
      <Container sx={{py:6,textAlign:"center"}}>
        <CircularProgress/>
      </Container>
    );
  }

  /* ================= GROUP EXAMS ================= */

const activeExams = exams.filter(
  e =>
    ((e.status === "LIVE" || e.status === "UPCOMING") ||
      e.examType === "PRACTICE") &&
    (!e.hasAttempted || e.examType === "PRACTICE")
);

const upcomingExams = exams.filter(
  e => e.status === "UPCOMING" && !e.hasAttempted
);
  const liveExams = exams.filter(
  e => e.status === "LIVE" && !e.hasAttempted
);

const historyExams = exams.filter(
  e => (e.hasAttempted && e.examType !== "PRACTICE") || e.status === "ENDED"
);

  /* ================= FILTER ROUTES ================= */

  let filteredExams = exams;

  if(filter==="active") filteredExams = activeExams;
  if(filter==="upcoming") filteredExams = upcomingExams;
  if(filter==="live") filteredExams = liveExams;
  if(filter==="history") filteredExams = historyExams;

  /* ================= ADMIN / TEACHER DASHBOARD ================= */

  if(role === "admin" || role === "teacher"){

    return(

      <Container maxWidth="lg" sx={{py:4}}>

      {/* DASHBOARD ACTIONS */}

      <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">

      <Button
      variant="contained"
      startIcon={<AddIcon/>}
      onClick={()=>navigate("/create-exam")}
      >
      Create Exam
      </Button>

      <Button
      variant="outlined"
      startIcon={<MenuBookIcon/>}
      onClick={()=>navigate("/add-question")}
      >
      Question Bank
      </Button>

      <Button
      variant="outlined"
      startIcon={<EmailIcon/>}
      onClick={()=>navigate("/admin/messages")}
      >
      Messages ({messageCount})
      </Button>

      <Button
      variant="outlined"
      startIcon={<MenuBookIcon/>}
      onClick={()=>navigate("/subjects")}
      >
      Subjects
      </Button>

      </Stack>

        <Typography variant="h5" mb={3}>
          All Exams
        </Typography>

        <Grid container spacing={3}>

          {exams.map(exam=>(
            <Grid item xs={12} md={6} lg={4} key={exam._id}>
              <ExamCard
                exam={exam}
                role={role}
                navigate={navigate}
              />
            </Grid>
          ))}

        </Grid>

      </Container>

    );

  }

  /* ================= FILTER PAGE ================= */

  if(filter){

    return(

      <Container maxWidth="lg" sx={{py:4}}>

        <Typography variant="h5" mb={3}>
          {filter.toUpperCase()} Exams
        </Typography>

        {filteredExams.length === 0 ? (
          <Box textAlign="center" py={5}>
            <Typography color="text.secondary">
              No {filter} exams available
            </Typography>
          </Box>
        ) : (

          <Grid container spacing={3}>

            {filteredExams.map(exam=>(
              <Grid item xs={12} md={6} lg={4} key={exam._id}>
                <ExamCard
                  exam={exam}
                  role={role}
                  navigate={navigate}
                />
              </Grid>
            ))}

          </Grid>

        )}

      </Container>

    );

  }

  /* ================= STUDENT DASHBOARD ================= */

  return (

    <Container maxWidth="lg" sx={{py:4}}>

      {/* ACTIVE */}

      <Box id="active">
        <Typography variant="h5" mb={2}>
          Active Exams
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>

        {activeExams.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="text.secondary">
              No Active Exams
            </Typography>
          </Grid>
        ) : activeExams.map(exam=>(
          <Grid item xs={12} md={6} lg={4} key={exam._id}>
            <ExamCard
              exam={exam}
              role={role}
              navigate={navigate}
            />
          </Grid>
        ))}

      </Grid>

      {/* UPCOMING */}

      <Box id="upcoming">
        <Typography variant="h5" mb={2}>
          Upcoming Exams
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>

        {upcomingExams.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="text.secondary">
              No Upcoming Exams
            </Typography>
          </Grid>
        ) : upcomingExams.map(exam=>(
          <Grid item xs={12} md={6} lg={4} key={exam._id}>
            <ExamCard
              exam={exam}
              role={role}
              navigate={navigate}
            />
          </Grid>
        ))}

      </Grid>

      {/* LIVE */}

      <Box id="live">
        <Typography variant="h5" mb={2}>
          Live Exams
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>

        {liveExams.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="text.secondary">
              No Live Exams
            </Typography>
          </Grid>
        ) : liveExams.map(exam=>(
          <Grid item xs={12} md={6} lg={4} key={exam._id}>
            <ExamCard
              exam={exam}
              role={role}
              navigate={navigate}
            />
          </Grid>
        ))}

      </Grid>

      {/* HISTORY */}

      <Box id="history">
        <Typography variant="h5" mb={2}>
          Exam History
        </Typography>
      </Box>

      <Grid container spacing={3}>

        {historyExams.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="text.secondary">
              No Exam History
            </Typography>
          </Grid>
        ) : historyExams.map(exam=>(
          <Grid item xs={12} md={6} lg={4} key={exam._id}>
            <ExamCard
              exam={exam}
              role={role}
              navigate={navigate}
            />
          </Grid>
        ))}

      </Grid>

    </Container>

  );

}






// import { useEffect, useState } from "react";
// import {
// Container,
// Typography,
// Button,
// Card,
// CardContent,
// CardActions,
// Grid,
// Chip,
// Stack,
// CircularProgress,
// Box,
// Divider,
// } from "@mui/material";

// import {
// Add as AddIcon,
// PlayArrow as StartIcon,
// Delete as DeleteIcon,
// } from "@mui/icons-material";

// import { useNavigate } from "react-router-dom";
// import api from "../api/axios";
// import { useAuth } from "../contexts/AuthContext";
// import { useSearchParams } from "react-router-dom";

// const formatDateTime = (value) => {
// if (!value) return "Not Scheduled";
// const d = new Date(value);
// if (isNaN(d.getTime())) return "Not Scheduled";
// return d.toLocaleString("en-IN");
// };

// const cardHoverStyle = {
// height: "100%",
// transition: "all 0.3s ease",
// "&:hover": {
// transform: "translateY(-6px)",
// boxShadow: "0 0 18px rgba(25,118,210,0.45)",
// },
// };

// export default function Dashboard(){

// // ✅ FIX: get loading from AuthContext
// const { user, loading: authLoading } = useAuth();

// const role = user?.role;
// const navigate = useNavigate();
// const [searchParams] = useSearchParams();

// const filter = searchParams.get("filter");
// const view = searchParams.get("view");

// const [exams,setExams] = useState([]);
// const [loading,setLoading] = useState(true);
// const [messageCount,setMessageCount] = useState(0);

// /* =========================
// WAIT FOR AUTH USER
// ========================= */

// if(authLoading){
// return(
// <Container sx={{py:6,textAlign:"center"}}>
// <CircularProgress/>
// </Container>
// );
// }

// /* =========================
// FETCH EXAMS
// ========================= */

// const fetchExams = async () => {

// try{
// const res = await api.get("/exam");
// setExams(res.data);
// }catch(err){
// console.error(err);
// }finally{
// setLoading(false);
// }

// };

// /* =========================
// FETCH CONTACT MESSAGES
// ========================= */

// const fetchMessageCount = async () => {

// try{
// const res = await api.get("/messages");
// setMessageCount(res.data.length);
// }catch(err){
// console.error(err);
// }

// };

// useEffect(()=>{

// fetchExams();

// if(role === "admin" || role === "teacher"){
// fetchMessageCount();
// }

// const interval = setInterval(()=>{

// fetchExams();

// if(role === "admin" || role === "teacher"){
// fetchMessageCount();
// }

// },30000);

// return ()=> clearInterval(interval);

// },[role]);

// /* =========================
// DELETE EXAM
// ========================= */

// const deleteExam = async (examId) => {

// if(!window.confirm("Are you sure you want to delete this exam?")) return;

// try{
// await api.delete(`/exam/${examId}`);
// fetchExams();
// }catch{
// alert("Delete failed");
// }

// };

// if(loading){
// return(
// <Container sx={{py:6,textAlign:"center"}}>
// <CircularProgress/>
// </Container>
// );
// }

// /* =========================
// FILTER LOGIC
// ========================= */

// let filteredExams = exams;

// if(filter){

// switch(filter){

// case "ACTIVE":
// filteredExams = exams.filter(e =>
// e.status === "LIVE" ||
// e.status === "UPCOMING" ||
// e.examType === "PRACTICE"
// );
// break;

// case "UPCOMING":
// filteredExams = exams.filter(e => e.status === "UPCOMING");
// break;

// case "LIVE":
// filteredExams = exams.filter(e => e.status === "LIVE");
// break;

// case "HISTORY":
// filteredExams = exams.filter(e =>
// e.hasAttempted || e.status === "ENDED"
// );
// break;

// default:
// filteredExams = exams;

// }

// }

// const activeExams = exams.filter(e =>
// e.status === "LIVE" ||
// e.status === "UPCOMING" ||
// e.examType === "PRACTICE"
// );

// const historyExams = exams.filter(e =>
// e.hasAttempted || e.status === "ENDED"
// );

// const endedExams = [...historyExams].sort((a,b)=>{
// return (b.hasAttempted === true) - (a.hasAttempted === true);
// });

// /* =========================
// HISTORY PAGE
// ========================= */

// if(view === "history"){

// return(

// <Container maxWidth="lg" sx={{py:4}}>

// <Typography variant="h4" mb={4} fontWeight="bold">
// Exam History
// </Typography>

// {historyExams.length === 0 ? (

// <Card sx={{p:4,textAlign:"center"}}>
// <Typography color="text.secondary">
// No exam history yet
// </Typography>
// </Card>

// ) : (

// <Grid container spacing={3}>

// {historyExams.map((exam)=>(

// <Grid item xs={12} md={6} lg={4} key={exam._id}>

// <Card sx={cardHoverStyle}>

// <CardContent>

// <Stack direction="row" justifyContent="space-between">

// <Typography variant="h6">
// {exam.title}
// </Typography>

// <Chip label={exam.status} size="small"/>

// </Stack>

// <Typography color="text.secondary" mt={1}>
// {exam.description}
// </Typography>

// <Typography variant="body2" mt={2}>
// <strong>Date:</strong> {formatDateTime(exam.startTime)}
// </Typography>

// </CardContent>

// <CardActions sx={{p:2,pt:0}}>

// <Button
// fullWidth
// variant="outlined"
// onClick={()=>{

// if(user?.role === "student"){
// navigate(`/exam/result/${exam._id}`);
// }else{
// navigate(`/exam/results/${exam._id}`);
// }

// }}
// >

// View Results

// </Button>

// </CardActions>

// </Card>

// </Grid>

// ))}

// </Grid>

// )}

// <Box sx={{textAlign:"center",mt:4}}>

// <Button
// variant="contained"
// onClick={()=>navigate("/")}>
// Back to Dashboard
// </Button>

// </Box>

// </Container>

// );

// }

// /* =========================
// MAIN DASHBOARD
// ========================= */

// return(

// <Container maxWidth="lg" sx={{py:4}}>

// {(role === "teacher" || role === "admin") && (

// <Stack direction="row" spacing={2} mb={3}>

// <Button
// variant="contained"
// startIcon={<AddIcon/>}
// onClick={()=>navigate("/create-exam")}
// >

// Create Exam

// </Button>

// <Button
// variant="outlined"
// onClick={()=>navigate("/add-question")}
// >

// Question Bank

// </Button>

// </Stack>

// )}

// {/* STUDENT DASHBOARD */}

// {role === "student" && (

// <>

// <Typography variant="h5" mb={2}>
// Active & Upcoming Exams
// </Typography>

// <Grid container spacing={3} mb={4}>

// {activeExams.map((exam)=>(

// <Grid item xs={12} md={6} lg={4} key={exam._id}>

// <ExamCard
// exam={exam}
// user={user}
// role={role}
// navigate={navigate}
// />

// </Grid>

// ))}

// </Grid>

// <Box mb={4}>

// <Typography variant="h5" mb={2}>
// Exam History
// </Typography>

// <Card sx={cardHoverStyle}>

// <CardContent>

// {historyExams.length === 0 ? (

// <Typography color="text.secondary">
// No exam history yet
// </Typography>

// ) : (

// historyExams.slice(0,2).map((exam)=>(

// <Box key={exam._id} mb={2}>

// <Stack
// direction="row"
// justifyContent="space-between"
// alignItems="center"
// >

// <Box>

// <Typography fontWeight={600}>
// {exam.title}
// </Typography>

// <Typography variant="body2" color="text.secondary">
// {formatDateTime(exam.startTime)}
// </Typography>

// </Box>

// <Chip label={exam.status} size="small"/>

// </Stack>

// <Divider sx={{mt:1.5}}/>

// </Box>

// ))

// )}

// </CardContent>

// </Card>

// </Box>

// <Typography variant="h5" mb={2}>
// Ended / Attempted Exams
// </Typography>

// </>

// )}

// <Grid container spacing={3}>

// {(filter ? filteredExams : (role === "student" ? endedExams : exams)).map((exam)=>(

// <Grid item xs={12} md={6} lg={4} key={exam._id}>

// <ExamCard
// exam={exam}
// user={user}
// role={role}
// navigate={navigate}
// deleteExam={deleteExam}
// />

// </Grid>

// ))}

// </Grid>

// </Container>

// );

// }

// /* =========================
// EXAM CARD
// ========================= */

// function ExamCard({exam,user,role,navigate,deleteExam}){

// return(

// <Card sx={cardHoverStyle}>

// <CardContent>

// <Stack direction="row" justifyContent="space-between">

// <Typography variant="h6">
// {exam.title}
// </Typography>

// <Chip
// label={exam.examType}
// size="small"
// variant="outlined"
// />

// </Stack>

// {exam.hasAttempted && role === "student" && (

// <Chip
// label="ATTEMPTED"
// size="small"
// color="success"
// sx={{mt:1}}
// />

// )}

// <Typography color="text.secondary" mt={1}>
// {exam.description}
// </Typography>

// <Typography variant="body2" mt={1}>
// {exam.examType === "PRACTICE"
// ? "Practice Exam (Anytime)"
// : `Starts at: ${formatDateTime(exam.startTime)}`}
// </Typography>

// </CardContent>

// <CardActions sx={{p:2,pt:0}}>

// {role === "student" && (

// <Button
// fullWidth
// variant="contained"
// startIcon={<StartIcon/>}
// onClick={()=>navigate(`/exam/${exam._id}`)}
// >

// Start Exam

// </Button>

// )}

// {(role === "teacher" || role === "admin") && (

// <Stack spacing={1} width="100%">

// <Button
// variant="contained"
// onClick={()=>navigate(`/exam/edit/${exam._id}`)}
// >
// Edit Exam
// </Button>

// {role === "admin" && (

// <Button
// variant="outlined"
// color="error"
// startIcon={<DeleteIcon/>}
// onClick={()=>deleteExam(exam._id)}
// >
// Delete Exam
// </Button>

// )}

// </Stack>

// )}

// </CardActions>

// </Card>

// );

// }