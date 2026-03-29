import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress
} from "@mui/material";

import api from "../api/axios";

function PendingTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeachers = async () => {
    try {
      const res = await api.get("/auth/pending-teachers");

      console.log("API RESPONSE:", res.data);   // debug

      if (res.data && res.data.teachers) {
        setTeachers(res.data.teachers);
      } else {
        setTeachers([]);
      }

    } catch (err) {
      console.error("Fetch teachers error:", err);
      setTeachers([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const approveTeacher = async (id) => {
    try {
      await api.put(`/auth/approve-teacher/${id}`);
      fetchTeachers();
    } catch (err) {
      console.error(err);
    }
  };

  const rejectTeacher = async (id) => {
    try {
      await api.put(`/auth/reject-teacher/${id}`);
      fetchTeachers();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        Pending Teacher Approvals
      </Typography>

      {teachers.length === 0 ? (
        <Typography>No pending teachers</Typography>
      ) : (
        <Grid container spacing={3}>
          {teachers.map((teacher) => (
            <Grid item xs={12} md={6} key={teacher._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{teacher.name}</Typography>

                  <Typography color="text.secondary">
                    {teacher.email}
                  </Typography>

                  <Box mt={2} display="flex" gap={2}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => approveTeacher(teacher._id)}
                    >
                      Approve
                    </Button>

                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => rejectTeacher(teacher._id)}
                    >
                      Reject
                    </Button>
                  </Box>

                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default PendingTeachers;
