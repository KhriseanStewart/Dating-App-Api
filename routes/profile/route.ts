import express from "express";
import passport from "passport";
import type { User } from "../../models/User.js";
import { Profile } from "../../models/Profile.js";
export const router = express.Router();

// create user profile
router.post("/create",passport.authenticate("jwt", { session: false }), async (req, res) => {
    try{
        const { name, age, gender, location, bio, interests, images } = req.body ?? {};
        const user = req.user as User;
        const userId = user._id;

        const profile = await Profile.create({
            user: userId,
            name: name,
            age: age,
            gender: gender,
            location: location,
            bio: bio,
            interests: interests,
            images: images,
        });

        const safeProfile = {
            name: profile.name,
            age: profile.age,
            gender: profile.gender,
            location: profile.location,
            bio: profile.bio,
            interests: profile.interests,
            images: profile.images,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
        return res.status(201).json({
            message: "Profile created successfully",
            profile: safeProfile,
        });
    } catch(error){
        return res.status(500).json({
            message: "Failed to create profile",
            error: error instanceof Error ? error.message : String(error),
        });
    }
});

// GET my profile (authenticated user)
router.get("/me",passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      try {
        const user = req.user as User;
  
        // ✅ Profile references user via `user` field, not by sharing _id
        const profile = await Profile.findOne({ user: user._id });
  
        if (!profile) {
          return res.status(404).json({ message: "Profile not found" });
        }
  
        return res.status(200).json({
          message: "Profile found",
          profile,
        });
      } catch (error) {
        return res.status(500).json({
          message: "Failed to get user profile",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
);

// fetch users profile based on ID
router.get("/:id", passport.authenticate("jwt", {session: false}), async (req, res) =>{
    try{
        const id = req.params;
        if(!id){
            res.status(404).json({
                message: "could not find user"
            });
        }
        const data = await Profile.findById(id);
        if (!data) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            message: "Profile found",
            user: data,
        })
    } catch(error){
        return res.status(500).json({
            message: "Failed to get user profile",
            error: error instanceof Error ? error.message : String(error),
        });
    }
});

// update profile
router.put("/update/:id", passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      try {
        const { id } = req.params; // ✅ correct
        const { name, age, gender, location, bio, interests, images } = req.body ?? {};
  
        const updates: Record<string, unknown> = {};
  
        if (name !== undefined) updates.name = name;
        if (age !== undefined) updates.age = age;
        if (gender !== undefined) updates.gender = gender;
        if (location !== undefined) updates.location = location;
        if (bio !== undefined) updates.bio = bio;
        if (interests !== undefined) updates.interests = interests;
        if (images !== undefined) updates.images = images;
  
        if (Object.keys(updates).length === 0) {
          return res.status(400).json({ message: "No fields provided to update" });
        }
  
        const updatedProfile = await Profile.findByIdAndUpdate(
          id,
          { $set: updates },
          { new: true, runValidators: true } // ✅ important
        );
  
        if (!updatedProfile) {
          return res.status(404).json({ message: "Profile not found" });
        }
  
        return res.status(200).json({
          message: "Profile updated successfully",
          profile: updatedProfile,
        });
      } catch (error) {
        return res.status(500).json({
          message: "Failed to update profile",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
);

// fetch all profile
router.get("/all", passport.authenticate("jwt", {session: false}), async (req, res) => {
    try{
      const data = await Profile.find();
      if (!data) {
          return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({
          message: "Profile found",
          user: data,
      })
  } catch(error){
      return res.status(500).json({
          message: "Failed to get user profile",
          error: error instanceof Error ? error.message : String(error),
      });
  }
})

/*
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    location: { type: String, required: false },
    bio: { type: String, required: false, trim: false },
    interests: { type: [String], required: false, trim: true },
    images: { type: [String], required: false, trim: true },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
*/