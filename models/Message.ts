import mongoose, { type HydratedDocument } from "mongoose";

const messageSchema = new mongoose.Schema(
    {
      participants: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true,
        validate: [(v: any[]) => v.length === 2, "participants must have 2 users"],
        ref: "User",
      },
  
      // deterministic key for the pair (NOT unique per message – many messages per pair)
      participantsKey: { type: String, required: true },

      // per-message fields
      recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      type: {
        type: String,
        enum: ["text", "image", "video", "audio"],
        default: "text",
      },
      text: { type: String, default: "" },
      mediaUrl: { type: String, default: "" },
  
      lastMessageAt: { type: Date, default: null },
      lastMessageText: { type: String, default: "" },
      lastMessageSender: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  
      // simple read markers
      readState: {
        type: Map,
        of: new mongoose.Schema(
          {
            lastReadAt: { type: Date, default: null },
            lastReadMessageId: { type: mongoose.Schema.Types.ObjectId, default: null },
          },
          { _id: false }
        ),
        default: {},
      },
    },
    { timestamps: true }
  );
  
  messageSchema.index({ participants: 1 });
  messageSchema.index({ lastMessageAt: -1 });
  
  export const Message = mongoose.model("Message", messageSchema);

  // CONVERSATION SCHEMA
  
  const conversationSchema = new mongoose.Schema(
    {
      participants: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true,
        validate: [(v: any[]) => v.length === 2, "participants must have 2 users"],
        ref: "User",
      },
  
      // ✅ used to enforce one conversation per pair
      participantsKey: { type: String, required: true, unique: true },
  
      lastMessageAt: { type: Date, default: null },
      lastMessageText: { type: String, default: "" },
      lastMessageSender: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  
      // simple read markers
      readState: {
        type: Map,
        of: new mongoose.Schema(
          {
            lastReadAt: { type: Date, default: null },
            lastReadMessageId: { type: mongoose.Schema.Types.ObjectId, default: null },
          },
          { _id: false }
        ),
        default: {},
      },
    },
    { timestamps: true }
  );
  
  conversationSchema.index({ participants: 1 });
  conversationSchema.index({ lastMessageAt: -1 });
  
  export const Conversation = mongoose.model("Conversation", conversationSchema);
  