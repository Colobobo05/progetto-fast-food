const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersegreto_fastfood_2025';

// Middleware per verificare il token
exports.verifyToken = (req, res, next) => {
    // Il token di solito viene inviato nell'header "Authorization" come "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Accesso negato. Token mancante.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Salviamo i dati dell'utente (userId e role) nella richiesta
        next(); // Passiamo al controller
    } catch (error) {
        res.status(401).json({ message: 'Token non valido o scaduto.' });
    }
};

// Middleware per bloccare chi non è Ristoratore
exports.isRistoratore = (req, res, next) => {
    if (req.user.role !== 'Ristoratore') {
        return res.status(403).json({ message: 'Accesso negato. Area riservata ai Ristoratori.' });
    }
    next();
};