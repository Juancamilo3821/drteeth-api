const Payment = require('../models/paymentModel');

// Obtener todos los pagos
exports.obtenerPagos = (req, res) => {
  Payment.getAll((err, results) => {
    if (err) {
      console.error('Error al obtener pago:', err);
      return res.status(500).json({ error: 'Error del servidor' });
    }

    const pendientes = results.filter(p => p.estado === 'pendiente');
    const pagados = results.filter(p => p.estado === 'pagado');

    // 🔍 Log para ver qué se envía al frontend
    console.log('📤 Pagos enviados al frontend:');
    console.log({
      pendientes,
      pagados
    });

    res.status(200).json({
      pendientes,
      pagados
    });
  });
};
