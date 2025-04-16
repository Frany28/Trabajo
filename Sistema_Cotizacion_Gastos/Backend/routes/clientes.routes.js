// Backend/routes/clientes.routes.js

import express from "express";
import {
  crearCliente,
  obtenerClientes,
  actualizarCliente,
  eliminarCliente,
  verificarClienteExistente,
} from "../controllers/clientes.controller.js";

const router = express.Router();

router.post("/", crearCliente); // Ruta para crear un cliente

// Definir la ruta para obtener todos los clientes (con paginación)
router.get("/", obtenerClientes);

// Definir la ruta para actualizar un cliente por ID
router.put("/:id", actualizarCliente);

// Definir la ruta para eliminar un cliente por ID
router.delete("/:id", eliminarCliente);

// Ruta para verificar si un cliente ya existe
router.get("/check", verificarClienteExistente);

export default router;
