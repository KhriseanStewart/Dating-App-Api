import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import type { User } from "../../models/User.js";
import { Match } from "../../models/Match.js";
import { Profile } from "../../models/Profile.js";

export const router = express.Router();

// GET /matches – list my matches (with other user's profile info)
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const me = (req.user as User)._id;
      const limit = Math.min(parseInt(String(req.query.limit), 10) || 50, 100);

      const matches = await Match.find({ users: me })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("users", "email")
        .lean();

      const withProfiles = await Promise.all(
        matches.map(async (m) => {
          const users = m.users as { _id: mongoose.Types.ObjectId }[];
          const other = users?.find((u) => u._id.toString() !== me.toString());
          const otherId = other?._id;
          const profile = otherId
            ? await Profile.findOne({ user: otherId }).lean()
            : null;
          return {
            ...m,
            otherUser: otherId,
            otherProfile: profile ?? undefined,
          };
        })
      );

      return res.status(200).json({
        message: "Matches found",
        matches: withProfiles,
      });
    } catch (error) {
      console.error("[Matches] GET / error:", error);
      return res.status(500).json({
        message: "Failed to get matches",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

// GET /matches/:otherUserId – get match with a specific user
router.get(
  "/:otherUserId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const me = (req.user as User)._id;
      const meStr = me.toString();
      const { otherUserId } = req.params;

      if (!otherUserId) {
        return res.status(400).json({ message: "otherUserId is required" });
      }

      const otherStr = otherUserId.toString();
      const otherId = new mongoose.Types.ObjectId(otherStr);
      const sorted = [me, otherId].sort((a, b) =>
        a.toString().localeCompare(b.toString())
      );

      const match = await Match.findOne({ users: { $all: sorted } })
        .populate("users", "email")
        .lean();

      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      const otherProfile = await Profile.findOne({ user: otherId }).lean();

      return res.status(200).json({
        message: "Match found",
        match: {
          ...match,
          otherUser: otherId,
          otherProfile: otherProfile ?? undefined,
        },
      });
    } catch (error) {
      console.error("[Matches] GET /:otherUserId error:", error);
      return res.status(500).json({
        message: "Failed to get match",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);
