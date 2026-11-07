const { body } = require('express-validator');

const ESTADOS = ['pendiente', 'confirmada', 'cancelada', 'completada'];

const validarReserva = [
  body('servicio_id')
    .isInt({ min: 1 }).withMessage('servicio_id debe ser un entero positivo'),
  body('nombre_cliente')
    .isString().withMessage('El nombre del cliente es obligatorio')
    .bail()
    .trim()
    .isLength({ min: 3, max: 80 }).withMessage('El nombre debe tener entre 3 y 80 caracteres'),
  body('placa')
    .isString().withMessage('La placa es obligatoria')
    .bail()
    .matches(/^[A-Za-z0-9]{3}-?[A-Za-z0-9]{3}$/).withMessage('La placa debe tener formato ABC123 o ABC-123')
    .customSanitizer((v) => v.replace('-', '')),
  body('fecha')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('La fecha debe tener formato YYYY-MM-DD')
    .bail()
    .isISO8601({ strict: true }).withMessage('La fecha no es válida'),
  body('hora')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('La hora debe tener formato HH:MM (24 h)'),
  body('estado')
    .optional()
    .isIn(ESTADOS).withMessage(`El estado debe ser uno de: ${ESTADOS.join(', ')}`),
];

module.exports = { validarReserva };
