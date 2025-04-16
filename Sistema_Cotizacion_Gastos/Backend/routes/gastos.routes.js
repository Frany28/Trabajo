import express from "express";
import {
  getGastosAgrupados,
  getGastosPaginado,
  createGasto,
  getGastoById,
  updateGasto,
  deleteGasto,
  getCategoriasGastos,
  getConceptosPorCategoria,
  getProveedores,
} from "../controllers/gastos.controller.js";

const router = express.Router();

// Obtener gastos agrupados por categoría (con posibles filtros)
router.get("/", getGastosAgrupados);

// Crear nuevo gasto
router.post("/", createGasto);

// Obtener gastos paginados (con posibles filtros)
router.get("/paginado", getGastosPaginado);

// Obtener categorías de gastos
router.get("/categorias", getCategoriasGastos);

// Obtener conceptos por categoría
router.get("/conceptos/:categoria_id", getConceptosPorCategoria);

// Obtener proveedores
router.get("/proveedores", getProveedores);

// Obtener, actualizar o eliminar un gasto específico
router
  .route("/:id")
  .get(getGastoById) // Obtener gasto por ID
  .put(updateGasto) // Actualizar gasto completo
  .delete(deleteGasto); // Eliminar gasto

export default router;
