const { body, param } = require('express-validator');

const validarId = [param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo')];

const validarServicio = [
  body('nombre')
    .isString().withMessage('El nombre es obligatorio')
    .bail()
    .trim()
    .isLength({ min: 3, max: 60 }).withMessage('El nombre debe tener entre 3 y 60 caracteres'),
  body('descripcion')
    .optional({ nullable: true })
    .isString().withMessage('La descripción debe ser texto')
    .bail()
    .isLength({ max: 200 }).withMessage('La descripción admite máximo 200 caracteres'),
  body('precio')
    .isFloat({ gt: 0 }).withMessage('El precio debe ser un número mayor a 0'),
  body('duracion_min')
    .isInt({ min: 5, max: 480 }).withMessage('La duración debe ser un entero entre 5 y 480 minutos'),
  body('activo')
    .optional()
    .isBoolean().withMessage('activo debe ser true o false'),
];

module.exports = { validarId, validarServicio };
