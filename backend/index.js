import "./config/env.js";
import express from "express";
import client from "./config/redis.js";
import leaderboardRoutes from "./routes/leaderboard.js";
const app = express();
app.use(express.json());

app.use("/leaderboard", leaderboardRoutes);

app.get("/health", async (req, res) => {
  const reply = await client.ping();
  res.json({
    message: reply,
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("server start at port: 3000");
});
