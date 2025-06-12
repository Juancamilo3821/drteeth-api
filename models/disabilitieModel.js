const db = require('../config/db');

const Disabilitie = {
  getAll: (callback) => {
    const query = `
      SELECT 
        incapacidad.*, 
        perfil_odontologo.nombre AS nombre_odontologo,
        perfil_odontologo.especialidad AS especialidad_odontologo,
        perfil_odontologo.direccion_consultorio
      FROM incapacidad
      JOIN perfil_odontologo 
        ON incapacidad.Perfil_Odontologo_idPerfil_Odontologo = perfil_odontologo.idPerfil_Odontologo
    `;

    db.query(query, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }
};

module.exports = Disabilitie;
