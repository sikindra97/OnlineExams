import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { CircularProgress, Box } from "@mui/material";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // wait until auth finishes loading
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh"
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // role restriction
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;