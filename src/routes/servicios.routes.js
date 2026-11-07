const { Router } = require('express');
const c = require('../controllers/servicios.controller');
const validate = require('../middlewares/validate');
const { validarId, validarServicio } = require('../validators/servicios.validator');

const router = Router();

router.get('/', c.listar);
router.get('/:id', validarId, validate, c.obtener);
router.post('/', validarServicio, validate, c.crear);
router.put('/:id', validarId, validarServicio, validate, c.actualizar);
router.delete('/:id', validarId, validate, c.eliminar);

module.exports = router;
