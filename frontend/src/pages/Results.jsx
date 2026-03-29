import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Button,
  Box,
  Chip,
  Stack,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";

export default function Results() {
  const { id } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const practiceResult = id
    ? JSON.parse(localStorage.getItem(`practice_result_${id}`))
    : null;

  const [results, setResults] = useState([]);
  const [examTitle, setExamTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= TEACHER / ADMIN ================= */
  useEffect(() => {
    if (id && (user?.role === "teacher" || user?.role === "admin")) {
      api
        .get(`/exam/results/${id}`)
        .then(res => {
          if (res.data?.success) {
            setResults(res.data.data.results || []);
            setExamTitle(res.data.data.examTitle || "Exam Results");
          } else {
            setError("Failed to load results");
          }
        })
        .catch(err =>
          setError(err.response?.data?.message || "Failed to load results")
        )
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, user]);

  /* ================= STUDENT RESULT ================= */
  if ((state || practiceResult) && user?.role === "student") {
    const data = state || practiceResult;

    return (
      <Container sx={{ py: 6 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h4">{data.examTitle}</Typography>

          <Typography variant="h2" color="primary" mt={2}>
            {data.percentage}%
          </Typography>

          <Chip
            label={data.status}
            color={data.status === "PASS" ? "success" : "error"}
            sx={{ mt: 2 }}
          />

          <Typography mt={2}>
            Score: {data.score}/{data.total}
          </Typography>

          {data.practice && (
            <Alert severity="info" sx={{ mt: 3 }}>
              Practice Exam – Result not saved in database
            </Alert>
          )}

          <Button sx={{ mt: 4 }} variant="contained" onClick={() => navigate("/")}>
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography mt={2}>Loading results...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 6, textAlign: "center" }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/")}>
          Back
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" mb={3}>
        {examTitle}
      </Typography>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Percentage</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map(r => (
              <TableRow key={r._id}>
                <TableCell>#{r.rank}</TableCell>
                <TableCell>{r.student?.name}</TableCell>
                <TableCell>{r.score}/{r.total}</TableCell>
                <TableCell>{r.percentage}%</TableCell>
                <TableCell>
                  <Chip
                    label={r.status}
                    color={r.status === "PASS" ? "success" : "error"}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
