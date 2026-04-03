import User from "../models/User.js";

// Haversine distance in km
const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// @route  POST /api/helpers/register
export const registerHelper = async (req, res) => {
  try {
    const { userId, city, lat, lng } = req.body;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isHelper = true;
    user.helperLocation = { city: city || "", lat: lat || null, lng: lng || null };
    await user.save();

    res.json({ message: "Registered as helper", isHelper: true });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route  POST /api/helpers/unregister
export const unregisterHelper = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isHelper = false;
    await user.save();
    res.json({ message: "Unregistered from helper network" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route  GET /api/helpers/nearby?lat=&lng=&radius=20
export const getNearbyHelpers = async (req, res) => {
  try {
    const { lat, lng, radius = 20 } = req.query;

    const helpers = await User.find({ isHelper: true })
      .select("name helperLocation isHelper")
      .lean();

    if (!lat || !lng) {
      // No coordinates: return all helpers with city only
      return res.json(helpers.map(h => ({
        id: h._id,
        name: h.name,
        city: h.helperLocation?.city || "Unknown",
        distance: null,
      })));
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const nearby = helpers
      .filter(h => h.helperLocation?.lat && h.helperLocation?.lng)
      .map(h => ({
        id: h._id,
        name: h.name,
        city: h.helperLocation.city,
        distance: haversine(userLat, userLng, h.helperLocation.lat, h.helperLocation.lng),
      }))
      .filter(h => h.distance <= parseFloat(radius))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    res.json(nearby);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route  GET /api/helpers/count
export const getHelperCount = async (req, res) => {
  try {
    const count = await User.countDocuments({ isHelper: true });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
