// ¡dotenv primero para que todo lo demás vea las vars!
require('dotenv').config();

const express = require('express');
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const disabilitieRoutes = require('./routes/disabilitieRoutes');
const treatmentRoutes = require('./routes/treatmentRoutes');
const logger = require('./middleware/logger');
const testPush = require('./routes/testPush');


// Mantengo tu require original del cron (ya no ejecuta nada por carga)
require('./middleware/cronNotifications');

const { db, pool, ping } = require('./config/db');
const { startCron } = require('./middleware/cronNotifications');

const app = express();

// Middlewares
app.use(express.json());
app.use(logger);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api', appointmentRoutes); 
app.use('/api/disabilitie', disabilitieRoutes);
app.use('/api/treatment', treatmentRoutes);
app.use('/', testPush);


// Conexión a la base de datos (tu log original se conserva)
db.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos (conexión única):', err);
  } else {
    console.log('Conectado a la base de datos MySQL (conexión única)');
  }
});

// Iniciar server SOLO cuando la DB (pool) responde, y luego arrancar el cron
const PORT = process.env.PORT || 3000;

ping((err) => {
  if (err) {
    console.error('❌ Error en la inicialización de la base de datos (pool):', err);
    process.exit(1);
  } else {
    console.log('✅ Conexión a DB OK (pool)');
    // Arranca cron DESPUÉS de DB OK
    startCron(pool);

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  }
});
