import { useState } from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  MenuItem,
  Select,
  IconButton,
  InputAdornment,
  CircularProgress
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/TESTCRAFT.jpeg";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading,setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
   await api.post("/auth/register", {
  name,
  email,
  password,
  role,
});

navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally{
      setLoading(false);
    }
  };
  return (
    <Box sx={cardStyle}>
      <Box textAlign="center" mb={2}>
        <Box
  sx={{
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
    borderRadius: "30%",
    background: "rgba(255,255,255,0.08)",
    boxShadow: "0 0 18px rgba(144,202,249,0.35)",
    mb: 1,
  }}
>
  <Box
    component="img"
    src={logo}
    alt="TestCraft Logo"
    sx={{
      width: 56,
      height: 56,
      borderRadius: "30%",
      backgroundColor: "#fff",
      padding: "4px",
    }}
  />
</Box>

        <Typography variant="h5" fontWeight="bold" mt={1}>
          TestCraft
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Online Examination System
        </Typography>
      </Box>

      {error && (
        <Typography color="error" textAlign="center">
          {error}
        </Typography>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          fullWidth
          margin="normal"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextField
          label="Email"
          fullWidth
          margin="normal"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          margin="normal"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Select
          fullWidth
          value={role}
          sx={{ mt: 2 }}
          onChange={(e) => setRole(e.target.value)}
        >
          <MenuItem value="student">Student</MenuItem>
          <MenuItem value="teacher">Teacher</MenuItem>
        </Select>

        <Button type="submit" variant="contained" fullWidth sx={{ mt: 3, py: 1.2 }} disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit"/> : "Register"}
        </Button>
      </form>

      <Typography mt={2} textAlign="center">
        Already have an account? <Link to="/login">Login</Link>
      </Typography>
    </Box>
  );
}

export default Register;
const cardStyle = {
  maxWidth: 420,
  mx: "auto",
  mt: 8,
  p: 4,
  borderRadius: 3,
  bgcolor: "background.paper",
  color: "text.primary",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
  transition: "all 0.35s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 12px 40px rgba(33,150,243,0.35)",
    borderColor: "primary.main",
  },
};
