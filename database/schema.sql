DROP DATABASE IF EXISTS kodo_motors;
CREATE DATABASE kodo_motors CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kodo_motors;

CREATE TABLE servicios (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(60)   NOT NULL UNIQUE,
  descripcion  VARCHAR(200)  NULL,
  precio       DECIMAL(10,2) NOT NULL,
  duracion_min INT           NOT NULL,
  activo       TINYINT(1)    NOT NULL DEFAULT 1
);

CREATE TABLE reservas (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  servicio_id    INT          NOT NULL,
  nombre_cliente VARCHAR(80)  NOT NULL,
  placa          VARCHAR(7)   NOT NULL,
  fecha          DATE         NOT NULL,
  hora           TIME         NOT NULL,
  estado         ENUM('pendiente','confirmada','cancelada','completada') NOT NULL DEFAULT 'pendiente',
  CONSTRAINT fk_reserva_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id)
);

INSERT INTO servicios (nombre, descripcion, precio, duracion_min, activo) VALUES
  ('Cambio de aceite',        'Aceite y filtro',                   120.00,  45, 1),
  ('Alineación y balanceo',   'Alineación computarizada',          150.00,  60, 1),
  ('Revisión de frenos',      'Pastillas, discos y líquido',       180.00,  90, 1),
  ('Diagnóstico computarizado','Lectura de códigos del vehículo',   90.00,  30, 0);

INSERT INTO reservas (servicio_id, nombre_cliente, placa, fecha, hora, estado) VALUES
  (1, 'Carlos Ramos', 'ABC123', '2026-12-01', '09:00', 'confirmada'),
  (2, 'Lucía Torres', 'XYZ789', '2026-12-02', '10:30', 'pendiente');
