import express from "express";
import { createSwapRequest, getMyReceivedRequests, updateSwapStatus } from "../controllers/swapController.js";

const router = express.Router();

router.post("/", createSwapRequest);

router.get("/received/:userId", getMyReceivedRequests);

router.put("/status/:requestId", updateSwapStatus);

export default router;