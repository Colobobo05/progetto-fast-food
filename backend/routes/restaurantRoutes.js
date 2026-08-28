const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { verifyToken, isRistoratore } = require('../middleware/auth');

// rotte fisse 
router.get('/', restaurantController.getAllRestaurants);
router.get('/meals', restaurantController.getCommonMeals);
router.post('/setup', verifyToken, restaurantController.setupRestaurant);

//rotte menu
router.get('/my-menu', verifyToken, isRistoratore, restaurantController.getMyMenu);
router.delete('/menu/:dishId', verifyToken, isRistoratore, restaurantController.deleteDish);
router.post('/menu/custom', verifyToken, isRistoratore, restaurantController.addCustomDish);

//rotte id 
router.get('/:id', restaurantController.getRestaurantById);
router.get('/:id/menu', restaurantController.getRestaurantMenu);

module.exports = router;