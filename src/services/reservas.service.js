const repo = require('../repositories/reservas.repository');
const serviciosRepo = require('../repositories/servicios.repository');
const AppError = require('../errors/AppError');

async function listar() {
  return repo.listar();
}

async function obtener(id) {
  const reserva = await repo.buscarPorId(id);
  if (!reserva) throw new AppError(404, `Reserva con id ${id} no encontrada`);
  return reserva;
}

// Reglas de negocio comunes a crear y actualizar
async function verificarReglas(datos, excluirId = 0) {
  const servicio = await serviciosRepo.buscarPorId(datos.servicio_id);
  if (!servicio) throw new AppError(404, `Servicio con id ${datos.servicio_id} no existe`);
  if (!servicio.activo) {
    throw new AppError(409, `El servicio "${servicio.nombre}" no está disponible actualmente`);
  }

  if (datos.estado !== 'cancelada' && (await repo.existeChoque(datos.fecha, datos.hora, excluirId))) {
    throw new AppError(409, `Ya existe una reserva el ${datos.fecha} a las ${datos.hora}`);
  }
}

async function crear(datos) {
  await verificarReglas(datos);
  return repo.crear(datos);
}

async function actualizar(id, datos) {
  const actual = await obtener(id);
  if (actual.estado === 'cancelada' || actual.estado === 'completada') {
    throw new AppError(409, `No se puede modificar una reserva ${actual.estado}`);
  }
  await verificarReglas(datos, Number(id));
  return repo.actualizar(id, datos);
}

async function eliminar(id) {
  await obtener(id);
  await repo.eliminar(id);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
