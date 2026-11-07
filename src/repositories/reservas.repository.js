const pool = require('../config/db');
const { traducirErrorMySQL } = require('../errors/mysqlErrors');

const SELECT_BASE = `
  SELECT r.id, r.servicio_id, s.nombre AS servicio, r.nombre_cliente, r.placa,
         r.fecha, r.hora, r.estado
  FROM reservas r
  JOIN servicios s ON s.id = r.servicio_id`;

async function listar() {
  const [filas] = await pool.execute(`${SELECT_BASE} ORDER BY r.fecha, r.hora`);
  return filas;
}

async function buscarPorId(id) {
  const [filas] = await pool.execute(`${SELECT_BASE} WHERE r.id = ?`, [id]);
  return filas[0] || null;
}

// ¿Existe otra reserva activa en la misma fecha y hora? (el taller atiende 1 vehículo por turno)
async function existeChoque(fecha, hora, excluirId = 0) {
  const [filas] = await pool.execute(
    `SELECT id FROM reservas
     WHERE fecha = ? AND hora = ? AND estado <> 'cancelada' AND id <> ?
     LIMIT 1`,
    [fecha, hora, excluirId]
  );
  return filas.length > 0;
}

async function crear({ servicio_id, nombre_cliente, placa, fecha, hora, estado }) {
  try {
    const [r] = await pool.execute(
      'INSERT INTO reservas (servicio_id, nombre_cliente, placa, fecha, hora, estado) VALUES (?, ?, ?, ?, ?, ?)',
      [servicio_id, nombre_cliente, placa.toUpperCase(), fecha, hora, estado || 'pendiente']
    );
    return buscarPorId(r.insertId);
  } catch (err) {
    throw traducirErrorMySQL(err);
  }
}

async function actualizar(id, { servicio_id, nombre_cliente, placa, fecha, hora, estado }) {
  try {
    await pool.execute(
      `UPDATE reservas
       SET servicio_id = ?, nombre_cliente = ?, placa = ?, fecha = ?, hora = ?, estado = ?
       WHERE id = ?`,
      [servicio_id, nombre_cliente, placa.toUpperCase(), fecha, hora, estado || 'pendiente', id]
    );
    return buscarPorId(id);
  } catch (err) {
    throw traducirErrorMySQL(err);
  }
}

async function eliminar(id) {
  const [r] = await pool.execute('DELETE FROM reservas WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

module.exports = { listar, buscarPorId, existeChoque, crear, actualizar, eliminar };
