import jwt from "jsonwebtoken";
import User from "../models/Users.js"; // OBAVEZNO dodaj ovaj import na vrhu! (Proveri da li ti se fajl tačno zove Users.js)

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select("-password");

            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            return res.status(401).json({ message: 'Niste autorizovani, token je nevažeći' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Niste autorizovani, token nedostaje' });
    }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Niste ovlašćeni kao administrator" });
  }
};