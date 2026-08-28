const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Collega il ristorante al ristoratore
  nome: { type: String, required: true },
  telefono: { type: String, required: true },
  partitaIva: { type: String, required: true },
  indirizzo: { type: String, required: true },
  luogo: { type: String, required: true }, 
  immagine: { type: String }, 
  descrizione: { type: String } 
});

module.exports = mongoose.model('Restaurant', restaurantSchema);