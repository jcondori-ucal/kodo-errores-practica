const AppError = require('../errors/AppError');

// Se registra DESPUÉS de todas las rutas y ANTES del errorHandler.
// Si una petición llega hasta aquí, ninguna ruta la atendió.
function notFound(req, res, next) {
  next(new AppError(404, `La ruta ${req.method} ${req.originalUrl} no existe`));
}

module.exports = notFound;
