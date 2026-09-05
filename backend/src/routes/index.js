const { Router } = require('express');
const authRoutes = require('./auth.routes');
const usuariosRoutes = require('./usuarios.routes');
const peliculasRoutes = require('./peliculas.routes');
const clientesRoutes = require('./clientes.routes');
const rentasRoutes = require('./rentas.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/peliculas', peliculasRoutes);
router.use('/clientes', clientesRoutes);
router.use('/rentas', rentasRoutes);

module.exports = router;
