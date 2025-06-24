const db = require('../config/db');

const User = {
  getProfileByEmail: (email, callback) => {
    const query = `
      SELECT 
        nombre,
        apellidos,
        correo,
        telefono,
        tipoDocumento,
        numeroDocumento,
        avatar
      FROM usuario
      WHERE correo = ?
      LIMIT 1
    `;
    db.query(query, [email], (err, results) => {
      if (err) return callback(err, null);
      if (results.length === 0) return callback(null, null);
      callback(null, results[0]);
    });
  }
};

module.exports = User;
