import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        emergencyContacts: [
            {
                name: String,
                email: String,
                phone: String,
                relation: String,
            }
        ],
        isHelper: {
            type: Boolean,
            default: false,
        },
        helperLocation: {
            city: { type: String, default: "" },
            lat: { type: Number, default: null },
            lng: { type: Number, default: null },
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
