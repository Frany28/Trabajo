// controllers/registros.controller.js
import db from "../config/database.js";

// Obtener datos iniciales para el formulario de nuevo registro
export const getDatosRegistro = async (req, res) => {
  try {
    // Obtener servicios/productos
    const [servicios] = await db.query(
      `SELECT id, nombre, precio FROM servicios_productos`
    );

    // Obtener clientes (para cotizaciones)
    const [clientes] = await db.query(`SELECT id, nombre FROM clientes`);

    // Obtener proveedores (para gastos)
    const [proveedores] = await db.query(`SELECT id, nombre FROM proveedores`);

    res.json({
      servicios,
      clientes,
      proveedores,
      tiposRegistro: [
        { id: "cotizacion", nombre: "Cotización" },
        { id: "gasto", nombre: "Gasto" },
      ],
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error al obtener datos para nuevo registro" });
  }
};

// Crear un nuevo registro (cotización o gasto)
export const createRegistro = async (req, res) => {
  const { tipo, datos } = req.body;

  try {
    if (tipo === "cotizacion") {
      // Lógica para crear cotización (similar a createCotizacion)
      const { cliente_id, total, estado, detalle } = datos;

      const [result] = await db.query(
        `INSERT INTO cotizaciones (cliente_id, total, estado) VALUES (?, ?, ?)`,
        [cliente_id, total, estado]
      );

      const registroId = result.insertId;

      // Insertar el detalle
      for (const item of detalle) {
        await db.query(
          `INSERT INTO detalle_cotizacion (cotizacion_id, servicio_productos_id, cantidad, precio_unitario) 
           VALUES (?, ?, ?, ?)`,
          [
            registroId,
            item.servicio_productos_id,
            item.cantidad,
            item.precio_unitario,
          ]
        );
      }

      return res.status(201).json({
        message: "Cotización creada con éxito",
        registro_id: registroId,
        tipo: "cotizacion",
      });
    } else if (tipo === "gasto") {
      // Lógica para crear gasto (similar a createGasto)
      const {
        proveedor_id,
        concepto_pago_id,
        monto,
        descripcion,
        fecha,
        estado,
      } = datos;

      const [result] = await db.query(
        `INSERT INTO gastos (
          proveedor_id, concepto_pago_id, monto, descripcion,
          fecha, estado, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          proveedor_id,
          concepto_pago_id,
          monto,
          descripcion || null,
          fecha,
          estado || "pendiente",
        ]
      );

      return res.status(201).json({
        message: "Gasto creado con éxito",
        registro_id: result.insertId,
        tipo: "gasto",
      });
    } else {
      return res.status(400).json({ message: "Tipo de registro no válido" });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: `Error al crear el registro de tipo ${tipo}` });
  }
};
