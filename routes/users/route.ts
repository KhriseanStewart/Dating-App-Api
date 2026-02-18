import express from "express";
import { User } from "../../models/User";
import bcrypt from "bcrypt";
import passport from "passport";
import { signInToken } from "../../util/signIn-token";

export const router = express.Router();

// POSTING FOR REGISTERING A NEW USER
router.post("/register", async (req, res) => {
  try {
    const {email, password, telephone } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // only password is required and must be at least 8 characters, TODO: add it again
    // if (typeof password !== "string" || password.length < 8) {
    //   return res.status(400).json({
    //     message: "Password must be at least 8 characters",
    //   });
    // }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      email,
      password: hashedPassword,
      telephone,
    });

    const token = signInToken(user);

    // Don’t leak password back in API responses
    const safeUser = {
      _id: user._id,
      email: user.email,
      telephone: user.telephone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(201).json({
      token: token,
      message: "User registered successfully",
      user: safeUser,
    });
  } catch (error) {
    // Duplicate email unique index
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return res.status(409).json({ message: "Email already registered" });
    }

    return res.status(400).json({
      message: "Failed to register user",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// POSTING FOR LOGIN
router.post("/login", passport.authenticate("local", { session: false }), async (req, res) => {
  try {
    const user = req.user as User;
    const token = signInToken(user);
    return res.status(200).json({
      message: "Login successful",
      token: token,
      user: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to login",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// GET AUTHENTICATED USER
router.get("/me",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      try {
        const user = req.user as User;
        const token = signInToken(user);
        return res.status(200).json({
          message: "Authenticated user",
          token: token,
          user: user,
        });
      } catch (error) {
        return res.status(500).json({
          message: "Failed to get authenticated user",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
);

// GET SPECIFIC USER
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const safeUser = {
      _id: user._id,
      email: user.email,
      telephone: user.telephone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return res.status(200).json({
      message: "User found",
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get user",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// DELETE A USER
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const safeUser = {
      _id: user._id,
      email: user.email,
      telephone: user.telephone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return res.status(200).json({
      message: "User deleted successfully",
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete user",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});