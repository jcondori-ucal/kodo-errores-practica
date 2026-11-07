const { validationResult } = require('express-validator');
const AppError = require('../errors/AppError');

// Convierte los errores de express-validator (semana 9) en un AppError 400
// para que los atienda el mismo errorHandler que el resto de errores.
function validate(req, res, next) {
  const resultado = validationResult(req);
  if (resultado.isEmpty()) return next();

  const errores = resultado.array().map((e) => ({ campo: e.path, mensaje: e.msg }));
  next(new AppError(400, 'Datos de entrada inválidos', errores));
}

module.exports = validate;
