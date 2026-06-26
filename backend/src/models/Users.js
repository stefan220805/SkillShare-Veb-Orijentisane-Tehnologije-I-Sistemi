import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ime je obavezno"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email je obavezan"],
      unique: true, 
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Lozinka je obavezna"],
      minlength: [6, "Lozinka mora imati najmanje 6 karaktera"],
    },
    role: {
      type: String,
      enum: ["user", "admin"], 
      default: "user",          
    },
    profilePicture: {
      type: String,
      default: "", // Default je prazan string (nema slike)
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;