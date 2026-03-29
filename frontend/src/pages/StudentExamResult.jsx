import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import {
  Container,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Box,
  Chip,
  Card,
  CardContent,
  Stack,
  Alert,
  Divider,
} from "@mui/material";
import { ArrowBack as BackIcon } from "@mui/icons-material";

export default function StudentExamResult() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =========================
     FETCH RESULT
  ========================= */
  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);

        /* =========================
           1️⃣ PRACTICE RESULT (localStorage)
        ========================= */
        const practiceKey = `practice_result_${examId}`;
        const practiceResult = localStorage.getItem(practiceKey);

        if (practiceResult) {
          const parsed = JSON.parse(practiceResult);
          setResult({ ...parsed, practice: true });
          setLoading(false);
          return;
        }

        /* =========================
           2️⃣ RESULT FROM NAVIGATION STATE
        ========================= */
      if (state) {
  setResult(state); // temporary result
}

/* fetch latest result for updated rank */

        /* =========================
           3️⃣ LIVE / TIMED RESULT (DB)
        ========================= */
        const res = await api.get(`/exam/result/me/${examId}`);

        if (res.data?.success === false) {
          setError(res.data.message || "Result not found");
          setResult(null);
        } else if (res.data?.data) {
          setResult(res.data.data);
          setError(null);
        } else {
          setError("Unexpected response from server");
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError("You haven't attempted this exam yet.");
        } else if (err.response?.status === 403) {
          setError("Access denied. Please login again.");
        } else {
          setError("Failed to load result. Try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [examId, state]);

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography mt={2}>Loading your result...</Typography>
      </Container>
    );
  }

  /* =========================
     ERROR
  ========================= */
  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate("/")} variant="contained">
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  /* =========================
     RESULT VIEW
  ========================= */
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate(-1)}
        variant="outlined"
        size="small"
        sx={{ mb: 3 }}
      >
        BACK
      </Button>

      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h4" fontWeight="bold" mb={3}>
          {result.exam?.title || "Exam Result"}
        </Typography>

        <Typography variant="h2" color="primary">
          {result.percentage}%
        </Typography>

        <Chip
          label={result.status}
          color={result.status === "PASS" ? "success" : "error"}
          sx={{ mt: 2, mb: 3 }}
        />

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography>Score</Typography>
                <Typography fontWeight="bold">
                  {result.score}/{result.total}
                </Typography>
              </Box>

              <Divider />

              <Box display="flex" justifyContent="space-between">
                <Typography>Attempted On</Typography>
                <Typography>
                  {new Date(
                    result.submittedAt || result.attemptedAt || Date.now()
                  ).toLocaleString()}
                </Typography>
              </Box>

              {result.rank && (
                <>
                  <Divider />
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Rank</Typography>
                    <Chip label={`#${result.rank}`} color="primary" />
                  </Box>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>

        {result.practice && (
          <Alert severity="info" sx={{ mt: 3 }}>
            Practice Exam – Result not saved in database
          </Alert>
        )}
        <Button
          variant="contained"
          sx={{ mt: 4 }}
          onClick={() => navigate("/")}
        >
          Back to Dashboard
        </Button>
      </Paper>
    </Container>
  );
}
