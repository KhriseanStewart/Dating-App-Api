// Swipe.ts
import mongoose, { type HydratedDocument } from "mongoose";

const swipeSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    usersKey: { type: String, required: true },
    action: { type: String, enum: ["like", "pass", "superlike"], required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent duplicates (same person swiping same person twice)
swipeSchema.index({ from: 1, to: 1 }, { unique: true });
// Fast “did they like me?” lookup
swipeSchema.index({ to: 1, action: 1, from: 1 });

export type Swipe = mongoose.InferSchemaType<typeof swipeSchema>;
export type SwipeDocument = HydratedDocument<Swipe>;
export const Swipe = mongoose.model<Swipe>("Swipe", swipeSchema);