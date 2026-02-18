import crypto from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import passport from "passport";
import express from 'express';
import type { User } from "../../models/User.js";
import { r2 } from "../../connection/r2client";
import { Profile } from "../../models/Profile.js";

export const router = express.Router();

router.post(
  "/me/avatar/presign",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = req.user as User;
      const { mime, bucket } = req.body ?? {};

      if(!bucket){
        return res.status(400).json({"message": "Put a bucket to connect to"});
      }

      const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!mime || !allowed.includes(mime)) {
        return res.status(400).json({ message: "Invalid mime type" });
      }

      const ext = mime.split("/")[1];
      const key = `avatar/${user._id}/${crypto.randomUUID()}.${ext}`;

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: mime,
        CacheControl: "public, max-age=31536000",
      });

      const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 60 });
      // R2_PUBLIC_URL must be your bucket's public URL (r2.dev or custom domain)
      const baseUrl = process.env.R2_PUBLIC_URL ?? process.env.R2_AVATAR_PUBLIC_URL;
      if (!baseUrl) {
        return res.status(500).json({
          message: "R2_PUBLIC_URL or R2_AVATAR_PUBLIC_URL must be set for avatar uploads",
        });
      }
      const publicUrl = `${baseUrl.replace(/\/$/, "")}/${key}`;

      return res.json({ uploadUrl, key, url: publicUrl });
    } catch (error) {
      return res.status(500).json({
        message: "Failed to presign avatar upload",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);


router.post(
    "/me/avatar/confirm",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      try {
        const user = req.user as User;
        const { key, url } = req.body ?? {};
  
        if (!key || !url) {
          return res.status(400).json({ message: "key and url are required" });
        }
  
        if (!key.startsWith(`avatar/${user._id}/`)) {
          return res.status(403).json({ message: "Invalid key scope" });
        }
  
        const profile = await Profile.findOneAndUpdate(
          { user: user._id },
          { $set: { avatar: url } },
          { new: true }
        );
  
        if (!profile) return res.status(404).json({ message: "Profile not found" });
  
        return res.json({ message: "Avatar saved", profile });
      } catch (error) {
        return res.status(500).json({
          message: "Failed to confirm avatar",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );
  