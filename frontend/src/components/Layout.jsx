import Header from "./Header";
import Footer from "./Footer";
import { Box } from "@mui/material";

export default function Layout({ children }) {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Header />
      <Box flex={1}>{children}</Box>
      <Footer />
    </Box>
  );
}
