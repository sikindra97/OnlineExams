import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Stack,
  Avatar,
  Divider,
  Tooltip,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";
import EmailIcon from "@mui/icons-material/Email";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useThemeMode } from "../contexts/ThemeContext";

import logo from "../assets/TESTCRAFT.jpeg";

export default function Header() {

  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();

  const [open,setOpen] = useState(false);

  if(!user) return null;

  const handleLogout = ()=>{
    logout();
    navigate("/login");
  };

  /* NAVIGATION FUNCTION */

  const goTo = (path)=>{
    navigate(path);
    setOpen(false);
  };

  /* DRAWER MENU */

const menuItems = [

{label:"Dashboard",action:()=>goTo("/")},
{label:"Active Exams",action:()=>goTo("/active")},
{label:"Upcoming Exams",action:()=>goTo("/upcoming")},
{label:"Live Exams",action:()=>goTo("/live")},
{label:"Exam History",action:()=>goTo("/history")},
{label:"Contact Support",action:()=>navigate("/contact")},

(user.role==="admin" || user.role==="teacher") && {
label:"Student Messages",
action:()=>navigate("/admin/messages")
},

user.role==="admin" && {
label:"Manage Users",
action:()=>navigate("/admin/users")
},

user.role==="admin" && {
label:"Pending Teachers",
action:()=>navigate("/admin/pending-teachers")
},

{label:"Logout",action:handleLogout}

].filter(Boolean);

  return(

<>
<AppBar position="sticky">
<Toolbar sx={{justifyContent:"space-between"}}>

{/* LEFT */}

<Box display="flex" alignItems="center" gap={2}>

<IconButton
color="inherit"
sx={{display:{md:"none"}}}
onClick={()=>setOpen(true)}
>
<MenuIcon/>
</IconButton>

<Box
display="flex"
alignItems="center"
gap={1}
sx={{cursor:"pointer"}}
onClick={()=>goTo("/")}
>

<Avatar
src={logo}
alt="TestCraft"
sx={{width:40,height:40,bgcolor:"transparent"}}
/>

<Box sx={{display:{xs:"none",sm:"block"}}}>

<Typography variant="h6" fontWeight="bold">
TestCraft
</Typography>

<Typography
variant="caption"
sx={{opacity:0.8,fontSize:"0.72rem"}}
>
Online Examination System
</Typography>

</Box>

</Box>

</Box>

{/* CENTER MENU */}

<Stack
direction="row"
spacing={1}
sx={{display:{xs:"none",md:"flex"}}}
>

<Button color="inherit" onClick={()=>goTo("/")}>
Dashboard
</Button>

<Button color="inherit" onClick={()=>goTo("/active")}>
Active
</Button>

<Button color="inherit" onClick={()=>goTo("/upcoming")}>
Upcoming
</Button>

<Button color="inherit" onClick={()=>goTo("/live")}>
Live
</Button>

<Button color="inherit" onClick={()=>goTo("/history")}>
History
</Button>

{user.role==="admin" && (
<Button color="inherit" onClick={()=>goTo("/admin/pending-teachers")}>
Pending Teachers
</Button>
)}

</Stack>

{/* RIGHT */}

<Box display={{xs:"none",md:"flex"}} alignItems="center" gap={2}>

<Chip
label={user?.role?.toUpperCase()}
size="small"
sx={{
bgcolor:"#ffffff",
color:"#1976d2",
fontWeight:600,
borderRadius:2,
px:1.2,
height:32
}}
/>

<Button
variant="contained"
startIcon={<EmailIcon/>}
onClick={()=>navigate("/contact")}
sx={{
textTransform:"none",
fontWeight:600,
bgcolor:"#ffffff",
color:"#1976d2",
borderRadius:2,
boxShadow:"none",
"&:hover":{bgcolor:"#f0f4ff"}
}}
>
Contact Support
</Button>

<IconButton color="inherit" onClick={toggleTheme}>
{mode==="dark" ? <LightModeIcon/> : <DarkModeIcon/>}
</IconButton>

<Typography variant="body2">
{user.name}
</Typography>

<Button
variant="contained"
startIcon={<LogoutIcon/>}
onClick={handleLogout}
size="small"
sx={{
textTransform:"none",
fontWeight:600,
bgcolor:"#ffffff",
color:"#1976d2",
borderRadius:2,
boxShadow:"none",
"&:hover":{bgcolor:"#f0f4ff"}
}}
>
Logout
</Button>

</Box>

{/* MOBILE RIGHT */}

<Box display={{xs:"flex",md:"none"}} alignItems="center" gap={1}>

<Tooltip title="Contact Support">
<IconButton color="inherit" onClick={()=>navigate("/contact")}>
<EmailIcon/>
</IconButton>
</Tooltip>

<IconButton color="inherit" onClick={toggleTheme} size="small">
{mode==="dark" ? <LightModeIcon/> : <DarkModeIcon/>}
</IconButton>

<IconButton color="inherit" onClick={handleLogout} size="small">
<LogoutIcon/>
</IconButton>

</Box>

</Toolbar>
</AppBar>

{/* DRAWER */}

<Drawer
anchor="left"
open={open}
onClose={()=>setOpen(false)}
PaperProps={{sx:{width:260}}}
>

<Box sx={{p:2}}>

<List>

{menuItems.map((item,i)=>(
<ListItem
button
key={i}
onClick={item.action}
sx={{borderRadius:1}}
>
<ListItemText primary={item.label}/>
</ListItem>
))}

</List>

</Box>

</Drawer>

</>

);

}
