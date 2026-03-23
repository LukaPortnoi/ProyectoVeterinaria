import mongoose from "mongoose";

const notificacionSchema = new mongoose.Schema({
  destinatario: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  tipoDestinatario: {
    type: String,
    required: true,
    enum: ["Cliente", "Veterinaria", "Paseador", "Cuidador"],
  },
  tipo: {
    type: String,
    required: true,
    enum: ["NUEVA_CITA", "RECORDATORIO", "CANCELACION", "CONFIRMACION", "GENERAL"],
  },
  titulo: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 200,
  },
  mensaje: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 500,
  },
  reserva: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reserva",
    default: null,
  },
  leida: {
    type: Boolean,
    default: false,
  },
  fechaAlta: {
    type: Date,
    default: Date.now,
  },
  fechaLeida: {
    type: Date,
    default: null,
  },
});

notificacionSchema.index({ destinatario: 1, tipoDestinatario: 1, fechaAlta: -1 });

export const NotificacionModel = mongoose.model("Notificacion", notificacionSchema);
