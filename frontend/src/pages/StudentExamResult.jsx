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

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);

        const practiceKey = `practice_result_${examId}`;
        const practiceResult = localStorage.getItem(practiceKey);

        if (practiceResult) {
          const parsed = JSON.parse(practiceResult);
          setResult({ ...parsed, practice: true });
          setLoading(false);
          return;
        }

        if (state) {
          setResult(state);
        }

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
        setError("Failed to load result. Try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [examId, state]);

  const percentage = result?.total
    ? Math.round((result.score / result.total) * 100)
    : 0;

  if (loading) {
    return (
      <Container sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress size={50} />
        <Typography mt={2}>Loading your result...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/")}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate(-1)}
        variant="outlined"
        size="small"
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 4,
          textAlign: "center",
        }}
      >
        {/* Title */}
        <Typography variant="h5" fontWeight="bold" mb={3}>
          {result.exam?.title || "Exam Result"}
        </Typography>

        {/* Circular Percentage */}
        <Box
          sx={{
            position: "relative",
            display: "inline-flex",
            mb: 3,
          }}
        >
          <CircularProgress
            variant="determinate"
            value={percentage}
            size={140}
            thickness={5}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h4" fontWeight="bold">
              {percentage}%
            </Typography>
          </Box>
        </Box>

        {/* Status */}
        {/* Status */}
<Chip
  label={result.status}
  color={
    result.practice
      ? "default"
      : result.status === "PASS"
      ? "success"
      : "error"
  }
  sx={{ mb: 3, fontWeight: "bold" }}
/>

        {/* Details Card */}
        <Card
          variant="outlined"
          sx={{ borderRadius: 3, textAlign: "left" }}
        >
          <CardContent>
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Score</Typography>
                <Typography fontWeight="bold">
                  {result.score}/{result.total}
                </Typography>
              </Box>

              <Divider />

              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Attempted On</Typography>
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
                    <Typography color="text.secondary">Rank</Typography>
                    <Chip label={`#${result.rank}`} color="primary" />
                  </Box>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Practice Info */}
        {result.practice && (
          <Alert severity="info" sx={{ mt: 3 }}>
            Practice Exam – Result not saved in database
          </Alert>
        )}

        {/* Button */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 4, borderRadius: 3 }}
          onClick={() => navigate("/")}
        >
          Back to Dashboard
        </Button>
      </Paper>
    </Container>
  );
}
