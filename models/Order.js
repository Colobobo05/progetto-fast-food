const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ristoranteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  
  // Lista dei piatti ordinati
  piatti: [{ 
    piattoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true }, 
    quantita: { type: Number, required: true, default: 1 }
  }],
  
  // Aggiunto il totale 
  totale: { type: Number, required: true },
  
  stato: { 
    type: String, 
    enum: ['ordinato', 'in preparazione', 'in consegna', 'consegnato'], 
    default: 'ordinato' 
  },
  
  tipoConsegna: { type: String, enum: ['ritiro', 'domicilio'], required: true },
  
  // Campi per il ritiro in sede
  tempoAttesaStimato: { type: Number }, // In minuti
  
  // Campi per la consegna a domicilio
  indirizzoConsegna: { type: String },
  
  
}, { timestamps: true }); // Salva in automatico createdAt e updatedAt

module.exports = mongoose.model('Order', orderSchema);