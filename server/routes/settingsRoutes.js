import express from "express";
import { getSettings, updateSettings, uploadHeroImage } from "../controller/settingsController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/hero', upload("settings").single('image'), uploadHeroImage);

export default router;
