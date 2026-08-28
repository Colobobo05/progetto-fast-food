const User = require('../models/User');

// 1. VISUALIZZA IL PROFILO
exports.getProfile = async (req, res) => {
    try {
        // req.user.userId viene dal token!
        const user = await User.findById(req.user.userId).select('-password'); // Escludiamo la password per sicurezza
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore nel recupero del profilo' });
    }
};

// 2. MODIFICA IL PROFILO
exports.updateProfile = async (req, res) => {
    try {
        const { nome, cognome, metodoPagamento } = req.body;
        
        // Aggiorniamo solo nome, cognome e pagamento
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { nome, cognome, metodoPagamento },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }
        res.json({ message: 'Profilo aggiornato con successo!', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore durante l\'aggiornamento' });
    }
};

// 3. ELIMINA IL PROFILO
exports.deleteProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }
        res.json({ message: 'Account eliminato per sempre.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore durante l\'eliminazione' });
    }
};