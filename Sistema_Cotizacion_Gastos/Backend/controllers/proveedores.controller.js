// Backend/controllers/proveedores.controller.js
import db from "../config/database.js";

// Validación básica de datos
const validarDatosProveedor = (nombre, email, telefono, direccion) => {
  const regexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  const regexTelefono = /^[0-9]{10}$/;

  if (!nombre || !email || !telefono) {
    return { message: "Nombre, email y teléfono son campos obligatorios" };
  }
  if (!regexEmail.test(email)) {
    return { message: "El formato del email es incorrecto" };
  }
  if (!regexTelefono.test(telefono)) {
    return { message: "El teléfono debe tener 10 dígitos numéricos" };
  }
  if (!direccion) {
    return { message: "La dirección es requerida" };
  }

  return null;
};

// Verificar si un proveedor ya existe (por nombre, email o teléfono)
export const verificarProveedorExistente = async (req, res) => {
  const { nombre, email, telefono } = req.query;

  // Validación más robusta
  if (!nombre?.trim() && !email?.trim() && !telefono?.trim()) {
    return res.status(400).json({
      error:
        "Se requiere al menos un nombre, email o teléfono válido para la verificación",
      details: "Los parámetros no pueden estar vacíos",
    });
  }

  try {
    let query = "SELECT nombre, email, telefono FROM proveedores WHERE ";
    const conditions = [];
    const params = [];

    if (nombre?.trim()) {
      conditions.push("nombre = ?");
      params.push(nombre.trim());
    }

    if (email?.trim()) {
      conditions.push("email = ?");
      params.push(email.trim());
    }

    if (telefono?.trim()) {
      conditions.push("telefono = ?");
      params.push(telefono.trim());
    }

    query += conditions.join(" OR ");

    const [rows] = await db.execute(query, params);

    const response = {
      exists: rows.length > 0,
      duplicateFields: {
        nombre: false,
        email: false,
        telefono: false,
      },
    };

    // Verificar qué campos están duplicados
    if (rows.length > 0) {
      response.duplicateFields.nombre = rows.some(
        (row) => nombre && row.nombre === nombre.trim()
      );
      response.duplicateFields.email = rows.some(
        (row) => email && row.email === email.trim()
      );
      response.duplicateFields.telefono = rows.some(
        (row) => telefono && row.telefono === telefono.trim()
      );
    }

    res.json(response);
  } catch (error) {
    console.error("Error en verificarProveedorExistente:", {
      message: error.message,
      stack: error.stack,
      queryParams: req.query,
    });

    res.status(500).json({
      error: "Error interno al verificar proveedor",
      details: error.message,
    });
  }
};

// Ruta para crear un proveedor (modificada para verificar duplicados)
export const crearProveedor = async (req, res) => {
  const { nombre, email, telefono, direccion } = req.body;
  const validacion = validarDatosProveedor(nombre, email, telefono, direccion);

  if (validacion) {
    return res.status(422).json(validacion);
  }

  try {
    // Primero verificamos si el proveedor ya existe
    const [existing] = await db.execute(
      "SELECT id FROM proveedores WHERE nombre = ? OR email = ? OR telefono = ?",
      [nombre, email, telefono]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: "Proveedor ya existe",
        duplicateFields: {
          nombre: existing.some((row) => row.nombre === nombre),
          email: existing.some((row) => row.email === email),
          telefono: existing.some((row) => row.telefono === telefono),
        },
      });
    }

    // Si no existe, lo creamos
    const [result] = await db.execute(
      "INSERT INTO proveedores (nombre, email, telefono, direccion) VALUES (?, ?, ?, ?)",
      [nombre, email, telefono, direccion]
    );

    res.status(201).json({
      message: "Proveedor creado correctamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear el proveedor:", error.message);
    res.status(500).json({ error: "Error al crear el proveedor" });
  }
};

// Obtener todos los proveedores con paginación
export const obtenerProveedores = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const [rows] = await db.execute(
      "SELECT * FROM proveedores LIMIT ? OFFSET ?",
      [limit, offset]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener proveedores:", error.message);
    res.status(500).json({ error: "Error al obtener los proveedores" });
  }
};

// Ruta para actualizar un proveedor por ID (modificada para verificar duplicados)
export const actualizarProveedor = async (req, res) => {
  const { nombre, email, telefono, direccion } = req.body;
  const validacion = validarDatosProveedor(nombre, email, telefono, direccion);

  if (validacion) {
    return res.status(422).json(validacion);
  }

  try {
    // Verificar si el nuevo nombre, email o teléfono ya existen en otros proveedores
    const [existing] = await db.execute(
      "SELECT id FROM proveedores WHERE (nombre = ? OR email = ? OR telefono = ?) AND id != ?",
      [nombre, email, telefono, req.params.id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: "Otro proveedor ya usa este nombre, email o teléfono",
        duplicateFields: {
          nombre: existing.some((row) => row.nombre === nombre),
          email: existing.some((row) => row.email === email),
          telefono: existing.some((row) => row.telefono === telefono),
        },
      });
    }

    // Si no hay conflictos, actualizar
    const [result] = await db.execute(
      "UPDATE proveedores SET nombre = ?, email = ?, telefono = ?, direccion = ? WHERE id = ?",
      [nombre, email, telefono, direccion, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    res.json({ message: "Proveedor actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar el proveedor:", error.message);
    res.status(500).json({ error: "Error al actualizar el proveedor" });
  }
};

// Eliminar un proveedor por ID
export const eliminarProveedor = async (req, res) => {
  try {
    const [result] = await db.execute("DELETE FROM proveedores WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    res.json({ message: "Proveedor eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el proveedor:", error.message);
    res.status(500).json({ error: "Error al eliminar el proveedor" });
  }
};
