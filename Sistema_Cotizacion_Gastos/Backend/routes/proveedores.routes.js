// Backend/routes/proveedores.routes.js

import express from "express";
import {
  crearProveedor,
  obtenerProveedores,
  actualizarProveedor,
  eliminarProveedor,
  verificarProveedorExistente,
} from "../controllers/proveedores.Controller.js";

const router = express.Router();

// Ruta para crear un proveedor
router.post("/", crearProveedor);

// Ruta para obtener todos los proveedores (con paginación)
router.get("/", obtenerProveedores);

// Ruta para actualizar un proveedor por ID
router.put("/:id", actualizarProveedor);

// Ruta para eliminar un proveedor por ID
router.delete("/:id", eliminarProveedor);

// Ruta para verificar si un proveedor ya existe
router.get("/check", verificarProveedorExistente);

export default router;
