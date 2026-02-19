import mongoose from "mongoose";

const MONGO_URI =
  process.env.MONGO_URI ?? process.env.MONGODB_URI ?? "";

let cachedPromise: Promise<void> | null = null;

export const connectDB = async (): Promise<void> => {
  if (!MONGO_URI) {
    const msg = "Missing MONGO_URI or MONGODB_URI environment variable";
    console.error("[MongoDB]", msg);
    throw new Error(msg);
  }
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (cachedPromise) {
    return cachedPromise;
  }
  cachedPromise = (async () => {
    try {
      await mongoose.connect(MONGO_URI);
      console.log("[MongoDB] Connected");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const errStack = error instanceof Error ? error.stack : undefined;
      console.error("[MongoDB] Connection error:", errMsg, errStack ?? "");
      throw error;
    }
  })();
  return cachedPromise;
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    cachedPromise = null;
    console.log("[MongoDB] Disconnected");
  } catch (error) {
    console.error("[MongoDB] Disconnect error:", error);
    throw error;
  }
};
