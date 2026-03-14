const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/config');

// Función para INICIAR SESIÓN (Login)
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Debes enviar username y password' });
  }

  try {
    // 1. Buscar si el usuario existe en la base de datos
    const userQuery = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (userQuery.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const user = userQuery.rows[0];
    const isAdmin = user.username === 'admin';

    // 2. Comparar contraseña: soporta hash bcrypt o texto plano legado
    const looksLikeBcrypt = typeof user.password === 'string' && user.password.startsWith('$2');
    const validPassword = looksLikeBcrypt
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!validPassword) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // 3. Si todo es correcto, crear el Token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '2h' } // El token expira en 2 horas
    );

    // 4. Enviar respuesta al Frontend
    res.json({
      message: 'Inicio de sesión exitoso',
      token: token,
      user: { id: user.id, username: user.username, isAdmin }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Función para REGISTRAR usuario (Solo para crear usuarios de prueba)
const register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

module.exports = { login, register };