import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Stack,
  Chip,
} from "@mui/material";

/* =========================
   Safe Date Formatter
========================= */
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function MyResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/exam/results/me")
      .then(res => setResults(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (results.length === 0) {
    return (
      <Typography align="center" mt={6}>
        No exam history found
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={3}>
        My Exam History
      </Typography>

      <Stack spacing={2}>
        {results.map((r) => (
          <Paper key={r._id} sx={{ p: 3 }}>
            {/* ===== Exam Name ===== */}
            <Typography variant="h6">
              {r.exam?.title || "Unknown Exam"}
            </Typography>

            {/* ===== Exam Type ===== */}
            <Typography variant="body2" color="text.secondary">
              {r.exam?.examType === "PRACTICE"
                ? "Practice Exam"
                : "Timed Exam"}
            </Typography>

            {/* ===== Date ===== */}
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Attempted on: {formatDate(r.submittedAt || r.createdAt)}
            </Typography>

            {/* ===== Score ===== */}
            <Typography mt={1}>
              Score: {r.score}/{r.total} ({r.percentage}%)
            </Typography>

            {/* ===== Status ===== */}
            <Chip
              label={r.status}
              color={
                r.status === "PASS"
                  ? "success"
                  : r.status === "PRACTICE"
                  ? "info"
                  : "error"
              }
              sx={{ mt: 1 }}
            />
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
