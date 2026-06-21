import express from "express";
import { addReview, getCourseReviews } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js"; // Tvoj middleware za proveru tokena

const router = express.Router();

router.post("/", protect, addReview); // Samo ulogovani mogu da ostave recenziju
router.get("/:courseId", getCourseReviews); // Svi mogu da čitaju recenzije

export default router;