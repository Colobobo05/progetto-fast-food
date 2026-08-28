const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Cliente', 'Ristoratore'], required: true },
  
  // Campi specifici per i Clienti
  nome: { type: String },
  cognome: { type: String },
  metodoPagamento: { type: String, enum: ['Carta di Credito', 'Carta Prepagata'] },
  preferenze: [{ type: String }] 
});

module.exports = mongoose.model('User', userSchema);