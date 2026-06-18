import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
    let token;

    // Proveravamo da li token stiže u Authorization Header-u i da li počinje sa "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Uzimamo samo string tokena (brišemo reč "Bearer")
            token = req.headers.authorization.split(' ')[1];

            // Verifikujemo token pomoću tajnog ključa iz .env fajla
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Upisujemo dekodirane podatke o korisniku u req.user da im imaš pristup u kontrolerima
            req.user = decoded;

            // Sve je u redu, idemo dalje na kontroler
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