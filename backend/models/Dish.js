const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  tipologia: { type: String, required: true },
  prezzo: { type: Number, required: true },
  ingredienti: [{ type: String }], 
  fotoUrl: { type: String },
  
  // Se è null, significa che è un piatto del database comune (meal.json). 
  // Se ha un ID, è un piatto personalizzato inserito da un ristoratore.
  tempoPreparazione: { type: Number, required: true, default: 15 },

  ristoranteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', default: null }
});

module.exports = mongoose.model('Dish', dishSchema);