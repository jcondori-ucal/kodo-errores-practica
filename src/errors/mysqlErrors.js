const AppError = require('./AppError');

// Traduce errores técnicos de MySQL a errores controlados (AppError).
// Lo que no se reconoce se devuelve tal cual y terminará como 500 genérico.
function traducirErrorMySQL(err, mensajes = {}) {
  if (err instanceof AppError) return err;

  switch (err.code) {
    case 'ER_DUP_ENTRY':
      return new AppError(409, mensajes.duplicado || 'Ya existe un registro con esos datos');
    case 'ER_ROW_IS_REFERENCED_2':
      return new AppError(
        409,
        mensajes.referenciado || 'No se puede eliminar: tiene registros asociados'
      );
    case 'ER_NO_REFERENCED_ROW_2':
      return new AppError(404, mensajes.sinReferencia || 'El registro relacionado no existe');
    default:
      return err;
  }
}

module.exports = { traducirErrorMySQL };
