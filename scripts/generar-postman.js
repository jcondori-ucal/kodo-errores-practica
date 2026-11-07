// Genera postman/Kodo_Errores.postman_collection.json a partir de la lista de casos.
// Uso: npm run postman
const fs = require('fs');
const path = require('path');

const reservaOk = {
  servicio_id: 1,
  nombre_cliente: 'Ana Pérez',
  placa: 'ABC-123',
  fecha: '2026-12-10',
  hora: '10:00',
};

// Datos de ejemplo del schema.sql: servicio 1 existe y tiene reservas; el 4 está inactivo;
// ya hay una reserva el 2026-12-01 a las 09:00.
const casos = [
  { carpeta: '0. Control (casos felices)', nombre: 'Listar servicios', metodo: 'GET', url: '/api/servicios', esperado: 200 },
  { carpeta: '0. Control (casos felices)', nombre: 'Obtener servicio 1', metodo: 'GET', url: '/api/servicios/1', esperado: 200 },

  { carpeta: '1. Error 400 - Bad Request', nombre: 'Body vacío al crear servicio', metodo: 'POST', url: '/api/servicios', body: {}, esperado: 400 },
  { carpeta: '1. Error 400 - Bad Request', nombre: 'Id no numérico', metodo: 'GET', url: '/api/servicios/abc', esperado: 400 },
  { carpeta: '1. Error 400 - Bad Request', nombre: 'JSON mal formado', metodo: 'POST', url: '/api/servicios', raw: '{"nombre": ', esperado: 400 },
  { carpeta: '1. Error 400 - Bad Request', nombre: 'Placa inválida en reserva', metodo: 'POST', url: '/api/reservas', body: { ...reservaOk, placa: '!!' }, esperado: 400 },

  { carpeta: '2. Error 404 - Not Found', nombre: 'Servicio inexistente', metodo: 'GET', url: '/api/servicios/9999', esperado: 404 },
  { carpeta: '2. Error 404 - Not Found', nombre: 'Reserva inexistente (PUT)', metodo: 'PUT', url: '/api/reservas/9999', body: reservaOk, esperado: 404 },
  { carpeta: '2. Error 404 - Not Found', nombre: 'Reserva con servicio_id inexistente', metodo: 'POST', url: '/api/reservas', body: { ...reservaOk, servicio_id: 9999 }, esperado: 404 },
  { carpeta: '2. Error 404 - Not Found', nombre: 'Ruta mal escrita', metodo: 'GET', url: '/api/serviciox', esperado: 404 },

  { carpeta: '3. Error 409 - Conflict', nombre: 'Nombre de servicio duplicado', metodo: 'POST', url: '/api/servicios', body: { nombre: 'Cambio de aceite', precio: 100, duracion_min: 30 }, esperado: 409 },
  { carpeta: '3. Error 409 - Conflict', nombre: 'Eliminar servicio con reservas', metodo: 'DELETE', url: '/api/servicios/1', esperado: 409 },
  { carpeta: '3. Error 409 - Conflict', nombre: 'Choque de fecha y hora', metodo: 'POST', url: '/api/reservas', body: { ...reservaOk, fecha: '2026-12-01', hora: '09:00' }, esperado: 409 },
  { carpeta: '3. Error 409 - Conflict', nombre: 'Reservar servicio inactivo', metodo: 'POST', url: '/api/reservas', body: { ...reservaOk, servicio_id: 4 }, esperado: 409 },

  { carpeta: '4. Error 500 - Inesperado', nombre: 'Error forzado (no filtra detalles)', metodo: 'GET', url: '/api/_prueba/error-500', esperado: 500, genericoSolo: true },
];

function testScript(c) {
  const lineas = [
    `pm.test('Código ${c.esperado}', () => pm.response.to.have.status(${c.esperado}));`,
  ];
  if (c.esperado >= 400) {
    lineas.push(
      `pm.test('Formato de error estándar', () => {`,
      `  const j = pm.response.json();`,
      `  pm.expect(j).to.have.all.keys('estado','mensaje','errores','ruta','fecha');`,
      `  pm.expect(j.estado).to.eql(${c.esperado});`,
      `});`,
      `pm.test('No expone información interna', () => {`,
      `  pm.expect(pm.response.text()).to.not.match(/stack|ECONNREFUSED|secreto123|node_modules/);`,
      `});`
    );
  }
  return lineas;
}

function item(c) {
  const req = {
    method: c.metodo,
    header: [],
    url: { raw: `{{baseUrl}}${c.url}`, host: ['{{baseUrl}}'], path: c.url.split('/').filter(Boolean) },
  };
  if (c.body !== undefined || c.raw !== undefined) {
    req.header.push({ key: 'Content-Type', value: 'application/json' });
    req.body = {
      mode: 'raw',
      raw: c.raw !== undefined ? c.raw : JSON.stringify(c.body, null, 2),
      options: { raw: { language: 'json' } },
    };
  }
  return {
    name: `${c.nombre} -> ${c.esperado}`,
    request: req,
    event: [{ listen: 'test', script: { type: 'text/javascript', exec: testScript(c) } }],
  };
}

const carpetas = [];
for (const c of casos) {
  let f = carpetas.find((x) => x.name === c.carpeta);
  if (!f) carpetas.push((f = { name: c.carpeta, item: [] }));
  f.item.push(item(c));
}

const coleccion = {
  info: {
    name: 'Kodo Motors - Semana 10 - Manejo de errores',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [{ key: 'baseUrl', value: 'http://localhost:3000' }],
  item: carpetas,
};

const destino = path.join(__dirname, '..', 'postman', 'Kodo_Errores.postman_collection.json');
fs.writeFileSync(destino, JSON.stringify(coleccion, null, 2));
console.log(`Colección generada con ${casos.length} casos -> ${destino}`);
