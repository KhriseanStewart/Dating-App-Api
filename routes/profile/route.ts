import express from "express";
import passport from "passport";
import type { User } from "../../models/User";
import { Profile } from "../../models/Profile";
export const router = express.Router();

// create user profile
router.post("/create",passport.authenticate("jwt", { session: false }), async (req, res) => {
    try{
        const { name, age, gender, location, bio, interests, images } = req.body ?? {};
        const user_id = req.params;
        // console.log(user);
        // console.log(req.user)
        const profile = await Profile.create({
            user: user_id,
            name: name,
            age: age,
            gender: gender,
            location: location,
            bio: bio,
            interests: interests,
            images: images,
        });
        return res.status(201).json({
            message: "Profile created successfully",
            profile: profile,
        });
    } catch(error){
        return res.status(500).json({
            message: "Failed to create profile",
            error: error instanceof Error ? error.message : String(error),
        });
    }
});

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

// update profile
router.put("/update/:id", passport.authenticate("jwt", {session: false}), async (req, res) => {
    try{
        const id = req.params;
        const { name, age, gender, location, bio, interests, images } = req.body;
        if(!id){
            res.status(404).json({message: "No Profile Found"});
        }
        const data = await Profile.findByIdAndUpdate(id, {
            // put in data here
            name,
            age,
            gender,
            location,
            bio,
            interests,
            images
        });
        return res.status(200).json({
            message: "User Update Sucessfully",
            user: data
        });
    } catch(error){
        res.status(500).json({
            message: "Failed to fetch profile"
        });
    }

});