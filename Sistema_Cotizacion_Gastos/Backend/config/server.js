// Backend/config/server.js
import express from "express";
import cors from "cors";
import clientesRoutes from "../routes/clientes.routes.js";
import serviciosProductosRoutes from "../routes/servicios_productos.routes.js";
import proveedoresRoutes from "../routes/proveedores.routes.js";
import cotizacionesRoutes from "../routes/cotizaciones.routes.js";
import gastosRoutes from "../routes/gastos.routes.js";
import registrosRoutes from "../routes/registros.routes.js"; // Nueva importación

const app = express();
app.use(cors());
app.use(express.json());

// Rutas existentes
app.use("/api/clientes", clientesRoutes);
app.use("/api/servicios-productos", serviciosProductosRoutes);
app.use("/api/cotizaciones", cotizacionesRoutes);
app.use("/api/proveedores", proveedoresRoutes);
app.use("/api/gastos", gastosRoutes);
app.use("/api/registros", registrosRoutes); // Nueva ruta

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
