const repo = require('../repositories/servicios.repository');
const AppError = require('../errors/AppError');

async function listar() {
  return repo.listar();
}

// PUNTO 6: recurso inexistente -> 404
async function obtener(id) {
  const servicio = await repo.buscarPorId(id);
  if (!servicio) throw new AppError(404, `Servicio con id ${id} no encontrado`);
  return servicio;
}

async function crear(datos) {
  return repo.crear(datos); // un nombre repetido sale como 409 desde el repositorio
}

async function actualizar(id, datos) {
  await obtener(id);
  return repo.actualizar(id, datos);
}

async function eliminar(id) {
  await obtener(id);
  await repo.eliminar(id); // con reservas asociadas sale como 409 desde el repositorio
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
