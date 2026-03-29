import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Box,
  Typography,
  Paper,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ExamList() {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api.get("/exam").then((res) => setExams(res.data));
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">All Exams</Typography>

      {exams.map((exam) => (
        <Paper key={exam._id} sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6">{exam.title}</Typography>
          <Typography color="text.secondary">
            {exam.description}
          </Typography>

          {user.role === "student" && (
            <Button
              sx={{ mt: 2 }}
              variant="contained"
              onClick={() => navigate(`/exam/${exam._id}`)}
            >
              Attempt Exam
            </Button>
          )}
        </Paper>
      ))}
    </Box>
  );
}

export default ExamList;
