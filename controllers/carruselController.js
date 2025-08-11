const { pool } = require('../config/db');
const db = pool; 
const bcrypt = require('bcrypt');

// OBTENER IMÁGENES DEL CARRUSEL
exports.getCarruselImagenes = (req, res) => {
  const query = 'SELECT * FROM carrusel_imagenes';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener imágenes del carrusel:', err);
      return res.status(500).json({ error: 'Error al obtener imágenes' });
    }

    res.status(200).json({ imagenes: results });
  });
};