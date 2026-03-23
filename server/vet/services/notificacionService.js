import { AppError } from "../errors/AppError.js";

export class NotificacionService {
  constructor(notificacionRepository) {
    this.notificacionRepo = notificacionRepository;
  }

  async crear(datos) {
    const { destinatario, tipoDestinatario, tipo, titulo, mensaje, reserva } = datos;

    if (!destinatario || !tipoDestinatario || !tipo || !titulo || !mensaje) {
      throw new AppError("Faltan campos obligatorios para la notificación", 400);
    }

    return await this.notificacionRepo.save({
      destinatario,
      tipoDestinatario,
      tipo,
      titulo,
      mensaje,
      reserva: reserva || null,
    });
  }

  async obtenerPorDestinatario(destinatarioId, tipoDestinatario, { page = 1, limit = 20 } = {}) {
    const notificaciones = await this.notificacionRepo.findByDestinatario(
      destinatarioId,
      tipoDestinatario,
      { page, limit }
    );
    const total = await this.notificacionRepo.countByDestinatario(destinatarioId, tipoDestinatario);
    const noLeidas = await this.notificacionRepo.countUnread(destinatarioId, tipoDestinatario);

    return {
      notificaciones,
      total,
      noLeidas,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    };
  }

  async marcarComoLeida(id) {
    const notificacion = await this.notificacionRepo.markAsRead(id);
    if (!notificacion) {
      throw new AppError("Notificación no encontrada", 404);
    }
    return notificacion;
  }

  async marcarTodasComoLeidas(destinatarioId, tipoDestinatario) {
    return await this.notificacionRepo.markAllAsRead(destinatarioId, tipoDestinatario);
  }

  async eliminar(id) {
    const eliminada = await this.notificacionRepo.deleteById(id);
    if (!eliminada) {
      throw new AppError("Notificación no encontrada", 404);
    }
    return true;
  }
}
