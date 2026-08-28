const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Endpoint per la ricerca 
router.get('/restaurants', searchController.searchRestaurants);
router.get('/dishes', searchController.searchDishes);

module.exports = router;