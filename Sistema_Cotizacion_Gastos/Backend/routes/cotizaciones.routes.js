import express from "express";
import {
  getCotizaciones,
  getCotizacionById,
  createCotizacion,
  actualizarEstadoCotizacion,
  generarPDFCotizacion,
} from "../controllers/cotizaciones.controller.js";

const router = express.Router();

// Obtener todas las cotizaciones
router.get("/", getCotizaciones);

// Obtener una cotización por su ID
router.get("/:id", getCotizacionById);

// Crear una nueva cotización
router.post("/", createCotizacion);

// Actualizar el estado de una cotización
router.put("/:id/estado", actualizarEstadoCotizacion);

// Generar PDF de una cotización
router.get("/:id/pdf", generarPDFCotizacion);

export default router;
