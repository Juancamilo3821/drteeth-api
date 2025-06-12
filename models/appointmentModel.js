const db = require('../config/db');

const Appointment = {
  getAll: (callback) => {
    const query = `
      SELECT 
        citas.*, 
        perfil_odontologo.nombre AS nombre_odontologo,
        perfil_odontologo.especialidad AS especialidad_odontologo,
        perfil_odontologo.direccion_consultorio
      FROM citas
      JOIN perfil_odontologo 
        ON citas.Perfil_Odontologo_idPerfil_Odontologo = perfil_odontologo.idPerfil_Odontologo
    `;
    db.query(query, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  }
};

module.exports = Appointment;
