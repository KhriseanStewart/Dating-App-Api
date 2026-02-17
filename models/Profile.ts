import mongoose, { type HydratedDocument } from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },  
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
  },
  { timestamps: true }
);

export type Profile = mongoose.InferSchemaType<typeof profileSchema>;
export type ProfileDocument = HydratedDocument<Profile>;
export const Profile = mongoose.model<Profile>("Profile", profileSchema);