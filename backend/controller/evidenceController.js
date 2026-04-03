import multer from "multer";
import { uploadBuffer, deleteAsset } from "../utils/cloudinaryService.js";
import dotenv from "dotenv";
dotenv.config();

// Memory storage — buffer available as req.file.buffer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

export { upload };

// Determine Cloudinary resource_type from MIME type
const resourceTypeFor = (mime = "") => {
    if (mime.startsWith("image/")) return "image";
    // Cloudinary uses "video" for audio files too
    if (mime.startsWith("video/") || mime.startsWith("audio/")) return "video";
    return "raw";
};

// @route  POST /api/evidence/upload
export const uploadEvidence = async (req, res) => {
    console.log("Upload request received:", req.file?.mimetype, "size:", req.file?.size);

    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file in request" });
        }

        const mimeType = req.file.mimetype;
        const isSos = req.body.isSos === "true";
        const resourceType = resourceTypeFor(mimeType);
        const folder = isSos ? "raksha/sos" : "raksha/evidence";

        const result = await uploadBuffer(req.file.buffer, mimeType, {
            folder,
            resource_type: resourceType,
            public_id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        });

        console.log("Cloudinary upload success:", result.secure_url);

        return res.json({
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
            bytes: result.bytes,
            format: result.format,
        });
    } catch (err) {
        console.error("Evidence upload error:", err.message || err);
        return res.status(500).json({ message: "Cloudinary upload failed", error: err.message });
    }
};

// @route  DELETE /api/evidence/:publicId
export const deleteEvidence = async (req, res) => {
    try {
        const decoded = decodeURIComponent(req.params.publicId);
        const { resourceType = "image" } = req.body;
        await deleteAsset(decoded, resourceType);
        return res.json({ message: "Deleted" });
    } catch (err) {
        return res.status(500).json({ message: "Delete failed", error: err.message });
    }
};
