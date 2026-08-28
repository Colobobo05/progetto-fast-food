const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Chiave segreta per il token 
const JWT_SECRET = process.env.JWT_SECRET || 'supersegreto_fastfood_2025';

// --- REGISTRAZIONE ---
exports.register = async (req, res) => {
    try {
        // ATTENZIONE: Usiamo 'let' e non 'const' così possiamo modificare l'email
        let { email, password, role, nome, cognome, metodoPagamento, preferenze } = req.body;

        // 0. PULIZIA EMAIL (Rimuove spazi vuoti accidentali e mette tutto in minuscolo)
        if (email) {
            email = email.toLowerCase().trim();
        }

        // Validazione mail tramite Regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Formato email non valido. Inserisci un indirizzo corretto (es. nome@dominio.com).' });
        }

        // 1. Controlla se l'utente esiste già
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Utente già registrato con questa email.' });
        }

        // 2. Cripta la password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Crea il nuovo utente
        user = new User({
            email,
            password: hashedPassword,
            role,
            nome,
            cognome,
            metodoPagamento,
            preferenze
        });

        await user.save();

        res.status(201).json({ message: 'Registrazione completata con successo!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore del server durante la registrazione.' });
    }
};

// --- LOGIN ---
exports.login = async (req, res) => {
    try {
        // ATTENZIONE: Usiamo 'let' anche qui
        let { email, password } = req.body;

        // 0. PULIZIA EMAIL (Così combacia perfettamente con quella salvata nel database)
        if (email) {
            email = email.toLowerCase().trim();
        }

        // 1. Cerca l'utente
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Credenziali non valide.' });
        }

        // 2. Verifica la password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenziali non valide.' });
        }

        // 3. Genera il Token JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role }, // Dati salvati nel token
            JWT_SECRET,
            { expiresIn: '1d' } // Il token scade dopo 1 giorno
        );

        // 4. Invia la risposta al frontend 
        res.json({ 
            token: token, 
            role: user.role, 
            userId: user._id, 
            message: 'Login effettuato!' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore del server durante il login.' });
    }
};