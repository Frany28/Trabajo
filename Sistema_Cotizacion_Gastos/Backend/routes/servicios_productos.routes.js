// Backend/routes/servicios_productos.routes.js
import express from "express";
import {
  crearServicioProducto,
  obtenerServiciosProductos,
  actualizarServicioProducto,
  eliminarServicioProducto,
  verificarServicioProductoExistente,
} from "../controllers/servicios_productos.controller.js";

const router = express.Router();

// Ruta para crear un nuevo servicio/producto
router.post("/", crearServicioProducto);

// Ruta para obtener todos los servicios/productos (con paginación y filtro por tipo)
router.get("/", obtenerServiciosProductos);

// Ruta para actualizar un servicio/producto por ID
router.put("/:id", actualizarServicioProducto);

// Ruta para eliminar un servicio/producto por ID
router.delete("/:id", eliminarServicioProducto);

// Ruta para verificar si un servicio/producto ya existe (por nombre)
router.get("/check", verificarServicioProductoExistente);

export default router;
