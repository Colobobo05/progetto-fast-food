const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

// Tutte le azioni sul profilo richiedono che l'utente sia loggato 
router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, userController.updateProfile);
router.delete('/profile', verifyToken, userController.deleteProfile);

module.exports = router;