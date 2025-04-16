// Backend/controllers/servicios_productos.controller.js
import db from "../config/database.js";

// Validación básica de datos
const validarDatosServicioProducto = (nombre, descripcion, precio, tipo) => {
  if (!nombre || !descripcion || !precio || !tipo) {
    return { message: "Todos los campos son obligatorios" };
  }
  if (typeof precio !== "number" || precio <= 0) {
    return { message: "El precio debe ser un número positivo" };
  }
  if (!["servicio", "producto"].includes(tipo)) {
    return { message: "El tipo debe ser 'servicio' o 'producto'" };
  }

  return null;
};

// Verificar si un servicio/producto ya existe (por nombre)
export const verificarServicioProductoExistente = async (req, res) => {
  const { nombre } = req.query;

  if (!nombre?.trim()) {
    return res.status(400).json({
      error: "Se requiere un nombre válido para la verificación",
      details: "El parámetro no puede estar vacío",
    });
  }

  try {
    const [rows] = await db.execute(
      "SELECT nombre FROM servicios_productos WHERE nombre = ?",
      [nombre.trim()]
    );

    res.json({
      exists: rows.length > 0,
      duplicateFields: {
        nombre: rows.length > 0,
      },
    });
  } catch (error) {
    console.error("Error en verificarServicioProductoExistente:", {
      message: error.message,
      stack: error.stack,
      queryParams: req.query,
    });

    res.status(500).json({
      error: "Error interno al verificar servicio/producto",
      details: error.message,
    });
  }
};

// Crear un nuevo servicio o producto
export const crearServicioProducto = async (req, res) => {
  const { nombre, descripcion, precio, tipo } = req.body;
  const validacion = validarDatosServicioProducto(
    nombre,
    descripcion,
    precio,
    tipo
  );

  if (validacion) {
    return res.status(422).json(validacion);
  }

  try {
    // Verificar si ya existe
    const [existing] = await db.execute(
      "SELECT id FROM servicios_productos WHERE nombre = ?",
      [nombre]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: "Servicio/Producto ya existe",
        duplicateFields: {
          nombre: true,
        },
      });
    }

    // Si no existe, crearlo
    const [result] = await db.execute(
      "INSERT INTO servicios_productos (nombre, descripcion, precio, tipo) VALUES (?, ?, ?, ?)",
      [nombre, descripcion, precio, tipo]
    );

    res.status(201).json({
      message: "Servicio/Producto creado correctamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear el servicio/producto:", error.message);
    res.status(500).json({ error: "Error al crear el servicio/producto" });
  }
};

// Obtener todos los servicios/productos con paginación
export const obtenerServiciosProductos = async (req, res) => {
  const { page = 1, limit = 10, tipo } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = "SELECT * FROM servicios_productos";
    const params = [];

    if (tipo) {
      query += " WHERE tipo = ?";
      params.push(tipo);
    }

    query += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener servicios/productos:", error.message);
    res.status(500).json({ error: "Error al obtener los servicios/productos" });
  }
};

// Actualizar un servicio/producto por ID
export const actualizarServicioProducto = async (req, res) => {
  const { nombre, descripcion, precio, tipo } = req.body;
  const validacion = validarDatosServicioProducto(
    nombre,
    descripcion,
    precio,
    tipo
  );

  if (validacion) {
    return res.status(422).json(validacion);
  }

  try {
    // Verificar si el nuevo nombre ya existe en otro registro
    const [existing] = await db.execute(
      "SELECT id FROM servicios_productos WHERE nombre = ? AND id != ?",
      [nombre, req.params.id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: "Otro servicio/producto ya usa este nombre",
        duplicateFields: {
          nombre: true,
        },
      });
    }

    // Si no hay conflictos, actualizar
    const [result] = await db.execute(
      "UPDATE servicios_productos SET nombre = ?, descripcion = ?, precio = ?, tipo = ? WHERE id = ?",
      [nombre, descripcion, precio, tipo, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Servicio/Producto no encontrado" });
    }

    res.json({ message: "Servicio/Producto actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar el servicio/producto:", error.message);
    res.status(500).json({ error: "Error al actualizar el servicio/producto" });
  }
};

// Eliminar un servicio/producto por ID
export const eliminarServicioProducto = async (req, res) => {
  try {
    const [result] = await db.execute(
      "DELETE FROM servicios_productos WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Servicio/Producto no encontrado" });
    }

    res.json({ message: "Servicio/Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el servicio/producto:", error.message);
    res.status(500).json({ error: "Error al eliminar el servicio/producto" });
  }
};
