// routes/registros.routes.js
import express from "express";
import {
  getDatosRegistro,
  createRegistro,
} from "../controllers/registros.controller.js";

const router = express.Router();

// Obtener datos iniciales para el formulario de nuevo registro
router.get("/", getDatosRegistro);

// Crear un nuevo registro (cotización o gasto)
router.post("/", createRegistro);

export default router;
