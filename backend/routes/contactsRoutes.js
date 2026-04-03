import express from "express";
import { addContact, getContacts, triggerSOS } from "../controller/contactsController.js";

const router = express.Router();

router.post("/", addContact);
router.get("/:userId", getContacts);
router.post("/sos", triggerSOS);

export default router;
