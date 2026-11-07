const crearControlador = require('./crud.controller');
const servicio = require('../services/servicios.service');

module.exports = crearControlador(servicio);
