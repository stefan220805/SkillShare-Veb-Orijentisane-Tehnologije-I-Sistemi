import User from "../models/Users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Course from "../models/Course.js"; // Proveri samo da li se fajl zove Course.js

// Pomocna funkcija za generisanje JWT tokena
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token važi 30 dana
  });
};

// 1. REGISTRACIJA NOVOG KORISNIKA
export async function registerUser(req, res) {
  try {
    const { name, email, password, role } = req.body;

    // 1. Provera da li su sva obavezna polja poslata
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please enter all required fields" });
    }

    // 2. Provera da li korisnik sa tim emailom vec postoji u bazi
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // 3. Hesovanje lozinke radi bezbednosti (kriptovanje)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Kreiranje novog korisnika u bazi podataka
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user", // Ako uloga nije poslata, automatski dobija ulogu 'user'
    });

    // 5. Vracanje uspesnog odgovora sa JWT tokenom za automatski login
    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token: generateToken(newUser._id),
      },
    });
  } catch (error) {
    console.error("Error in registerUser controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// 2. LOGOVANJE KORISNIKA (LOGIN)
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // 1. Provera da li su uneti i email i lozinka
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // 2. Pronalazenje korisnika u bazi preko email adrese
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Poredjenje unete lozinke sa hesovanom lozinkom iz baze podataka
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4. Ako su podaci tacni, vraca se uspesan odgovor i generiše se novi token
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error("Error in loginUser controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
//3. PREUZIMANJE PROFILA TRENUTNOG KORISNIKA (Preko tokena!)
export async function getMyProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getMyProfile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// 4. PREUZIMANJE SVIH KORISNIKA (Za administratore ili testiranje)
export const getAllUsers = async (req, res) => {
  try {
    // .select("-password") osigurava da nikada ne šaljemo lozinke na frontend
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Greška pri povlačenju korisnika:", error);
    res.status(500).json({ message: "Interna greška servera" });
  }
};

// 5. IZMENA SOPSTVENOG PROFILA (Update)
export async function updateUserProfile(req, res) {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      // Ako korisnik salje novu sifru, moramo je hesovati pre suvanja
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.status(200).json({
        message: "Profile updated successfully",
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          token: generateToken(updatedUser._id), // Generisemo novi token nakon izmene
        }
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Korisnik nije pronađen" });
    }

    // Opciono: Spreči admina da obriše samog sebe
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "Ne možete obrisati sopstveni nalog" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Korisnik je uspešno obrisan" });
  } catch (error) {
    console.error("Greška pri brisanju korisnika:", error);
    res.status(500).json({ message: "Interna greška servera" });
  }
};