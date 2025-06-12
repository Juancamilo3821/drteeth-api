const db = require('../config/db');
const Appointment = require('../models/appointmentModel');

exports.obtenerCitas = (req, res) => {
  Appointment.getAll((err, results) => {
    if (err) {
      console.error('Error al obtener citas:', err);
      return res.status(500).json({ error: 'Error al obtener las citas' });
    }

    // Formatear citas: convertir fechas y organizar la info del doctor
    const citasFormateadas = results.map(cita => {
      let fechaHoraFormateada = null;

      if (cita.fecha_hora) {
        const fecha = new Date(cita.fecha_hora);
        if (!isNaN(fecha)) {
          fechaHoraFormateada = fecha.toISOString(); // ISO 8601 format
        } else {
          console.warn('Fecha inválida detectada:', cita.fecha_hora);
        }
      }

      return {
        id: cita.idCita,
        titulo: cita.titulo,
        estado: cita.estado,
        fecha_hora: fechaHoraFormateada,
        doctor: {
          nombre: cita.nombre_odontologo,
          especialidad: cita.especialidad_odontologo,
          direccion_consultorio: cita.direccion_consultorio
        }
      };
    });

    console.log('Citas enviadas al cliente:', citasFormateadas);
    res.json(citasFormateadas);
  });
};
