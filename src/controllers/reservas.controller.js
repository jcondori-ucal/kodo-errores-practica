const crearControlador = require('./crud.controller');
const servicio = require('../services/reservas.service');

module.exports = crearControlador(servicio);
