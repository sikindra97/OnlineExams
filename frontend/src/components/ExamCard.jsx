import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Stack
} from "@mui/material";

import { PlayArrow } from "@mui/icons-material";
import api from "../api/axios";

const formatDateTime = (value) => {
  if (!value) return "Not Scheduled";
  const d = new Date(value);
  return d.toLocaleString("en-IN");
};

export default function ExamCard({ exam, role, navigate }) {

  const deleteExam = async(id)=>{

    if(!window.confirm("Delete this exam?")) return;

    try{

      await api.delete(`/exam/${id}`);

      window.location.reload();

    }
    catch(err){
      console.error(err);
    }

  }

  return (

    <Card
      sx={{
        height: "100%",
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 0 18px rgba(25,118,210,0.45)"
        }
      }}
    >

      <CardContent>

        <Stack direction="row" justifyContent="space-between">

          <Typography variant="h6">
            {exam.title}
          </Typography>

          <Chip
            label={exam.examType}
            size="small"
          />

        </Stack>

        <Typography mt={1} color="text.secondary">
          {exam.description}
        </Typography>

        <Typography variant="body2" mt={1}>
          Starts at: {formatDateTime(exam.startTime)}
        </Typography>

    

       {/* Already Attempted */}

{role === "student" && exam.hasAttempted && exam.examType !== "PRACTICE" && (

  <Chip
    label="Already Attempted"
    color="success"
    size="small"
    sx={{mt:1}}
  />

)}

      </CardContent>

      <CardActions sx={{flexDirection:"column",gap:1}}>

        {/* STUDENT START EXAM */}

       {role === "student" &&
(
  (exam.status === "LIVE" && !exam.hasAttempted) ||
  exam.examType === "PRACTICE"
) && (

<Button
fullWidth
variant="contained"
startIcon={<PlayArrow />}
onClick={()=>navigate(`/exam/${exam._id}`)}
>
{exam.examType === "PRACTICE" ? "Start Practice" : "Start Exam"}
</Button>

)}

        {/* STUDENT VIEW RESULT */}

        {role === "student" &&
        exam.hasAttempted && (

        <Button
        fullWidth
        variant="outlined"
        onClick={()=>navigate(`/exam/result/${exam._id}`)}
        >
        View Result
        </Button>

        )}

        {/* LIVE RESULT (Teacher/Admin) */}

        {(role==="teacher" || role==="admin") &&
        exam.status === "LIVE" && (

        <Button
        fullWidth
        variant="contained"
        onClick={()=>navigate(`/exam/results/live/${exam._id}`)}
        >
        View Live Results
        </Button>

        )}

        {/* FINAL RESULT */}

        {(role==="teacher" || role==="admin") &&
        exam.status === "ENDED" && (

        <Button
        fullWidth
        variant="contained"
        onClick={()=>navigate(`/exam/results/${exam._id}`)}
        >
        View Results
        </Button>

        )}

        {/* EDIT EXAM */}

        {(role==="teacher" || role==="admin") && (

        <Button
        fullWidth
        variant="outlined"
        onClick={()=>navigate(`/exam/edit/${exam._id}`)}
        >
        Edit Exam
        </Button>

        )}

        {/* DELETE EXAM (Admin only) */}
{role?.toLowerCase()==="admin" && (

<Button
fullWidth
color="error"
variant="outlined"
onClick={()=>deleteExam(exam._id)}
>
Delete Exam
</Button>

)}

      </CardActions>

    </Card>

  );

}