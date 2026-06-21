import express from "express";
import cors from "cors";
import coursesRoutes from "./routes/coursesRoutes.js"; 
import userRoutes from "./routes/userRoutes.js"; 
import swapRoutes from "./routes/swapRoutes.js"; 
import reviewRoutes from "./routes/reviewRoutes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/courses", coursesRoutes);
app.use("/api/users", userRoutes); 
app.use("/api/swaps", swapRoutes);
app.use("/api/reviews", reviewRoutes);  

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});