import { Router } from "express";
import client from "../config/redis.js";

const router = Router();

router.post("/score", async (req, res) => {
  const { userId, score } = req.body;

  // validation
  if (!userId || score === undefined) {
    res.status(400).json({ error: "userId and score are required" });
  }

  //converted score into number
  const points = Number(score);

  if (isNaN(points)) {
    res.status(400).json({ error: "score must be a number" });
  }

  try {
    const newScore = await client.zincrby("leaderboard", points, userId);

    res.json({
      userId,
      newScore: parseFloat(newScore), // Here data from redis string converted into float.
      message: `Added ${points} points to ${userId}`,
    });
  } catch (err) {
    console.error("ZINCRBY Error: ", err);
    res.status(500).json({ error: "Failed to update the score" });
  }
});

router.get("/", async (req, res) => {
  try {
    // zrange return the flat array (if we use "REV").
    // This will return array with having maximum score. As we see below comment
    const raw = await client.zrange("leaderboard", 0, 9, "REV", "WITHSCORES");
    /*

  const raw = [
  "subhash", "300",
  "alex", "250",
  "john", "200"
  ];

  */
    const leaderboard = []; //leaderboard array
    for (let i = 0; i < raw.length; i += 2) {
      leaderboard.push({
        rank: i / 2 + 1,
        userId: raw[i],
        score: parseFloat(raw[i + 1]),
      });
    }

    res.json({ leaderboard });
  } catch (err) {
    console.error("ZRANGE error:", err);
    res.status(500).json({ error: "Failed to fetch the leaderboard" });
  }
});

export default router;
