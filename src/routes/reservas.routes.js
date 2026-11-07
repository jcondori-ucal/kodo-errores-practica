const { Router } = require('express');
const c = require('../controllers/reservas.controller');
const validate = require('../middlewares/validate');
const { validarId } = require('../validators/servicios.validator');
const { validarReserva } = require('../validators/reservas.validator');

const router = Router();

router.get('/', c.listar);
router.get('/:id', validarId, validate, c.obtener);
router.post('/', validarReserva, validate, c.crear);
router.put('/:id', validarId, validarReserva, validate, c.actualizar);
router.delete('/:id', validarId, validate, c.eliminar);

module.exports = router;
