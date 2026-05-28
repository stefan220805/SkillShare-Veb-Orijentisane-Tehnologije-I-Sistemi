import User from "../models/Users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Pomoćna funkcija za generisanje JWT tokena
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

    // 2. Provera da li korisnik sa tim emailom već postoji u bazi
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // 3. Hešovanje lozinke radi bezbednosti (kriptovanje)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Kreiranje novog korisnika u bazi podataka
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user", // Ako uloga nije poslata, automatski dobija ulogu 'user'
    });

    // 5. Vraćanje uspešnog odgovora sa JWT tokenom za automatski login
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

    // 2. Pronalaženje korisnika u bazi preko email adrese
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Poređenje unete lozinke sa hešovanom lozinkom iz baze podataka
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4. Ako su podaci tačni, vraća se uspešan odgovor i generiše se novi token
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

// 3. PREUZIMANJE SVIH KORISNIKA (Za administratore ili testiranje)
export async function getAllUsers(req, res) {
  try {
    // Polje "-password" osigurava da se hešovane lozinke ne šalju u odgovoru
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getAllUsers controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}