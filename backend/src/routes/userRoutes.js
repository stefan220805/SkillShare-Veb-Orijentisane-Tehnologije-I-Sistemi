import express from "express";
import { registerUser, loginUser, getAllUsers, getMyProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Zaključane rute koje zahtevaju token:
router.get("/me", protect, getMyProfile);
router.get("/", protect, getAllUsers);

export default router;