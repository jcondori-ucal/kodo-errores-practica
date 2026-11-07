// Fábrica de controladores CRUD: cada método captura el error y lo delega con next(error).
// El controlador YA NO decide qué responder ante un error: lo hace el errorHandler.
function crearControlador(servicio) {
  return {
    listar: async (req, res, next) => {
      try {
        res.json(await servicio.listar());
      } catch (error) {
        next(error);
      }
    },
    obtener: async (req, res, next) => {
      try {
        res.json(await servicio.obtener(req.params.id));
      } catch (error) {
        next(error);
      }
    },
    crear: async (req, res, next) => {
      try {
        res.status(201).json(await servicio.crear(req.body));
      } catch (error) {
        next(error);
      }
    },
    actualizar: async (req, res, next) => {
      try {
        res.json(await servicio.actualizar(req.params.id, req.body));
      } catch (error) {
        next(error);
      }
    },
    eliminar: async (req, res, next) => {
      try {
        await servicio.eliminar(req.params.id);
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = crearControlador;
