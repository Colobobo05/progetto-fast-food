// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); 

// importazione dello swagger 
const setupSwagger = require('./swagger');

// Importiamo lo script di setup
const loadMeals = require('./data/setup');

const app = express();

// Middleware
app.use(cors()); // Permette le chiamate dal frontend
app.use(express.json()); // Permette al server di leggere i dati in formato JSON nel body delle richieste

// Connessione al Database e Setup Dati
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fastfood')
    .then(async () => {
        console.log(' MongoDB connesso con successo!');
        
        //  esegue il setup dei dati allo startup
        await loadMeals(); 
    })
    .catch((error) => {
        console.error(' Errore di connessione a MongoDB:', error.message);
        process.exit(1);
    });

// Rotta di stato (per controllare se il server è vivo)
app.get('/api/status', (req, res) => {
    res.json({ message: 'API Fast Food in esecuzione e pronte a ricevere ordini!' });
});

// Tutte le nostre rotte
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/restaurants', require('./routes/restaurantRoutes'));
app.use('/api/search', require('./routes/searchRoutes')); 
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Collega la richiesta del frontend al file dei piatti
app.use('/api/dishes', require('./routes/dishRoutes'));

// attivazione dello swagger 
setupSwagger(app);

// Avvio del server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server in ascolto sulla porta ${PORT}`);
});