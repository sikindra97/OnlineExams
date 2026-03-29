import { useEffect, useState } from "react";
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
  IconButton,
  Card,
  CardContent,
  Divider,
  Alert,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function EditExam() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [error, setError] = useState("");

  /* ================= FETCH EXAM ================= */
  useEffect(() => {
    api
      .get(`/exam/edit/${id}`)
      .then(res => setExam(res.data))
      .catch(err =>
        setError(err.response?.data?.message || "Failed to load exam")
      )
      .finally(() => setLoading(false));
  }, [id]);

  /* ================= GUARDS ================= */
  if (loading) {
    return <Typography sx={{ p: 4 }}>Loading exam…</Typography>;
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate("/")}>
          Back
        </Button>
      </Box>
    );
  }

  if (!exam) {
    return (
      <Typography sx={{ p: 4 }} color="error">
        Exam not found
      </Typography>
    );
  }

  /* ================= SAVE ================= */
  const saveChanges = async () => {
    try {
      if (exam.examType === "TIMED") {
        if (!exam.startTime || !exam.endTime) {
          alert("Start & End time required");
          return;
        }
      }

      await api.put(`/exam/${id}`, exam);
      alert("Exam updated successfully");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save changes");
    }
  };

  /* ================= DELETE ================= */
  const deleteExam = async () => {
    if (!window.confirm("Delete this exam?")) return;

    try {
      await api.delete(`/exam/${id}`);
      alert("Exam deleted");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  /* ================= QUESTIONS ================= */
  const addQuestion = () => {
    setExam(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        { question: "", options: ["", "", "", ""], correctAnswer: 1 },
      ],
    }));
  };

  const updateQuestion = (qIndex, field, value) => {
    const updated = [...exam.questions];
    updated[qIndex][field] = value;
    setExam({ ...exam, questions: updated });
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...exam.questions];
    updated[qIndex].options[oIndex] = value;
    setExam({ ...exam, questions: updated });
  };

  const deleteQuestion = index => {
    if (exam.questions.length === 1) return;
    setExam({
      ...exam,
      questions: exam.questions.filter((_, i) => i !== index),
    });
  };

  /* ================= UI ================= */
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={3}>
        Edit Exam
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Stack spacing={2}>
          <TextField
            label="Exam Title"
            value={exam.title}
            onChange={e => setExam({ ...exam, title: e.target.value })}
          />

          <TextField
            label="Description"
            value={exam.description}
            onChange={e =>
              setExam({ ...exam, description: e.target.value })
            }
          />

          <FormControl>
            <InputLabel>Exam Type</InputLabel>
            <Select
              value={exam.examType}
              label="Exam Type"
              onChange={e =>
                setExam({ ...exam, examType: e.target.value })
              }
            >
              <MenuItem value="TIMED">Timed</MenuItem>
              <MenuItem value="PRACTICE">Practice</MenuItem>
            </Select>
          </FormControl>

          {exam.examType === "TIMED" && (
            <>
              <TextField
                type="datetime-local"
                label="Start Time"
                InputLabelProps={{ shrink: true }}
                value={formatDate(exam.startTime)}
                onChange={e =>
                  setExam({
                    ...exam,
                    startTime: new Date(e.target.value),
                  })
                }
              />

              <TextField
                type="datetime-local"
                label="End Time"
                InputLabelProps={{ shrink: true }}
                value={formatDate(exam.endTime)}
                onChange={e =>
                  setExam({
                    ...exam,
                    endTime: new Date(e.target.value),
                  })
                }
              />
            </>
          )}
        </Stack>
      </Paper>


      {exam.questions.map((q, qIndex) => (
        <Card key={qIndex} sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" mb={2}>
              <Typography>Question {qIndex + 1}</Typography>
              <IconButton
                color="error"
                onClick={() => deleteQuestion(qIndex)}
                disabled={exam.questions.length === 1}
              >
                <Delete />
              </IconButton>
            </Stack>

            <TextField
              fullWidth
              label="Question"
              value={q.question}
              onChange={e =>
                updateQuestion(qIndex, "question", e.target.value)
              }
              sx={{ mb: 2 }}
            />

            {q.options.map((opt, oIndex) => (
              <Stack key={oIndex} direction="row" spacing={2} mb={1}>
                <TextField
                  fullWidth
                  label={`Option ${oIndex + 1}`}
                  value={opt}
                  onChange={e =>
                    updateOption(qIndex, oIndex, e.target.value)
                  }
                />
                <Button
                  variant={
                    q.correctAnswer === oIndex + 1
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() =>
                    updateQuestion(qIndex, "correctAnswer", oIndex + 1)
                  }
                >
                  Correct
                </Button>
              </Stack>
            ))}
          </CardContent>
        </Card>
      ))}

  
      <Divider sx={{ my: 4 }} />

      <Stack direction="row" spacing={2}>
        <Button variant="contained" color="success" onClick={saveChanges}>
          Save Changes
        </Button>
      {exam?.createdByRole === "admin" && (
<Button variant="contained" color="error" onClick={deleteExam}>
  Delete Exam
</Button>
)}
      </Stack>
    </Box>
  );
}

/* ================= DATE FORMAT (FIXED) ================= */
function formatDate(date) {
  if (!date) return "";

  const d = new Date(date);
  const pad = n => String(n).padStart(2, "0");

  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes())
  );
}
