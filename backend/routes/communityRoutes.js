import express from "express";
import { getPosts, createPost, likePost, deletePost, upload } from "../controller/communityController.js";

const router = express.Router();

router.get("/", getPosts);
router.post("/", upload.single("media"), createPost);
router.patch("/:id/like", likePost);
router.delete("/:id", deletePost);

export default router;
