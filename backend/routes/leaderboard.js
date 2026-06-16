import { Router } from "express";
import client from "../config/redis.js";

const router = Router();

// endpoint for setting up and updating the score.
router.post("/score", async (req, res) => {
  const { userId, score } = req.body;

  // validation
  if (!userId || score === undefined) {
    return res.status(400).json({ error: "userId and score are required" });
  }

  //converted score into number
  const points = Number(score);

  if (isNaN(points)) {
    return res.status(400).json({ error: "score must be a number" });
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

// endpoint for getting the leaderboard value.
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

// get the rank of the user by it userId
router.get("/:userId/rank", async (req, res) => {
  const { userId } = req.params;

  try {
    //It will return the rank with highest score.
    const rank = await client.zrevrank("leaderboard", userId);

    // Here we use the `null` bcs according to redis behavior either it return value or 'null'
    if (rank == null) {
      return res
        .status(404)
        .json({ error: `User ${userId} not found in the leaderboard` });
    }

    // zcore for finding the score of user
    const score = await client.zscore("leaderboard", userId);
    res.json({
      userId,
      rank: rank + 1, // 0-based indexing
      score: parseFloat(score),
    });
  } catch (err) {
    console.error("ZREVRANK error: ", err);
    res.status(500).json({ error: "failed to fetch rank" });
  }
});

export default router;
