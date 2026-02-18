import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import type { JwtPayload } from "jsonwebtoken";

interface JwtPayloadWithSub extends JwtPayload {
  sub: string;
}

export default function configurePassport(): void {
  // ✅ LOCAL STRATEGY (email + password)
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        session: false
      },
      async (
        email: string,
        password: string,
        done: (error: any, user?: any, options?: any) => void
      ) => {
        try {
          const user = await User.findOne({
            email: email.toLowerCase().trim()
          });

          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: "Invalid email or password" });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // ✅ JWT STRATEGY (protect routes)
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET as string
      },
      async (
        payload: JwtPayloadWithSub,
        done: (error: any, user?: any, options?: any) => void
      ) => {
        try {
          const user = await User.findById(payload.sub).select("-password");
          if (!user) {
            return done(null, false);
          }

          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
}
