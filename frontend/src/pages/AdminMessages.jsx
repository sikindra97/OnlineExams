import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import api from "../api/axios";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/messages")
      .then((res) => setMessages(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth={900} mx="auto" mt={4}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Student Issues / Messages
      </Typography>

      {messages.length === 0 && (
        <Typography>No messages yet.</Typography>
      )}

      <Stack spacing={2}>
        {messages.map((msg) => (
          <Paper key={msg._id} sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight="bold">
                  {msg.sender.name} ({msg.sender.role})
                </Typography>

                <Chip
                  label={msg.seen ? "Seen" : "New"}
                  color={msg.seen ? "default" : "error"}
                  size="small"
                />
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {msg.sender.email}
              </Typography>

              <Divider />

              <Typography>{msg.message}</Typography>

              <Typography variant="caption" color="text.secondary">
                {new Date(msg.createdAt).toLocaleString()}
              </Typography>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
