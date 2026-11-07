// ANTES (punto de partida): cada controlador decide por su cuenta
// qué responder ante un error. Problemas:
//   1) Código repetido en cada método.
//   2) Formatos de error distintos según el endpoint.
//   3) Todo error se convierte en 500 (un id inexistente no debería serlo).
//   4) error.message puede filtrar información interna (consultas, host, credenciales).
//   5) Rutas inexistentes responden con el HTML por defecto de Express.
//
// Autoestudio: ¿qué harías en este caso? Antes de ejecutarlo, piensa qué responde
// GET /api/servicios/9999 con este código. Luego refactoriza usando AppError + next(error).

const repo = require('../src/repositories/servicios.repository');

async function obtener(req, res) {
  try {
    const servicio = await repo.buscarPorId(req.params.id);
    if (!servicio) {
      return res.status(404).send('no existe'); // texto plano, formato distinto
    }
    res.json(servicio);
  } catch (error) {
    res.status(500).json({ error: error.message }); // <- puede filtrar detalles internos
  }
}

module.exports = { obtener };
