const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./configs/db.js");
const authRouters = require("./routes/authRouter.js");
const userRouters = require("./routes/userRouter.js");
const teamRouters = require("./routes/teamRouter.js");
const teamMemberRouters = require("./routes/teamMemberRouter.js");
const competitionRoutes = require("./routes/competitionRouter.js");
const eventRoutes = require("./routes/eventRoutes.js");
const equipmentRoutes = require("./routes/equipmentRoutes.js");
dotenv.config();

// Kết nối với MongoDB
connectDB();

const app = express();
app.use(express.json()); //

app.use("/api/user", userRouters);
app.use("/api/team", teamRouters);
app.use("/api/team-member", teamMemberRouters);
app.use("/api/competitions", competitionRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/equipment", equipmentRoutes);

app.get("/", (req, res) => {
  res.send("IUH TSE Club API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
