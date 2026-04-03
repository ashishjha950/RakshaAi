import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        authorId: { type: String, default: "anonymous" },
        authorName: { type: String, default: "Anonymous Sister" },
        title: { type: String, required: true, trim: true },
        story: { type: String, required: true, trim: true },
        category: {
            type: String,
            enum: ["harassment", "stalking", "assault", "eve-teasing", "online-abuse", "workplace", "safe-experience", "other"],
            default: "other"
        },
        location: { type: String, default: "" },
        isAnonymous: { type: Boolean, default: false },
        likes: { type: Number, default: 0 },
        likedBy: [{ type: String }],
        tags: [String],
        // ── Media attachment ──────────────────────────────────────
        mediaUrl: { type: String, default: "" },
        mediaType: { type: String, enum: ["image", "audio", "file", ""], default: "" },
        mediaName: { type: String, default: "" },
    },
    { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
