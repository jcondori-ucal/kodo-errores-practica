const AppError = require('../errors/AppError');

// Middleware de errores: Express lo reconoce por tener 4 parámetros.
// Debe registrarse AL FINAL, después de las rutas y del middleware notFound.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let estado = 500;
  let mensaje = 'Error interno del servidor';
  let errores = [];

  if (err instanceof AppError) {
    estado = err.statusCode;
    mensaje = err.message;
    errores = err.errores;
  } else if (err.type === 'entity.parse.failed') {
    estado = 400;
    mensaje = 'El cuerpo de la solicitud no es un JSON válido';
  } else if (err.type === 'entity.too.large') {
    estado = 413;
    mensaje = 'El cuerpo de la solicitud es demasiado grande';
  } else {
    // Error no esperado: el detalle se registra en el servidor, NUNCA se envía al cliente.
    console.error('[ERROR NO CONTROLADO]', req.method, req.originalUrl, err);
  }

  res.status(estado).json({
    estado,
    mensaje,
    errores,
    ruta: req.originalUrl,
    fecha: new Date().toISOString(),
  });
}

module.exports = errorHandler;
