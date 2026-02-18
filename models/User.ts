import mongoose, { type HydratedDocument } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },    
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, trim: true },
    // Store as string (supports +, leading zeros, spaces)
    telephone: { type: String, required: false, trim: true },
  },
  { timestamps: true }
);

export type User = mongoose.InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;
export const User = mongoose.model<User>("User", userSchema);