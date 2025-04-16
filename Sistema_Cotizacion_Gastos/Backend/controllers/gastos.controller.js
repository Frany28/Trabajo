import db from "../config/database.js";

//obtener gastor por paginacion
// Obtener todos los clientes con paginación
export const getGastosPaginado = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const [rows] = await db.execute("SELECT * FROM clientes LIMIT ? OFFSET ?", [
      limit,
      offset,
    ]);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener gastos:", error.message);
    res.status(500).json({ error: "Error al obtener gastos" });
  }
};

export const getCategoriasGastos = async (req, res) => {
  try {
    const [categorias] = await db.query(`
      SELECT cg.id, cg.nombre, 
             (SELECT COUNT(*) FROM conceptos_pago cp WHERE cp.categoria_id = cg.id) as cantidad_conceptos
      FROM categorias_gastos cg
      ORDER BY cg.nombre
    `);
    res.json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías de gastos:", error);
    res.status(500).json({ message: "Error al obtener categorías" });
  }
};

// Obtener conceptos de pago por categoría
export const getConceptosPorCategoria = async (req, res) => {
  const { categoria_id } = req.params;
  try {
    const [conceptos] = await db.query(
      `
      SELECT id, descripcion 
      FROM conceptos_pago 
      WHERE categoria_id = ?
      ORDER BY descripcion
    `,
      [categoria_id]
    );
    res.json(conceptos);
  } catch (error) {
    console.error("Error al obtener conceptos de pago:", error);
    res.status(500).json({ message: "Error al obtener conceptos" });
  }
};

// Obtener proveedores
export const getProveedores = async (req, res) => {
  try {
    const [proveedores] = await db.query(`
      SELECT id, nombre 
      FROM proveedores 
      ORDER BY nombre
    `);
    res.json(proveedores);
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    res.status(500).json({ message: "Error al obtener proveedores" });
  }
};

