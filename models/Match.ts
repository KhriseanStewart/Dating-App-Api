// Match.ts
import mongoose, { Schema, type HydratedDocument } from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    users: [{ type: Schema.Types.ObjectId, ref: "User", required: true }], // [a,b] sorted
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

matchSchema.index({ users: 1 }, { unique: true });

export type Match = mongoose.InferSchemaType<typeof matchSchema>;
export type MatchDocument = HydratedDocument<Match>;
export const Match = mongoose.model<Match>("Match", matchSchema);