import express from "express";

import { 
    getAllCourses,
    getCourseById, 
    createCourse, 
    updateCourse, 
    deleteCourse,
    getMyCourses
} from "../controllers/courseController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/", getAllCourses);
router.get("/:id", getCourseById);


router.post("/", protect, createCourse);
router.put("/:id", protect, updateCourse);
router.delete("/:id", protect, deleteCourse);

router.get("/my/all", protect, getMyCourses);

export default router;