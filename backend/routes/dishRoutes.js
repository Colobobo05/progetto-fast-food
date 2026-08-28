// backend/routes/dishRoutes.js
const express = require('express');
const router = express.Router();

// Importiamo il controller che contiene la logica
const dishController = require('../controllers/dishController');

// Rotta per ottenere un singolo piatto tramite il suo ID
router.get('/:id', dishController.getDishById);

// Quando chiami /api/dishes, usa getAllDishes
router.get('/', dishController.getAllDishes);

// Esportiamo il router per farlo leggere a server.js
module.exports = router;