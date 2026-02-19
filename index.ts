import { connectDB } from "./connection/connection.js";
import express, { type Request, type Response, type NextFunction } from "express";
import dotenv from "dotenv";
import { router as usersRouter } from "./routes/users/route.js";
import { router as profileRouter } from "./routes/profile/route.js";
import { router as messagingRouter } from "./routes/messaging/route.js";
import { router as avatarRouter } from "./routes/image/route.js";
import passport from "passport";
import configurePassport from "./jwt/jwt.js";

dotenv.config();

const app = express();

// to use json in the body of the request
app.use(express.json());
app.use(passport.initialize());
configurePassport();

app.use("/avatar", avatarRouter);
app.use("/messaging", messagingRouter);
app.use("/users", usersRouter);
app.use("/profile", profileRouter);

// test route
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Global error handler: log to console and return error in response
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const msg = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  console.error("[API Error]", msg, stack ?? "");
  res.status(500).json({
    message: "Internal server error",
    error: msg,
  });
});

// Start server only when NOT on Vercel (local dev)
if (!process.env.VERCEL) {
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  app.listen(port, () => {
    connectDB().catch((error) => {
      console.error("[MongoDB] Failed to connect:", error);
      process.exit(1);
    });
    console.log(`Server is running on port ${port}`);
  });
}

export default app;