import mongoose from "mongoose";

const swapRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    offeredCourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    requestedCourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending", // Zahtev je na čekanju dok ga receiver ne odobri/odbije
    },
  },
  {
    timestamps: true,
  }
);

const SwapRequest = mongoose.model("SwapRequest", swapRequestSchema);
export default SwapRequest;