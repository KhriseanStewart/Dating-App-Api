import passport from "passport";
import express from "express";
import { User } from "../../models/User";
import { pairKey } from "../../util/messaging-pair";
import { Conversation, Message } from "../../models/Message";

export const router = express.Router();

router.post("/conversations/with/:otherUserId", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try{
        const me = (req.user as User)._id.toString();
        const other = (req.params as { otherUserId: string }).otherUserId;

        if(!other){
            return res.status(400).json({
                message: "Other user ID is required",
            });
        }

        // ✅ check match exists first (pseudo)
        // const isMatch = await Match.exists({ usersKey: pairKey(me, other) });
        // if (!isMatch) return res.status(403).json({ message: "Not matched" });

        const key = pairKey(me, other);

        const convo = await Conversation.findOneAndUpdate(
            { participantsKey: key },
            {
              $setOnInsert: {
                participants: [me, other],
                participantsKey: key,
              },
            },
            { new: true, upsert: true }
          );
      
          res.json({ conversation: convo });
    } catch(error){
        return res.status(500).json({
            message: "Failed to send message",
            error: error instanceof Error ? error.message : String(error),
        });
    }
});

router.post("/messages/in/:conversationId", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try{
        const me = (req.user as User)._id.toString();
        const { conversationId } = req.params;
        const { text, type = "text", mediaUrl } = req.body ?? {};

        if(!text){
            return res.status(400).json({ message: "Text is required" });
        }

        const convo = await Conversation.findById(conversationId);
        if (!convo) return res.status(404).json({ message: "Conversation not found" });

        const isParticipant = convo.participants.some((p: any) => p.toString() === me.toString());
        if (!isParticipant) return res.status(403).json({ message: "Not allowed" });

        if (!Array.isArray(convo.participants) || convo.participants.length !== 2) {
            return res.status(500).json({ message: "Conversation participants are invalid" });
        }

        const recipientId = (
            convo.participants[0]!.toString() === me.toString()
            ? convo.participants[1]!
            : convo.participants[0]!
        ) as any;

        const msg = await Message.create({
            participants: [me, recipientId],
            participantsKey: pairKey(me, recipientId?.toString() ?? ""),
            recipientId,
            type,
            text: text,
            mediaUrl: mediaUrl ?? "",
        } as any) as any;

        await Conversation.findByIdAndUpdate(conversationId, {
            $set: {
            lastMessageAt: msg.createdAt,
            lastMessageText: msg.type === "text" ? msg.text : `[${msg.type}]`,
            lastMessageSender: me,
            },
        });

        res.status(201).json({ message: msg });
    } catch(error){
        return res.status(500).json({
            message: "Failed to send message",
            error: error instanceof Error ? error.message : String(error),
        });
    }
});