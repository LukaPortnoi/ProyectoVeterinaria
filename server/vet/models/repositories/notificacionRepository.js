import { NotificacionModel } from "../schemas/notificacionSchema.js";

export class NotificacionRepository {
  constructor() {
    this.model = NotificacionModel;
  }

  async save(notificacion) {
    if (notificacion.id) {
      const { id, ...datos } = notificacion;
      return await this.model.findByIdAndUpdate(id, datos, {
        new: true,
        runValidators: true,
      });
    }
    const nueva = new this.model(notificacion);
    return await nueva.save();
  }

  async findByDestinatario(destinatarioId, tipoDestinatario, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    return await this.model
      .find({ destinatario: destinatarioId, tipoDestinatario })
      .sort({ fechaAlta: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countByDestinatario(destinatarioId, tipoDestinatario) {
    return await this.model.countDocuments({ destinatario: destinatarioId, tipoDestinatario });
  }

  async countUnread(destinatarioId, tipoDestinatario) {
    return await this.model.countDocuments({
      destinatario: destinatarioId,
      tipoDestinatario,
      leida: false,
    });
  }

  async markAsRead(id) {
    return await this.model.findByIdAndUpdate(
      id,
      { leida: true, fechaLeida: new Date() },
      { new: true }
    );
  }

  async markAllAsRead(destinatarioId, tipoDestinatario) {
    return await this.model.updateMany(
      { destinatario: destinatarioId, tipoDestinatario, leida: false },
      { leida: true, fechaLeida: new Date() }
    );
  }

  async deleteById(id) {
    const resultado = await this.model.findByIdAndDelete(id);
    return resultado !== null;
  }
}
