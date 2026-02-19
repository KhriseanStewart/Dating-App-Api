import { connectDB } from "../connection/connection.js";
import app from "../index.js";

export default async function handler(req: any, res: any): Promise<void> {
  try {
    await connectDB();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("[Vercel] MongoDB connection failed:", msg, stack ?? "");
    res.status(500).json({
      message: "Database connection failed",
      error: msg,
    });
    return;
  }
  app(req, res);
}
