import express from "express";

import { 
    getAllCourses,
    getCourseById, 
    createCourse, 
    updateCourse, 
    deleteCourse,
    getMyCourses
} from "../controllers/courseController.js";

const router = express.Router();

router.get("/", getAllCourses);
router.get("/:id", getCourseById);
router.post("/", createCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);
router.get("/user/:userId", getMyCourses);

export default router;