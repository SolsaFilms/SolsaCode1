const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const api = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, servicio: 'SolsaFilms API', estado: 'activo' });
});

app.use('/api', api);

app.use((req, res) => {
  res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada' });
});

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`SolsaFilms API escuchando en http://localhost:${env.port}`);
});
