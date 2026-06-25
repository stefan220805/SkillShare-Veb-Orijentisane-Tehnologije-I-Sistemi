import express from "express";
import { addReview, getCourseReviews, deleteReview} from "../controllers/reviewController.js";
import { protect, admin} from "../middleware/authMiddleware.js"; // Tvoj middleware za proveru tokena

const router = express.Router();

router.post("/", protect, addReview); // Samo ulogovani mogu da ostave recenziju
router.get("/:courseId", getCourseReviews); // Svi mogu da čitaju recenzije
router.delete("/:id", protect, admin, deleteReview);

export default router;