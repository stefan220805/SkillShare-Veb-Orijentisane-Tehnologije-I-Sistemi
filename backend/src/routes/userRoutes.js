import express from "express";
import { registerUser, loginUser, getAllUsers, getMyProfile, updateUserProfile, deleteUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Zaključane rute koje zahtevaju token:
router.get("/me", protect, getMyProfile);
router.get("/", protect, getAllUsers);
router.put("/profile", protect, updateUserProfile);
router.delete("/:id", protect, deleteUser);

export default router;