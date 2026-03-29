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
  Chip,
  Stack,
  Button,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function TeacherLiveResults() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = () => {
      api
        .get(`/exam/results/live/${examId}`)
        .then((res) => {
          if (res.data?.success) {
            setResults(res.data.data || []);
            setError("");
          } else {
            setResults([]);
            setError(res.data?.message || "Failed to load results");
          }
        })
        .catch((err) => {
          console.error(err);
          setError(err.response?.data?.message || "Server error");
          setResults([]);
        })
        .finally(() => setLoading(false));
    };

    fetchResults();
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, [examId]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <Container sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography mt={2}>Loading live results...</Typography>
      </Container>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <Container sx={{ py: 6, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate("/")}>
          Back
        </Button>
      </Container>
    );
  }

  /* ================= NO SUBMISSION ================= */
  if (!results.length) {
    return (
      <Container sx={{ py: 6, textAlign: "center" }}>
        <Typography variant="h6">
          No student has submitted yet.
        </Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/")}>
          Back
        </Button>
      </Container>
    );
  }

  /* ================= TABLE ================= */
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h4">
          Live Exam Results ({results.length})
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/")}>
          Back
        </Button>
      </Stack>

      <Paper sx={{ overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ bgcolor: "primary.main" }}>
            <TableRow>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Rank
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Student
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Email
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Score
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Percentage
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Status
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {results.map((r) => (
              <TableRow key={r._id} hover>
                <TableCell>
                  <Chip label={`#${r.rank}`} color="primary" size="small" />
                </TableCell>
                <TableCell>{r.student?.name || "Unknown"}</TableCell>
                <TableCell>{r.student?.email || "N/A"}</TableCell>
                <TableCell>
                  {r.score}/{r.total}
                </TableCell>
                <TableCell>{r.percentage}%</TableCell>
                <TableCell>
                  <Chip
                    label={r.status}
                    color={r.status === "PASS" ? "success" : "error"}
                    size="small"
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
