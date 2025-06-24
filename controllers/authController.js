const db = require('../config/db');
const bcrypt = require('bcrypt');
const { generateToken, verifyToken } = require('../middleware/authToken');
const User = require('../models/userModel');

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

// GET USER PROFILE (by token)
exports.getProfile = (req, res) => {
  const email = req.user.email;
  console.log('📨 Email desde el token:', email);

  User.getProfileByEmail(email, (err, user) => {
    if (err) {
      console.error('❌ Error al obtener perfil:', err);
      return res.status(500).json({ error: 'Error al obtener perfil del usuario' });
    }
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log('📦 Datos del usuario encontrados:', user);
    res.status(200).json(user);
  });
};

// EDITAR INFORMACIÓN DEL USUARIO
exports.updateProfile = async (req, res) => {
  const oldEmail = req.user.email;
  const { telefono, correo, avatar, password } = req.body;

  if (!telefono || !correo || avatar === undefined) {
    return res.status(400).json({ error: 'Faltan campos requeridos (telefono, correo, avatar)' });
  }

  try {
    let query, params;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `
        UPDATE usuario
        SET telefono = ?, correo = ?, avatar = ?, password = ?
        WHERE correo = ?
      `;
      params = [telefono, correo, avatar, hashedPassword, oldEmail];
    } else {
      query = `
        UPDATE usuario
        SET telefono = ?, correo = ?, avatar = ?
        WHERE correo = ?
      `;
      params = [telefono, correo, avatar, oldEmail];
    }

    db.query(query, params, (err, result) => {
      if (err) {
        console.error('❌ Error al actualizar usuario:', err);
        return res.status(500).json({ error: 'Error al actualizar perfil' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado para actualizar' });
      }

      // Generar nuevo token si cambia el correo
      const newToken = generateToken({ email: correo });
      console.log('🔄 Nuevo token generado:', newToken);

      res.status(200).json({
        message: 'Perfil actualizado exitosamente',
        token: newToken
      });
    });
  } catch (error) {
    console.error('❌ Error en updateProfile:', error);
    res.status(500).json({ error: 'Error al procesar solicitud' });
  }
};
