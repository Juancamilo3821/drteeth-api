const db = require('../config/db');
const bcrypt = require('bcrypt');
const { generateToken } = require('../middleware/authToken');

// REGISTRO DE USUARIO
exports.register = async (req, res) => {
  const {
    nombre,
    apellidos,
    correo,
    telefono,
    password,
    tipoDocumento,
    numeroDocumento
  } = req.body;

  if (!nombre || !apellidos || !correo || !telefono || !password || !tipoDocumento || !numeroDocumento) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO usuario (
        nombre, apellidos, correo, telefono, password, tipoDocumento, numeroDocumento
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      query,
      [nombre, apellidos, correo, telefono, hashedPassword, tipoDocumento, numeroDocumento],
      (err, result) => {
        if (err) {
          console.error('❌ Error al registrar usuario:', err);
          return res.status(500).json({ error: 'Error al registrar usuario' });
        }
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
      }
    );
  } catch (err) {
    console.error('❌ Error interno:', err);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

// LOGIN DE USUARIO
exports.login = (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ error: 'Correo y contraseña requeridos' });
  }

  const query = 'SELECT * FROM usuario WHERE correo = ?';

  db.query(query, [correo], async (err, results) => {
    if (err) {
      console.error('❌ Error en la base de datos:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = generateToken({ email: user.correo });
    console.log('🔐 Token generado:', token);

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.idUsuario,
        nombre: user.nombre,
        correo: user.correo
      }
    });
  });
};

// CARRUSEL
exports.getCarruselImagenes = (req, res) => {
  const query = 'SELECT * FROM carrusel_imagenes';

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener imágenes del carrusel:', err);
      return res.status(500).json({ error: 'Error al obtener imágenes' });
    }

    res.status(200).json({ imagenes: results });
  });
};
