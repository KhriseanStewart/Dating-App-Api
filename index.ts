import { connectDB } from "./connection/connection.js";
import express from "express";
import dotenv from "dotenv";
import { router as usersRouter } from "./routes/users/route.js";
import { router as profileRouter } from "./routes/profile/route.js";
import { router as messagingRouter } from "./routes/messaging/route.js";
import {router as avatarRouter} from "./routes/image/route.js"
import passport from "passport";
import configurePassport from "./jwt/jwt.js";
const app = express();

dotenv.config();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// to use json in the body of the request
app.use(express.json());
app.use(passport.initialize());
configurePassport();

app.use("/avatar", avatarRouter)
app.use("/messaging", messagingRouter);
app.use("/users", usersRouter);
app.use("/profile", profileRouter);

// test route
app.get("/", (req, res) => {
    res.send("Hello World");
});


app.listen(port, () => {
  connectDB().catch((error) => {
    console.error("Error while connecting database",error.message);
    process.exit(1);
  });
  console.log(`Server is running on port ${port}`);
});