import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import multer from "multer";
import Post from "../models/Post.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Multer storage config ─────────────────────────────────────────
const uploadDir = path.join(__dirname, "..", "uploads", "community");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp3|ogg|wav|pdf|doc|docx|txt/i;
    cb(null, allowed.test(path.extname(file.originalname)));
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// ── helper: derive mediaType from mimetype ──────────────────────
const getMediaType = (mimetype = "") => {
    if (mimetype.startsWith("image/")) return "image";
    if (mimetype.startsWith("audio/")) return "audio";
    return "file";
};

// @desc Get all posts (newest first)
// @route GET /api/community
export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// @desc Create a new community post (supports multipart/form-data for files)
// @route POST /api/community
export const createPost = async (req, res) => {
    try {
        const { authorId, authorName, title, story, category, location, isAnonymous, tags } = req.body;
        if (!title || !story) return res.status(400).json({ message: "Title and story are required" });

        let mediaUrl = "";
        let mediaType = "";
        let mediaName = "";

        if (req.file) {
            mediaUrl = `/uploads/community/${req.file.filename}`;
            mediaType = getMediaType(req.file.mimetype);
            mediaName = req.file.originalname;
        }

        const post = new Post({
            authorId: authorId || "anonymous",
            authorName: isAnonymous === "true" || isAnonymous === true ? "Anonymous Sister" : (authorName || "Anonymous Sister"),
            title: title.trim(),
            story: story.trim(),
            category: category || "other",
            location: location || "",
            isAnonymous: isAnonymous === "true" || isAnonymous === true,
            tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
            likes: 0,
            likedBy: [],
            mediaUrl,
            mediaType,
            mediaName,
        });

        await post.save();
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// @desc Like / unlike a post (toggle)
// @route PATCH /api/community/:id/like
export const likePost = async (req, res) => {
    try {
        const { userId } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const alreadyLiked = post.likedBy.includes(userId);
        if (alreadyLiked) {
            post.likedBy = post.likedBy.filter(id => id !== userId);
            post.likes = Math.max(0, post.likes - 1);
        } else {
            post.likedBy.push(userId);
            post.likes += 1;
        }

        await post.save();
        res.json({ likes: post.likes, liked: !alreadyLiked });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// @desc Delete a post (only by author)
// @route DELETE /api/community/:id
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });
        if (post.authorId !== req.body.userId) return res.status(403).json({ message: "Not authorized" });

        // Remove uploaded file if exists
        if (post.mediaUrl) {
            const filePath = path.join(__dirname, "..", post.mediaUrl);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await post.deleteOne();
        res.json({ message: "Post deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
