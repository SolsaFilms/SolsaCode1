const { Router } = require('express');
const controller = require('../controllers/rentas.controller');
const { autenticar, autorizar } = require('../middleware/auth');

const router = Router();

router.use(autenticar);
router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', autorizar('admin', 'empleado'), controller.crear);
router.patch('/:id/devolver', autorizar('admin', 'empleado'), controller.devolver);
router.put('/:id', autorizar('admin', 'empleado'), controller.actualizar);
router.delete('/:id', autorizar('admin'), controller.eliminar);

module.exports = router;
