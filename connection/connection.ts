import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

export const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}