import express from "express";
import { registerHelper, unregisterHelper, getNearbyHelpers, getHelperCount } from "../controller/helperController.js";

const router = express.Router();

router.post("/register", registerHelper);
router.post("/unregister", unregisterHelper);
router.get("/nearby", getNearbyHelpers);
router.get("/count", getHelperCount);

export default router;
