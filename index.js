const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();

// Middlewares
app.use(cors()); // Permite peticiones del frontend
app.use(express.json()); // Permite leer datos en formato JSON (como el req.body)

// Rutas base
app.use('/api/auth', authRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de AgriPres corriendo en http://localhost:${PORT}`);
});
