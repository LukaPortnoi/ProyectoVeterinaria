export class NotificacionController {
  constructor(notificacionService) {
    this.notificacionService = notificacionService;
  }

  async crear(req, res, next) {
    try {
      const notificacion = await this.notificacionService.crear(req.body);
      res.status(201).json(notificacion);
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorDestinatario(req, res, next) {
    try {
      const { id, tipoDestinatario } = req.params;
      const { page, limit } = req.query;
      const resultado = await this.notificacionService.obtenerPorDestinatario(
        id,
        tipoDestinatario,
        { page, limit }
      );
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async marcarComoLeida(req, res, next) {
    try {
      const { id } = req.params;
      const notificacion = await this.notificacionService.marcarComoLeida(id);
      res.json(notificacion);
    } catch (error) {
      next(error);
    }
  }

  async marcarTodasComoLeidas(req, res, next) {
    try {
      const { id, tipoDestinatario } = req.params;
      const resultado = await this.notificacionService.marcarTodasComoLeidas(id, tipoDestinatario);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      await this.notificacionService.eliminar(id);
      res.json({ message: "Notificación eliminada" });
    } catch (error) {
      next(error);
    }
  }
}
