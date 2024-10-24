const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./configs/db.js");
const authRouter = require("./middleware/auth.js");
const userRouters = require("./routes/user");
const teamRouter = require("./routes/team");
dotenv.config();

// Kết nối với MongoDB
connectDB();

const app = express();
app.use(express.json()); //

app.use("/api/user", userRouters);

app.get("/", (req, res) => {
  res.send("IUH TSE Club API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
