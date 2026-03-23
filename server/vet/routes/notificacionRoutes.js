import express from "express";
import { NotificacionController } from "../controllers/notificacionController.js";

export default function notificacionRoutes(getController) {
  const router = express.Router();

  router.post("/petcare/notificaciones", (req, res, next) => {
    getController(NotificacionController).crear(req, res, next);
  });

  router.get("/petcare/notificaciones/:tipoDestinatario/:id", (req, res, next) => {
    getController(NotificacionController).obtenerPorDestinatario(req, res, next);
  });

  router.put("/petcare/notificaciones/:id/leer", (req, res, next) => {
    getController(NotificacionController).marcarComoLeida(req, res, next);
  });

  router.put("/petcare/notificaciones/:tipoDestinatario/:id/leer-todas", (req, res, next) => {
    getController(NotificacionController).marcarTodasComoLeidas(req, res, next);
  });

  router.delete("/petcare/notificaciones/:id", (req, res, next) => {
    getController(NotificacionController).eliminar(req, res, next);
  });

  return router;
}
