const express = require('express');
const serviciosRoutes = require('./routes/servicios.routes');
const reservasRoutes = require('./routes/reservas.routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json({ limit: '10kb' }));

app.get('/api/salud', (req, res) => res.json({ estado: 'ok' }));

app.use('/api/servicios', serviciosRoutes);
app.use('/api/reservas', reservasRoutes);

// Solo para práctica: fuerza un error inesperado para comprobar que el 500 no filtra detalles.
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/_prueba/error-500', () => {
    throw new Error('Fallo simulado: password de BD = secreto123 (esto NO debe llegar al cliente)');
  });
}

// ORDEN IMPORTA: rutas -> notFound -> errorHandler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
