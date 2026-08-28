// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Connessione al database locale MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fastfood');
        console.log('✅ MongoDB connesso con successo!');
    } catch (error) {
        console.error('❌ Errore di connessione a MongoDB:', error.message);
        process.exit(1); // Ferma il server se il DB non si connette
    }
};

module.exports = connectDB;