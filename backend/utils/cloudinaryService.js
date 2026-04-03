import { v2 as cloudinary } from "cloudinary";

import dotenv from "dotenv";
dotenv.config();

// Configure once when module loads
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET);
/**
 * Upload a Buffer to Cloudinary using base64 data URI.
 * This is simpler and more reliable than upload_stream.
 *
 * @param {Buffer} buffer    - raw file buffer from multer memoryStorage
 * @param {string} mimeType  - e.g. "audio/webm", "video/webm", "image/jpeg"
 * @param {object} options   - cloudinary upload options (folder, resource_type)
 * @returns {Promise<object>} cloudinary result { secure_url, public_id, bytes, ... }
 */
export const uploadBuffer = async (buffer, mimeType, options = {}) => {
    const b64 = buffer.toString("base64");
    const dataUri = `data:${mimeType};base64,${b64}`;
    return cloudinary.uploader.upload(dataUri, options);
};

/**
 * Delete a Cloudinary asset.
 * @param {string} publicId
 * @param {string} resourceType  "image" | "video" | "raw"
 */
export const deleteAsset = async (publicId, resourceType = "image") => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (err) {
        console.error("Cloudinary delete error:", err.message);
    }
};

export default cloudinary;
