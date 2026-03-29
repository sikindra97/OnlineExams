import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  IconButton,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/users")
      .then(res => setUsers(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/auth/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" mb={3}>
        Manage Users
      </Typography>

      <Paper>
        {loading ? (
          <CircularProgress sx={{ m: 3 }} />
        ) : (
          <List>
            {users.map(u => (
              <div key={u._id}>
                <ListItem
                  secondaryAction={
                    user.role === "admin" && user._id !== u._id && (
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleDelete(u._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )
                  }
                >
                  <ListItemText
                    primary={u.name}
                    secondary={`${u.email} — ${u.role}`}
                  />
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
}
