import express from "express";
import { uploadEvidence, deleteEvidence, upload } from "../controller/evidenceController.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadEvidence);
router.delete("/:publicId", deleteEvidence);

export default router;
