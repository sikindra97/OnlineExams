import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // ✅ tumhara axios instance
import { useAuth } from "../contexts/AuthContext";

export default function Contact() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!message.trim()) {
      setError("Please describe your issue.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/messages", {
        message,
      });

      setSuccess("Your message has been sent to Admin / Teacher.");
      setMessage("");

      // optional: auto redirect
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Paper sx={{ maxWidth: 500, width: "100%", p: 4 }} elevation={3}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight="bold" textAlign="center">
            Contact Admin / Teacher
          </Typography>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Facing any issue with exams, results, or access?
            <br />
            Send us a message and we’ll review it.
          </Typography>

          {success && <Alert severity="success">{success}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          {/* USER INFO (READ ONLY) */}
          <TextField
            label="Name"
            value={user?.name || ""}
            disabled
            fullWidth
          />

          <TextField
            label="Email"
            value={user?.email || ""}
            disabled
            fullWidth
          />

          {/* MESSAGE */}
          <TextField
            label="Describe your issue"
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            required
          />

          {/* SUBMIT */}
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            fullWidth
          >
            {loading ? "Sending..." : "Send Message"}
          </Button>

          <Button
            variant="text"
            onClick={() => navigate("/")}
            fullWidth
          >
            Back to Dashboard
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
