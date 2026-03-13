const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');

// Definir las rutas
router.post('/login', login);
router.post('/register', register); // Usa esta ruta solo para crear tus usuarios de prueba

module.exports = router;
