import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export function signInToken(user: User){
    return jwt.sign({sub: user._id}, process.env.JWT_SECRET as string, {expiresIn: "1h"});
}