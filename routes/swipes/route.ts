import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import type { User } from "../../models/User.js";
import { Swipe } from "../../models/Action.js";
import { Match } from "../../models/Match.js";
import { pairKey } from "../../util/messaging-pair.js";

export const router = express.Router();

const ACTIONS = ["like", "pass", "superlike"] as const;

// POST /swipes – record a swipe; create match when mutual like
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const me = (req.user as User)._id;
      const meStr = me.toString();
      const { toUserId, action } = req.body ?? {};

      if (!toUserId) {
        return res.status(400).json({ message: "toUserId is required" });
      }
      if (!action || !ACTIONS.includes(action)) {
        return res.status(400).json({
          message: "action must be one of: like, pass, superlike",
        });
      }

      const toId = toUserId.toString();
      if (toId === meStr) {
        return res.status(400).json({ message: "Cannot swipe on yourself" });
      }

      const key = pairKey(meStr, toId);

      const existing = await Swipe.findOne({ from: me, to: toId });
      if (existing) {
        return res.status(409).json({
          message: "Already swiped on this user",
          swipe: existing,
        });
      }

      const swipe = await Swipe.create({
        from: me,
        to: toId,
        usersKey: key,
        action,
      });

      let matchDoc = null;
      if (action === "like" || action === "superlike") {
        const theyLikedMe = await Swipe.findOne({
          from: toId,
          to: me,
          action: { $in: ["like", "superlike"] },
        });
        if (theyLikedMe) {
          const otherId = new mongoose.Types.ObjectId(toId);
          const sorted = [me, otherId].sort((a, b) =>
            a.toString().localeCompare(b.toString())
          );
          matchDoc = await Match.findOneAndUpdate(
            { users: { $all: sorted } },
            { $setOnInsert: { users: sorted } },
            { new: true, upsert: true }
          );
        }
      }

      return res.status(201).json({
        message: "Swipe recorded",
        swipe,
        match: matchDoc ?? undefined,
      });
    } catch (error) {
      console.error("[Swipes] POST error:", error);
      return res.status(500).json({
        message: "Failed to record swipe",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

// GET /swipes – list swipes by current user (optional, for history)
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const me = (req.user as User)._id;
      const { action, limit = "50" } = req.query ?? {};
      const limitNum = Math.min(parseInt(String(limit), 10) || 50, 100);

      const filter: Record<string, unknown> = { from: me };
      if (action && ACTIONS.includes(action as (typeof ACTIONS)[number])) {
        filter.action = action;
      }

      const swipes = await Swipe.find(filter)
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .populate("to", "email")
        .lean();

      return res.status(200).json({
        message: "Swipes found",
        swipes,
      });
    } catch (error) {
      console.error("[Swipes] GET error:", error);
      return res.status(500).json({
        message: "Failed to get swipes",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);