// Obtener todos los gastos agrupados por categoría
export const getGastosAgrupados = async (req, res) => {
  try {
    // Parámetros de paginación (valores por defecto: página 1, 10 items por página)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Filtros opcionales
    const { estado, desde, hasta, categoria_id } = req.query;

    // Primero obtenemos todas las categorías (sin paginación)
    let categoriasQuery = `
      SELECT cg.id, cg.nombre AS categoria
      FROM categorias_gastos cg
    `;

    const categoriasParams = [];

    if (categoria_id) {
      categoriasQuery += " WHERE cg.id = ?";
      categoriasParams.push(categoria_id);
    }

    categoriasQuery += " ORDER BY cg.nombre";

    const [categorias] = await db.query(categoriasQuery, categoriasParams);

    // Luego para cada categoría obtenemos sus gastos (con paginación)
    const categoriasConGastos = await Promise.all(
      categorias.map(async (categoria) => {
        // Consulta para los gastos de la categoría
        let gastosQuery = `
          SELECT 
            g.id, 
            g.monto, 
            g.descripcion, 
            DATE_FORMAT(g.fecha, '%d-%m-%Y') AS fecha,
            g.estado,
            p.nombre AS proveedor, 
            cp.descripcion AS concepto
          FROM gastos g
          JOIN conceptos_pago cp ON cp.id = g.concepto_pago_id
          JOIN proveedores p ON p.id = g.proveedor_id
          WHERE cp.categoria_id = ?
        `;

        const gastosParams = [categoria.id];

        // Aplicar filtros adicionales
        if (estado) {
          gastosQuery += " AND g.estado = ?";
          gastosParams.push(estado);
        }
        if (desde) {
          gastosQuery += " AND g.fecha >= ?";
          gastosParams.push(desde);
        }
        if (hasta) {
          gastosQuery += " AND g.fecha <= ?";
          gastosParams.push(hasta);
        }

        gastosQuery += " ORDER BY g.fecha DESC LIMIT ? OFFSET ?";
        gastosParams.push(limit, offset);

        const [gastos] = await db.query(gastosQuery, gastosParams);

        // Consulta para el total de gastos en esta categoría (sin LIMIT/OFFSET)
        let countQuery = `
          SELECT COUNT(*) AS total
          FROM gastos g
          JOIN conceptos_pago cp ON cp.id = g.concepto_pago_id
          WHERE cp.categoria_id = ?
        `;

        const countParams = [categoria.id];

        if (estado) {
          countQuery += " AND g.estado = ?";
          countParams.push(estado);
        }
        if (desde) {
          countQuery += " AND g.fecha >= ?";
          countParams.push(desde);
        }
        if (hasta) {
          countQuery += " AND g.fecha <= ?";
          countParams.push(hasta);
        }

        const [totalResult] = await db.query(countQuery, countParams);
        const total = totalResult[0].total;

        // Calculamos el total monetario por categoría
        let sumQuery = `
          SELECT SUM(g.monto) AS total_monto
          FROM gastos g
          JOIN conceptos_pago cp ON cp.id = g.concepto_pago_id
          WHERE cp.categoria_id = ?
        `;

        const sumParams = [categoria.id];

        if (estado) {
          sumQuery += " AND g.estado = ?";
          sumParams.push(estado);
        }
        if (desde) {
          sumQuery += " AND g.fecha >= ?";
          sumParams.push(desde);
        }
        if (hasta) {
          sumQuery += " AND g.fecha <= ?";
          sumParams.push(hasta);
        }

        const [sumResult] = await db.query(sumQuery, sumParams);
        const totalMonto = sumResult[0].total_monto || 0;

        return {
          ...categoria,
          gastos,
          total: parseFloat(totalMonto).toFixed(2),
          cantidad: total,
          pagination: {
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        };
      })
    );

    res.json({
      data: categoriasConGastos,
      pagination: {
        page,
        limit,
        totalItems: categoriasConGastos.reduce(
          (sum, cat) => sum + cat.cantidad,
          0
        ),
        totalPages: Math.max(
          ...categoriasConGastos.map((cat) => cat.pagination.totalPages)
        ),
      },
    });
  } catch (error) {
    console.error("Error en getGastosAgrupados:", error);
    res.status(500).json({
      message: "Error al obtener los gastos por categoría",
      error: error.message,
    });
  }
};

// Función de validación para crear/actualizar gastos
const validarDatosGasto = (data) => {
  const errors = [];

  if (!data.proveedor_id || isNaN(data.proveedor_id)) {
    errors.push("proveedor_id es requerido y debe ser un número");
  }

  if (!data.concepto_pago_id || isNaN(data.concepto_pago_id)) {
    errors.push("concepto_pago_id es requerido y debe ser un número");
  }

  if (!data.monto || isNaN(data.monto) || parseFloat(data.monto) <= 0) {
    errors.push("monto es requerido y debe ser un número positivo");
  }

  if (!data.fecha || isNaN(new Date(data.fecha).getTime())) {
    errors.push("fecha es requerida y debe ser una fecha válida");
  }

  if (
    data.estado &&
    !["pendiente", "aprobado", "pagado", "rechazado"].includes(data.estado)
  ) {
    errors.push("estado no es válido");
  }

  return errors.length > 0 ? errors : null;
};

// Crear un nuevo gasto
export const createGasto = async (req, res) => {
  const validationErrors = validarDatosGasto(req.body);
  if (validationErrors) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    const [result] = await db.query(
      `
      INSERT INTO gastos (
        proveedor_id, concepto_pago_id, monto, descripcion,
        fecha, estado, solicitante_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      [
        req.body.proveedor_id,
        req.body.concepto_pago_id,
        req.body.monto,
        req.body.descripcion || null,
        req.body.fecha,
        req.body.estado || "pendiente",
        req.body.solicitante_id || null,
      ]
    );

    // Obtener el gasto recién creado para devolverlo
    const [gasto] = await db.query(
      `
      SELECT g.*, p.nombre AS proveedor, cp.descripcion AS concepto
      FROM gastos g
      LEFT JOIN proveedores p ON p.id = g.proveedor_id
      LEFT JOIN conceptos_pago cp ON cp.id = g.concepto_pago_id
      WHERE g.id = ?
      `,
      [result.insertId]
    );

    res.status(201).json({
      message: "Gasto creado con éxito",
      data: gasto[0],
    });
  } catch (error) {
    console.error("Error en createGasto:", error);
    res.status(500).json({
      message: "Error al crear el gasto",
      error: error.message,
    });
  }
};

// Obtener un gasto por su ID
export const getGastoById = async (req, res) => {
  try {
    const [gasto] = await db.query(
      `
      SELECT 
        g.*, 
        p.nombre AS proveedor, 
        cp.descripcion AS concepto, 
        cg.nombre AS categoria,
        DATE_FORMAT(g.fecha, '%d-%m-%Y') AS fecha_formateada
      FROM gastos g
      LEFT JOIN proveedores p ON p.id = g.proveedor_id
      LEFT JOIN conceptos_pago cp ON cp.id = g.concepto_pago_id
      LEFT JOIN categorias_gastos cg ON cg.id = cp.categoria_id
      WHERE g.id = ?
      `,
      [req.params.id]
    );

    if (gasto.length === 0) {
      return res.status(404).json({ message: "Gasto no encontrado" });
    }

    res.json(gasto[0]);
  } catch (error) {
    console.error("Error en getGastoById:", error);
    res.status(500).json({
      message: "Error al obtener el gasto",
      error: error.message,
    });
  }
};

// Actualizar un gasto
export const updateGasto = async (req, res) => {
  const validationErrors = validarDatosGasto(req.body);
  if (validationErrors) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    const [result] = await db.query(
      `
      UPDATE gastos SET
        proveedor_id = ?, 
        concepto_pago_id = ?, 
        monto = ?, 
        descripcion = ?, 
        fecha = ?, 
        estado = ?,
        aprobador_id = ?, 
        fecha_aprobacion = ?, 
        fecha_pago = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        req.body.proveedor_id,
        req.body.concepto_pago_id,
        req.body.monto,
        req.body.descripcion || null,
        req.body.fecha,
        req.body.estado,
        req.body.aprobador_id || null,
        req.body.fecha_aprobacion || null,
        req.body.fecha_pago || null,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Gasto no encontrado" });
    }

    // Obtener el gasto actualizado para devolverlo
    const [gasto] = await db.query("SELECT * FROM gastos WHERE id = ?", [
      req.params.id,
    ]);

    res.json({
      message: "Gasto actualizado correctamente",
      data: gasto[0],
    });
  } catch (error) {
    console.error("Error en updateGasto:", error);
    res.status(500).json({
      message: "Error al actualizar el gasto",
      error: error.message,
    });
  }
};

// Eliminar un gasto
export const deleteGasto = async (req, res) => {
  try {
    // Primero obtenemos el gasto para registrarlo antes de borrar
    const [gasto] = await db.query("SELECT * FROM gastos WHERE id = ?", [
      req.params.id,
    ]);

    if (gasto.length === 0) {
      return res.status(404).json({ message: "Gasto no encontrado" });
    }

    // Luego procedemos a borrar
    await db.query("DELETE FROM gastos WHERE id = ?", [req.params.id]);

    res.json({
      message: "Gasto eliminado correctamente",
      data: gasto[0], // Devolvemos el gasto que fue eliminado
    });
  } catch (error) {
    console.error("Error en deleteGasto:", error);
    res.status(500).json({
      message: "Error al eliminar el gasto",
      error: error.message,
    });
  }
};
