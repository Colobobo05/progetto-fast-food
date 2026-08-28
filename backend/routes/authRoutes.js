const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Definizione degli endpoint REST
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;