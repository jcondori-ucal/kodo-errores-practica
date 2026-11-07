# Kodo Motors — Semana 10: manejo centralizado de errores

Práctica guiada de los puntos **5, 6 y 7** de la semana 10 sobre el dominio de Kodo Motors
(taller automotriz, agendamiento). API Express con arquitectura por capas + MySQL
y validaciones con `express-validator` (semana 9).

## Puesta en marcha

```bash
npm install
cp .env.example .env          # ajusta DB_PASSWORD
docker compose up -d          # MySQL 8 con database/schema.sql cargado (o ejecuta el SQL en tu MySQL)
npm run dev                   # http://localhost:3000
npm test                      # pruebas automatizadas con Jest + Supertest
npm run postman               # regenera la colección de Postman
```

## Estructura (capas)

```
src/
├── app.js                    # rutas -> notFound -> errorHandler (el orden importa)
├── server.js
├── config/db.js              # pool mysql2/promise
├── errors/AppError.js        # error esperado con statusCode
├── errors/mysqlErrors.js     # traduce errores de MySQL (1062, 1451...) a AppError 409/404
├── middlewares/
│   ├── errorHandler.js       # PUNTO 5
│   ├── notFound.js           # PUNTO 6 (rutas no definidas)
│   └── validate.js           # puente express-validator -> AppError 400
├── routes/ controllers/ services/ repositories/ validators/
database/schema.sql           # servicios y reservas (con datos de prueba)
postman/                      # colección con un caso por código de error
tests/errores.test.js         # 19 pruebas (Jest)
ejemplos/                     # código "ANTES" como punto de partida
```

## Punto 5 — Middleware de errores

1. Abre `ejemplos/ANTES_controlador_sin_errorHandler.js` y, antes de ejecutarlo, pregúntate: **¿qué harías tú en este caso?** ¿Qué crees que responde `GET /api/servicios/9999`? Anota tu respuesta y luego compruébala.
2. Crear `src/errors/AppError.js` (`statusCode`, `message`, `errores`).
3. Crear `src/middlewares/errorHandler.js`. Tiene **4 parámetros** `(err, req, res, next)`; así Express lo reconoce como middleware de errores.
4. Registrarlo con `app.use()` **al final** de `app.js`.
5. En los controladores, reemplazar el `catch` repetido por `next(error)`.
6. Respuesta estándar en todos los errores:

```json
{ "estado": 404, "mensaje": "Servicio con id 9999 no encontrado", "errores": [], "ruta": "/api/servicios/9999", "fecha": "2026-11-02T..." }
```

Regla de seguridad: los errores **no esperados** se registran en el servidor (`console.error`) y al cliente solo llega `"Error interno del servidor"`.

## Punto 6 — Recursos y rutas no encontradas

Dos casos distintos:

| Caso | Dónde se detecta | Respuesta |
|---|---|---|
| Registro inexistente (`GET /api/servicios/9999`) | Servicio: `if (!servicio) throw new AppError(404, ...)` | 404 |
| Ruta no definida (`/api/serviciox`) | Middleware `notFound`, después de las rutas y antes del `errorHandler` | 404 en JSON |

## Punto 7 — Pruebas de errores controlados (Postman)

Importar `postman/Kodo_Errores.postman_collection.json` (variable `baseUrl`). Cada request ya trae sus `pm.test`.
Antes de ejecutar cada caso, piensa: **¿qué código y qué mensaje esperarías?** Escríbelo y compáralo con la respuesta real.

| Código | Caso |
|---|---|
| 400 | Body vacío · id `abc` · JSON mal formado · placa inválida |
| 404 | Servicio inexistente · reserva inexistente · `servicio_id` inexistente · ruta mal escrita |
| 409 | Nombre duplicado · eliminar servicio con reservas · choque de fecha/hora · servicio inactivo |
| 500 | `GET /api/_prueba/error-500` (error forzado; verificar que no filtra detalles) |

**Para tu registro:** guarda una captura de cada respuesta con su código y su JSON, junto a lo que habías anticipado.

Nota: `/api/_prueba/error-500` solo existe si `NODE_ENV` no es `production`.

## Reglas de negocio de Kodo usadas para los 409

- No puede haber dos reservas activas en la misma fecha y hora (el taller atiende un vehículo por turno).
- No se reserva un servicio inactivo.
- No se modifica una reserva cancelada o completada.
- No se elimina un servicio que ya tiene reservas.

## Ejercicios propuestos

1. Agregar el código **401** simulando un header `x-api-key` ausente (anticipa la semana 14).
2. Añadir la entidad `sedes` siguiendo el mismo patrón y devolver 409 si el nombre se repite.
3. Hacer que el `errorHandler` incluya un `idError` para poder rastrear el fallo en los logs.
