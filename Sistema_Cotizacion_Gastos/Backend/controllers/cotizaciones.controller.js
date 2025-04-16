// controllers/cotizaciones.controller.js
import db from "../config/database.js"; // importar la base de datos
import PDFDocument from "pdfkit"; // librería para generar PDFs
import path from "path";
import fs from "fs"; // librería para manejar el sistema de archivos
import { fileURLToPath } from "url"; // importar la función para obtener el nombre del archivo actual

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Obtener todas las cotizaciones con el detalle
export const getCotizaciones = async (req, res) => {
  try {
    const [cotizaciones] = await db.query(
      `SELECT c.id, c.fecha, c.total, c.estado, cli.nombre AS cliente_nombre
       FROM cotizaciones c
       JOIN clientes cli ON c.cliente_id = cli.id`
    );

    // Ahora obtenemos los detalles de cada cotización
    for (let i = 0; i < cotizaciones.length; i++) {
      const [detalle] = await db.query(
        `SELECT sp.nombre AS servicio, sp.descripcion, dc.cantidad, dc.precio_unitario
         FROM detalle_cotizacion dc
         JOIN servicios_productos sp ON sp.id = dc.servicio_productos_id
         WHERE dc.cotizacion_id = ?`,
        [cotizaciones[i].id]
      );
      cotizaciones[i].detalle = detalle;
    }

    res.json(cotizaciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener las cotizaciones" });
  }
};

// Obtener una cotización por su ID, incluyendo el detalle
export const getCotizacionById = async (req, res) => {
  const { id } = req.params;

  try {
    const [cotizacion] = await db.query(
      `SELECT c.id, c.fecha, c.total, c.estado, cli.nombre AS cliente_nombre, cli.email AS cliente_email
       FROM cotizaciones c
       JOIN clientes cli ON c.cliente_id = cli.id
       WHERE c.id = ?`,
      [id]
    );

    if (cotizacion.length === 0)
      return res.status(404).json({ message: "Cotización no encontrada" });

    // Obtener los detalles asociados a esta cotización
    const [detalle] = await db.query(
      `SELECT sp.nombre AS servicio, sp.descripcion, dc.cantidad, dc.precio_unitario
       FROM detalle_cotizacion dc
       JOIN servicios_productos sp ON sp.id = dc.servicio_productos_id
       WHERE dc.cotizacion_id = ?`,
      [id]
    );

    cotizacion[0].detalle = detalle;
    res.json(cotizacion[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener la cotización" });
  }
};

// Crear una cotización con detalle
export const createCotizacion = async (req, res) => {
  const { cliente_id, total, estado, detalle } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO cotizaciones (cliente_id, total, estado) VALUES (?, ?, ?)`,
      [cliente_id, total, estado]
    );

    const cotizacionId = result.insertId;

    // Insertar el detalle de la cotización
    for (let i = 0; i < detalle.length; i++) {
      const { servicio_productos_id, cantidad, precio_unitario } = detalle[i];
      await db.query(
        `INSERT INTO detalle_cotizacion (cotizacion_id, servicio_productos_id, cantidad, precio_unitario) 
         VALUES (?, ?, ?, ?)`,
        [cotizacionId, servicio_productos_id, cantidad, precio_unitario]
      );
    }

    res.status(201).json({
      message: "Cotización creada con éxito",
      cotizacion_id: cotizacionId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear la cotización" });
  }
};

// Actualizar el estado de una cotización
export const actualizarEstadoCotizacion = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE cotizaciones SET estado = ? WHERE id = ?`,
      [estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cotización no encontrada" });
    }

    res.json({ message: "Estado de la cotización actualizado" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error al actualizar el estado de la cotización" });
  }
};

// Generar PDF de una cotización
export const generarPDFCotizacion = async (req, res) => {
  const { id } = req.params;

  // Creamos el documento PDF
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  // Manejador de errores para el stream
  doc.on("error", (err) => {
    console.error("Error en generación de PDF:", err);
    if (!res.headersSent) {
      res.status(500).send("Error generando PDF");
    }
  });

  try {
    const [data] = await db.query(
      `SELECT c.id, c.fecha, c.total, c.estado, 
              cli.nombre AS cliente_nombre, cli.email, cli.telefono, cli.direccion,
              sp.nombre AS servicio, sp.descripcion, 
              CAST(dc.cantidad AS DECIMAL(10,2)) AS cantidad, 
              CAST(dc.precio_unitario AS DECIMAL(10,2)) AS precio_unitario
       FROM cotizaciones c
       JOIN clientes cli ON cli.id = c.cliente_id
       JOIN detalle_cotizacion dc ON dc.cotizacion_id = c.id
       JOIN servicios_productos sp ON sp.id = dc.servicio_productos_id
       WHERE c.id = ?`,
      [id]
    );

    if (data.length === 0) {
      return res.status(404).send("Cotización no encontrada");
    }

    // Configuramos los headers de la respuesta
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=cotizacion_${id}.pdf`
    );
    doc.pipe(res);

    // Estilos
    const primaryColor = "#333333";
    const secondaryColor = "#666666";
    const accentColor = "#1a5276";

    // Logo (con manejo de errores)
    try {
      const logoPath = path.join(__dirname, "../../Frontend/public/logo.png");
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 50, { width: 100 });
      } else {
        doc.fontSize(16).fillColor(accentColor).text("TU LOGO AQUÍ", 50, 60);
      }
    } catch (logoError) {
      console.warn("Error cargando logo:", logoError);
    }

    // Encabezado principal
    doc.moveDown(3);
    doc
      .fontSize(20)
      .fillColor(accentColor)
      .text("COTIZACIÓN", { align: "center", underline: true })
      .moveDown(1);
    // Información del cliente y cotización
    const clientInfoTop = 150;
    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text(data[0].cliente_nombre.toUpperCase(), 50, clientInfoTop)
      .text(`No. ${id.toString().padStart(6, "0")}`, 300, clientInfoTop)
      .text(
        `Fecha: ${new Date(data[0].fecha).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`,
        300,
        clientInfoTop + 20
      )
      .moveDown(1);

    // Información de la empresa (mejorada)
    doc
      .fontSize(10)
      .fillColor(secondaryColor)
      .text("LARANA, INC.", 50, clientInfoTop + 50)
      .text("Calle cualquiera 123, cualquier lugar", 50, clientInfoTop + 65)
      .text("Teléfono: (123) 456-7890", 50, clientInfoTop + 80)
      .moveDown(2);

    // Tabla de servicios (con conversión numérica segura)
    const tableTop = clientInfoTop + 120;

    // Encabezados de tabla (estilo mejorado)
    doc
      .fontSize(12)
      .fillColor("white")
      .rect(50, tableTop, 500, 20)
      .fill(accentColor)
      .text("DESCRIPCIÓN", 60, tableTop + 5)
      .text("CANT.", 350, tableTop + 5, { width: 50, align: "center" })
      .text("PRECIO", 400, tableTop + 5, { width: 70, align: "right" })
      .text("SUBTOTAL", 470, tableTop + 5, { width: 80, align: "right" });

    // Contenido de la tabla (con manejo seguro de números)
    let y = tableTop + 25;
    doc.fontSize(10).fillColor(primaryColor);

    data.forEach((item) => {
      // Conversión numérica segura
      const precio = Number(item.precio_unitario) || 0;
      const cantidad = Number(item.cantidad) || 0;
      const subtotal = precio * cantidad;

      // Fila de servicio
      doc
        .text(item.servicio.toUpperCase(), 60, y)
        .text(cantidad.toString(), 350, y, { width: 50, align: "center" })
        .text(`$${precio.toFixed(2)}`, 400, y, { width: 70, align: "right" })
        .text(`$${subtotal.toFixed(2)}`, 470, y, { width: 80, align: "right" });

      // Descripción adicional (si existe)
      if (item.descripcion) {
        y += 15;
        doc
          .fontSize(8)
          .fillColor(secondaryColor)
          .text(item.descripcion, 65, y, { width: 450 });
      }

      y += 20;
    });

    // Total (con conversión numérica segura)
    const total = Number(data[0].total) || 0;
    const totalY = y + 20;

    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .text("TOTAL:", 400, totalY, { width: 70, align: "right" })
      .font("Helvetica-Bold")
      .text(`$${total.toFixed(2)}`, 470, totalY, {
        width: 80,
        align: "right",
        underline: true,
      })
      .font("Helvetica");

    // Estado de aprobación (mejorado)
    if (data[0].estado === "aprobada") {
      doc
        .fontSize(12)
        .fillColor("green")
        .text("COTIZACIÓN APROBADA POR EL CLIENTE", 50, totalY + 40)
        .fillColor("black")
        .text(
          `Fecha de aprobación: ${new Date().toLocaleDateString()}`,
          50,
          totalY + 60
        );
    }

    // Pie de página (estilo mejorado)
    const footerY = 750;
    doc
      .fontSize(10)
      .fillColor(secondaryColor)
      .text("Gracias por su preferencia", 50, footerY, {
        align: "center",
        width: 500,
      })
      .text(
        "Para cualquier duda, contactar a: contacto@tuempresa.com",
        50,
        footerY + 15,
        {
          align: "center",
          width: 500,
        }
      );

    doc.end();
  } catch (error) {
    console.error("Error general:", error);
    if (!res.headersSent) {
      res.status(500).send("Error al generar PDF");
    }
  }
};
