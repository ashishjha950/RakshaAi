import User from "../models/User.js";
import { sendSOSEmail } from "../utils/emailService.js";

// @desc    Add emergency contact
// @route   POST /api/contacts
export const addContact = async (req, res) => {
    try {
        const { userId, name, email, phone, relation } = req.body;

        if (!userId || !name || (!email && !phone)) {
            return res.status(400).json({ message: "Please provide valid contact details" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newContact = { name, email, phone, relation };
        user.emergencyContacts.push(newContact);
        await user.save();

        res.status(201).json({ message: "Contact added successfully", contacts: user.emergencyContacts });
    } catch (error) {
        console.error("Error in addContact:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get user's emergency contacts
// @route   GET /api/contacts/:userId
export const getContacts = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user.emergencyContacts);
    } catch (error) {
        console.error("Error in getContacts:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Trigger SOS alert manually
// @route   POST /api/contacts/sos
export const triggerSOS = async (req, res) => {
    try {
        const { userId, coordinates } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const locUrl = coordinates
            ? `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`
            : "https://www.google.com/maps";

        let nearbyHelpersCount = 0;

        // Alert nearby helpers within 3km if coordinates exist
        if (coordinates && coordinates.lat && coordinates.lng) {
            const helpers = await User.find({ isHelper: true }).select("helperLocation");
            helpers.forEach(h => {
                if (h._id.toString() === userId) return; // skip self
                if (h.helperLocation?.lat && h.helperLocation?.lng) {
                    const R = 6371;
                    const dLat = (h.helperLocation.lat - coordinates.lat) * Math.PI / 180;
                    const dLon = (h.helperLocation.lng - coordinates.lng) * Math.PI / 180;
                    const a = Math.sin(dLat / 2) ** 2 + Math.cos(coordinates.lat * Math.PI / 180) * Math.cos(h.helperLocation.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
                    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    
                    if (dist <= 3) nearbyHelpersCount++;
                }
            });
        }

        if (user.emergencyContacts && user.emergencyContacts.length > 0) {
            // Fire SOS email asynchronously
            sendSOSEmail(user.emergencyContacts, user.name, locUrl);
            res.json({ 
                message: "SOS successfully broadcasted to inner circle",
                nearbyHelpersAlerted: nearbyHelpersCount
            });
        } else {
            res.status(400).json({ message: "No emergency contacts defined to notify!" });
        }

    } catch (error) {
        console.error("Error in triggerSOS:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
