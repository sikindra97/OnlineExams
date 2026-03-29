import {
  Box,
  Typography,
  IconButton,
  Stack,
  Divider,
  Tooltip,
  Button,
} from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EmailIcon from "@mui/icons-material/Email";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        py: 3,
        textAlign: "center",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        backgroundColor: "background.paper",
      }}
    >
      <Stack spacing={2.5} alignItems="center">
        {/* COPYRIGHT */}
        <Typography variant="body2" fontWeight={500}>
          © {new Date().getFullYear()} TestCraft — Online Examination System
        </Typography>

        <Divider sx={{ width: 300 }} />

        {/* PRIMARY ACTION */}
        <Button
          variant="contained"
          startIcon={<EmailIcon />}
          onClick={() => navigate("/contact")}
          sx={{
            textTransform: "none",
            fontWeight: "bold",
            px: 3,
          }}
        >
          Contact Support
        </Button>

        {/* SECONDARY ICONS */}
        <Stack direction="row" spacing={2}>
          <Tooltip title="Developer LinkedIn Profile">
            <IconButton
              component="a"
              href="https://www.linkedin.com/in/YOUR_LINKEDIN_ID"
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
            >
              <LinkedInIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* SUPPORT TEXT */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ maxWidth: 500, lineHeight: 1.6 }}
        >
          Need help with exams, results, login, or access?
          <br />
          Click <strong>Contact Support</strong> to send a message directly to the
          Admin or Teacher. Your issue will be reviewed shortly.
        </Typography>
      </Stack>
    </Box>
  );
}
