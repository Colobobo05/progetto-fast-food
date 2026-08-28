// backend/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, isRistoratore } = require('../middleware/auth');

// Rotta PUBBLICA: Questa NON ha il verifyToken ed è la prima della lista
router.get('/bestsellers', orderController.getBestsellers);

// Rotte per il CLIENTE
router.post('/', verifyToken, orderController.createOrder);
router.get('/my-orders', verifyToken, orderController.getCustomerOrders);

// Il cliente conferma la ricezione 
router.put('/:orderId/confirm-delivery', verifyToken, orderController.confirmDelivery);

// Rotte per il RISTORATORE
router.get('/restaurant', verifyToken, isRistoratore, orderController.getRestaurantOrders);
router.put('/:orderId/status', verifyToken, isRistoratore, orderController.updateOrderStatus);
router.get('/restaurant/stats', verifyToken, isRistoratore, orderController.getRestaurantStats);
module.exports = router;