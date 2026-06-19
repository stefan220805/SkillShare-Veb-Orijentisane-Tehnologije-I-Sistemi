import express from "express";
import { createSwapRequest, getMyReceivedRequests, updateSwapStatus } from "../controllers/swapController.js";
import { protect } from "../middleware/authMiddleware.js"; // Uvozimo zaštitu

const router = express.Router();

// Sve rute za razmenu zahtevaju da korisnik bude ulogovan
router.post("/", protect, createSwapRequest);

// URL je sada čist: GET http://localhost:5001/api/swaps/received
router.get("/received", protect, getMyReceivedRequests);

router.put("/status/:requestId", protect, updateSwapStatus);

export default router;