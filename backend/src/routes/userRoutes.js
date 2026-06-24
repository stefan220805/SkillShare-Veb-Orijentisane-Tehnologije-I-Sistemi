import express from "express";
import { registerUser, loginUser, getAllUsers, getMyProfile, updateUserProfile, deleteUser } from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js"; 

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Zaključane rute koje zahtevaju token:
router.get("/me", protect, getMyProfile);
router.get("/", protect, admin, getAllUsers);
router.put("/profile", protect, updateUserProfile);
router.delete("/:id", protect, admin, deleteUser);

export default router;