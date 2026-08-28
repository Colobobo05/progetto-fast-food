// backend/controllers/dishController.js
const Dish = require('../models/Dish'); 

// 1.Ottieni TUTTI i piatti 
exports.getAllDishes = async (req, res) => {
    try {
        const dishes = await Dish.find(); // Prende tutto dal database
        res.json(dishes);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero dei piatti', error: error.message });
    }
};

// 2.Ottieni un singolo piatto tramite ID
exports.getDishById = async (req, res) => {
    try {
        const dish = await Dish.findById(req.params.id);
        if (!dish) return res.status(404).json({ message: 'Piatto non trovato' });
        res.json(dish);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero del piatto', error: error.message });
    }
};