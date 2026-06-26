const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

//middleware

app.use(cors());
app.use(express.json());

//routes

app.use("/api/auth", require("./routes/auth"));
app.use("/api/exam", require("./routes/exam"));
app.use("/api", require("./routes/result"));
app.use("/api/messages", require("./routes/message"));
app.use("/api/questions", require("./routes/question"));
app.use("/api/subject", require("./routes/subject"));

//database 

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

 // health check 
    app.get("/", (req, res) => {
      res.send("Backend running ");
    });

// server
     const PORT = process.env.PORT || 10000;

    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(" MongoDB connection failed:", err.message);
  });
