const pool = require('../config/db');
const { traducirErrorMySQL } = require('../errors/mysqlErrors');

const MENSAJES = {
  duplicado: 'Ya existe un servicio con ese nombre',
  referenciado: 'No se puede eliminar el servicio porque tiene reservas asociadas',
};

async function listar() {
  const [filas] = await pool.execute('SELECT * FROM servicios ORDER BY id');
  return filas;
}

async function buscarPorId(id) {
  const [filas] = await pool.execute('SELECT * FROM servicios WHERE id = ?', [id]);
  return filas[0] || null;
}

async function crear({ nombre, descripcion, precio, duracion_min, activo }) {
  try {
    const [r] = await pool.execute(
      'INSERT INTO servicios (nombre, descripcion, precio, duracion_min, activo) VALUES (?, ?, ?, ?, ?)',
      [nombre, descripcion ?? null, precio, duracion_min, activo === false ? 0 : 1]
    );
    return buscarPorId(r.insertId);
  } catch (err) {
    throw traducirErrorMySQL(err, MENSAJES);
  }
}

async function actualizar(id, { nombre, descripcion, precio, duracion_min, activo }) {
  try {
    await pool.execute(
      'UPDATE servicios SET nombre = ?, descripcion = ?, precio = ?, duracion_min = ?, activo = ? WHERE id = ?',
      [nombre, descripcion ?? null, precio, duracion_min, activo === false ? 0 : 1, id]
    );
    return buscarPorId(id);
  } catch (err) {
    throw traducirErrorMySQL(err, MENSAJES);
  }
}

async function eliminar(id) {
  try {
    const [r] = await pool.execute('DELETE FROM servicios WHERE id = ?', [id]);
    return r.affectedRows > 0;
  } catch (err) {
    throw traducirErrorMySQL(err, MENSAJES);
  }
}

module.exports = { listar, buscarPorId, crear, actualizar, eliminar };
