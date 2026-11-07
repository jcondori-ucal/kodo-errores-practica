// Pruebas de errores controlados. Se simulan los repositorios (sin MySQL real).
jest.mock('../src/repositories/servicios.repository');
jest.mock('../src/repositories/reservas.repository');

const request = require('supertest');
const app = require('../src/app');
const serviciosRepo = require('../src/repositories/servicios.repository');
const reservasRepo = require('../src/repositories/reservas.repository');
const AppError = require('../src/errors/AppError');

const servicioOk = { id: 1, nombre: 'Cambio de aceite', precio: 120, duracion_min: 45, activo: 1 };
const reservaValida = {
  servicio_id: 1,
  nombre_cliente: 'Ana Pérez',
  placa: 'ABC-123',
  fecha: '2026-12-10',
  hora: '10:00',
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('400 - validaciones y JSON mal formado', () => {
  test('POST /api/servicios con body vacío devuelve 400 con errores por campo', async () => {
    const res = await request(app).post('/api/servicios').send({});
    expect(res.status).toBe(400);
    expect(res.body.estado).toBe(400);
    expect(res.body.errores.length).toBeGreaterThan(0);
    expect(res.body.errores[0]).toHaveProperty('campo');
  });

  test('GET /api/servicios/abc devuelve 400 (id no numérico)', async () => {
    const res = await request(app).get('/api/servicios/abc');
    expect(res.status).toBe(400);
  });

  test('JSON mal formado devuelve 400 y no 500', async () => {
    const res = await request(app)
      .post('/api/servicios')
      .set('Content-Type', 'application/json')
      .send('{"nombre": ');
    expect(res.status).toBe(400);
    expect(res.body.mensaje).toMatch(/JSON/);
  });

  test('placa inválida devuelve 400', async () => {
    const res = await request(app).post('/api/reservas').send({ ...reservaValida, placa: '!!' });
    expect(res.status).toBe(400);
    expect(res.body.errores.some((e) => e.campo === 'placa')).toBe(true);
  });
});

describe('404 - recurso inexistente y ruta no definida', () => {
  test('GET /api/servicios/9999 devuelve 404', async () => {
    serviciosRepo.buscarPorId.mockResolvedValue(null);
    const res = await request(app).get('/api/servicios/9999');
    expect(res.status).toBe(404);
    expect(res.body.mensaje).toBe('Servicio con id 9999 no encontrado');
  });

  test('PUT /api/reservas/9999 devuelve 404', async () => {
    reservasRepo.buscarPorId.mockResolvedValue(null);
    const res = await request(app).put('/api/reservas/9999').send(reservaValida);
    expect(res.status).toBe(404);
  });

  test('ruta mal escrita devuelve 404 en JSON (no el HTML por defecto de Express)', async () => {
    const res = await request(app).get('/api/serviciox');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body.mensaje).toBe('La ruta GET /api/serviciox no existe');
  });

  test('reserva con servicio_id inexistente devuelve 404', async () => {
    serviciosRepo.buscarPorId.mockResolvedValue(null);
    const res = await request(app).post('/api/reservas').send({ ...reservaValida, servicio_id: 9999 });
    expect(res.status).toBe(404);
  });
});

describe('409 - conflictos de negocio', () => {
  test('nombre de servicio duplicado devuelve 409', async () => {
    serviciosRepo.crear.mockRejectedValue(new AppError(409, 'Ya existe un servicio con ese nombre'));
    const res = await request(app)
      .post('/api/servicios')
      .send({ nombre: 'Cambio de aceite', precio: 100, duracion_min: 30 });
    expect(res.status).toBe(409);
  });

  test('eliminar servicio con reservas devuelve 409', async () => {
    serviciosRepo.buscarPorId.mockResolvedValue(servicioOk);
    serviciosRepo.eliminar.mockRejectedValue(
      new AppError(409, 'No se puede eliminar el servicio porque tiene reservas asociadas')
    );
    const res = await request(app).delete('/api/servicios/1');
    expect(res.status).toBe(409);
  });

  test('choque de fecha y hora devuelve 409', async () => {
    serviciosRepo.buscarPorId.mockResolvedValue(servicioOk);
    reservasRepo.existeChoque.mockResolvedValue(true);
    const res = await request(app).post('/api/reservas').send(reservaValida);
    expect(res.status).toBe(409);
    expect(res.body.mensaje).toMatch(/Ya existe una reserva/);
  });

  test('servicio inactivo devuelve 409', async () => {
    serviciosRepo.buscarPorId.mockResolvedValue({ ...servicioOk, activo: 0 });
    const res = await request(app).post('/api/reservas').send(reservaValida);
    expect(res.status).toBe(409);
  });

  test('modificar una reserva cancelada devuelve 409', async () => {
    reservasRepo.buscarPorId.mockResolvedValue({ id: 5, estado: 'cancelada' });
    const res = await request(app).put('/api/reservas/5').send(reservaValida);
    expect(res.status).toBe(409);
  });
});

describe('500 - errores inesperados', () => {
  test('el 500 responde mensaje genérico y NO filtra detalles internos', async () => {
    const res = await request(app).get('/api/_prueba/error-500');
    expect(res.status).toBe(500);
    expect(res.body.mensaje).toBe('Error interno del servidor');
    expect(JSON.stringify(res.body)).not.toMatch(/secreto123|stack|at /);
  });

  test('fallo de la base de datos devuelve 500 genérico', async () => {
    serviciosRepo.listar.mockRejectedValue(new Error('connect ECONNREFUSED 127.0.0.1:3306'));
    const res = await request(app).get('/api/servicios');
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toMatch(/ECONNREFUSED|3306/);
  });
});

describe('Respuesta de error estandarizada', () => {
  test('todas las respuestas de error tienen estado, mensaje, errores, ruta y fecha', async () => {
    const res = await request(app).get('/api/no-existe');
    expect(Object.keys(res.body).sort()).toEqual(['errores', 'estado', 'fecha', 'mensaje', 'ruta']);
  });
});

describe('Casos felices (control)', () => {
  test('GET /api/servicios devuelve 200', async () => {
    serviciosRepo.listar.mockResolvedValue([servicioOk]);
    const res = await request(app).get('/api/servicios');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('DELETE existente devuelve 204', async () => {
    serviciosRepo.buscarPorId.mockResolvedValue(servicioOk);
    serviciosRepo.eliminar.mockResolvedValue(true);
    const res = await request(app).delete('/api/servicios/1');
    expect(res.status).toBe(204);
  });

  test('POST reserva válida devuelve 201', async () => {
    serviciosRepo.buscarPorId.mockResolvedValue(servicioOk);
    reservasRepo.existeChoque.mockResolvedValue(false);
    reservasRepo.crear.mockResolvedValue({ id: 3, ...reservaValida });
    const res = await request(app).post('/api/reservas').send(reservaValida);
    expect(res.status).toBe(201);
  });
});
