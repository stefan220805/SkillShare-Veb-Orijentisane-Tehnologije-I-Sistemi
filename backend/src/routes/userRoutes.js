import express from "express";
import { registerUser, loginUser, getAllUsers } from "../controllers/userController.js";

const router = express.Router();

// Ruta za registraciju: POST http://localhost:5001/api/users/register
router.post("/register", registerUser);

// Ruta za login: POST http://localhost:5001/api/users/login
router.post("/login", loginUser);

// Ruta za preuzimanje svih korisnika: GET http://localhost:5001/api/users
router.get("/", getAllUsers);

export default router;