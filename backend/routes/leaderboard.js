import { Router } from "express";
import client from "../config/redis";

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
