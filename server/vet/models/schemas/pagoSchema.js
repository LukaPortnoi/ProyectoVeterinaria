import mongoose from "mongoose";

const pagoSchema = new mongoose.Schema(
  {
    reservaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reserva",
      required: true,
    },
    monto: {
      type: Number,
      required: true,
      min: 0,
    },
    estado: {
      type: String,
      required: true,
      enum: ["PENDIENTE", "APROBADO", "RECHAZADO", "EN_PROCESO", "DEVUELTO"],
      default: "PENDIENTE",
    },
    mercadoPagoPreferenceId: {
      type: String,
      required: false,
      default: null,
    },
    mercadoPagoPaymentId: {
      type: String,
      required: false,
      default: null,
    },
    mercadoPagoStatus: {
      type: String,
      required: false,
      default: null,
    },
    mercadoPagoStatusDetail: {
      type: String,
      required: false,
      default: null,
    },
    montoComision: {
      type: Number,
      default: null,
      min: 0,
    },
    montoProveedor: {
      type: Number,
      default: null,
      min: 0,
    },
    comisionPorcentajeAplicado: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    comisionFijaAplicada: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  { timestamps: true }
);

pagoSchema.index({ reservaId: 1 });
pagoSchema.index({ mercadoPagoPreferenceId: 1 });
pagoSchema.index({ mercadoPagoPaymentId: 1 });

export const PagoModel = mongoose.model("Pago", pagoSchema);
