const db = require('../config/db');

const Payment = {
  getAll: (callback) => {
    const query = 'SELECT * FROM pago';
    db.query(query, callback);
  },

  getById: (idPago, callback) => {
    const query = 'SELECT * FROM pago WHERE idPago = ?';
    db.query(query, [idPago], callback);
  },

  create: (data, callback) => {
    const query = `
      INSERT INTO pago (titulo, descripcion, estado, monto, fecha_pago)
      VALUES (?, ?, ?, ?, ?)`;
    const values = [
      data.titulo,
      data.descripcion,
      data.estado,
      data.monto,
      data.fecha_pago
    ];
    db.query(query, values, callback);
  }
};

module.exports = Payment;
