const { Router } = require('express');
const controller = require('../controllers/usuarios.controller');
const { autenticar, autorizar } = require('../middleware/auth');

const router = Router();

router.use(autenticar, autorizar('admin'));
router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

module.exports = router;
