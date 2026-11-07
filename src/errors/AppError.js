// Error "esperado" de la aplicación: lleva su propio código HTTP y mensaje seguro.
class AppError extends Error {
  constructor(statusCode, message, errores = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errores = errores;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
