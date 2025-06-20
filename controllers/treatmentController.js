const Treatment = require('../models/treatmentModel');

exports.obtenerTratamientos = (req, res) => {
  const email = req.user.email;

  Treatment.getByUserEmail(email, (err, results) => {
    if (err) {
      console.error('Error al obtener tratamientos:', err);
      return res.status(500).json({ error: 'Error al obtener los tratamientos' });
    }

    const tratamientosFormateados = results.map(item => ({
      id: item.idTratamiento,
      nombre: item.nombre,
      estado: item.estado,
      fecha_inicio: item.fecha_inicio,
      fecha_fin: item.fecha_fin,
      descripcion: item.descripcion,
      doctor: {
        nombre: item.nombre_odontologo,
        especialidad: item.especialidad_odontologo,
        direccion_consultorio: item.direccion_consultorio
      },
      medicamento: item.nombre_medicamento ? {
        nombre: item.nombre_medicamento,
        dosis: item.dosis,
        frecuenciaHoras: item.frecuenciaHoras
      } : null
    }));

    res.status(200).json(tratamientosFormateados);
  });
};