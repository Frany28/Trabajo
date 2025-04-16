// Backend/controllers/clientes.controller.js
import db from "../config/database.js";
// controllers/cotizaciones.controller.js

// Validación básica de datos
const validarDatosCliente = (nombre, email, telefono, direccion) => {
  const regexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  const regexTelefono = /^[0-9]{10}$/;

  if (!nombre || !email || !telefono || !direccion) {
    return { message: "Todos los campos son obligatorios" };
  }
  if (!regexEmail.test(email)) {
    return { message: "El formato del email es incorrecto" };
  }
  if (!regexTelefono.test(telefono)) {
    return { message: "El teléfono debe tener 10 dígitos numéricos" };
  }

  return null;
};

// Verificar si un cliente ya existe (por nombre o email)
export const verificarClienteExistente = async (req, res) => {
  const { nombre, email } = req.query;

 
  if (!nombre?.trim() && !email?.trim()) {
    return res.status(400).json({
      error:
        "Se requiere al menos un nombre o email válido para la verificación",
      details: "Los parámetros no pueden estar vacíos",
    });
  }

  try {
    let query = "SELECT nombre, email FROM clientes WHERE ";
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

    query += conditions.join(" OR ");

    const [rows] = await db.execute(query, params);

    const response = {
      exists: rows.length > 0,
      duplicateFields: {
        nombre: false,
        email: false,
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
    }

    res.json(response);
  } catch (error) {
    console.error("Error en verificarClienteExistente:", {
      message: error.message,
      stack: error.stack,
      queryParams: req.query,
    });

    res.status(500).json({
      error: "Error interno al verificar cliente",
      details: error.message,
    });
  }
};

// Ruta para crear un cliente (modificada para verificar duplicados)
export const crearCliente = async (req, res) => {
  const { nombre, email, telefono, direccion } = req.body;
  const validacion = validarDatosCliente(nombre, email, telefono, direccion);

  if (validacion) {
    return res.status(422).json(validacion);
  }

  try {
    // Primero verificamos si el cliente ya existe
    const [existing] = await db.execute(
      "SELECT id FROM clientes WHERE nombre = ? OR email = ?",
      [nombre, email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: "Cliente ya existe",
        duplicateFields: {
          nombre: existing.some((row) => row.nombre === nombre),
          email: existing.some((row) => row.email === email),
        },
      });
    }

    // Si no existe, lo creamos
    const [result] = await db.execute(
      "INSERT INTO clientes (nombre, email, telefono, direccion) VALUES (?, ?, ?, ?)",
      [nombre, email, telefono, direccion]
    );

    res.status(201).json({
      message: "Cliente creado correctamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear el cliente:", error.message);
    res.status(500).json({ error: "Error al crear el cliente" });
  }
};

// Obtener todos los clientes con paginación
export const obtenerClientes = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const [rows] = await db.execute("SELECT * FROM clientes LIMIT ? OFFSET ?", [
      limit,
      offset,
    ]);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener clientes:", error.message);
    res.status(500).json({ error: "Error al obtener los clientes" });
  }
};

export const actualizarCliente = async (req, res) => {
  const { nombre, email, telefono, direccion } = req.body;
  const validacion = validarDatosCliente(nombre, email, telefono, direccion);

  if (validacion) {
    return res.status(422).json(validacion);
  }

  try {
    // Verificar si el nuevo nombre o email ya existen en otros clientes
    const [existing] = await db.execute(
      "SELECT id FROM clientes WHERE (nombre = ? OR email = ?) AND id != ?",
      [nombre, email, req.params.id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: "Otro cliente ya usa este nombre o email",
        duplicateFields: {
          nombre: existing.some((row) => row.nombre === nombre),
          email: existing.some((row) => row.email === email),
        },
      });
    }

    // Si no hay conflictos, actualizar
    const [result] = await db.execute(
      "UPDATE clientes SET nombre = ?, email = ?, telefono = ?, direccion = ? WHERE id = ?",
      [nombre, email, telefono, direccion, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({ message: "Cliente actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar el cliente:", error.message);
    res.status(500).json({ error: "Error al actualizar el cliente" });
  }
};

// Eliminar un cliente por ID
export const eliminarCliente = async (req, res) => {
  try {
    const [result] = await db.execute("DELETE FROM clientes WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el cliente:", error.message);
    res.status(500).json({ error: "Error al eliminar el cliente" });
  }
};
