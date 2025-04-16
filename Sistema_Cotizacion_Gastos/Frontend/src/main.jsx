import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout.jsx";
import "./Styles/styles.css";
import {
  Dashboard,
  Administracion,
  ServiciosProductosPage,
  Operaciones,
  CotizacionesPage,
  RelacionesGatos,
  CrearRegistro,
  ProveedoresPage,
  ClientesPage,
  GastosPage,
} from "./pages/pages.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/administracion" element={<Administracion />} />
          <Route
            path="/administracion/servicios-productos"
            element={<ServiciosProductosPage />}
          />
          <Route path="/administracion/clientes" element={<ClientesPage />} />
          <Route
            path="/administracion/proveedores"
            element={<ProveedoresPage />}
          />
          <Route path="/operaciones" element={<Operaciones />} />
          <Route
            path="/operaciones/cotizaciones"
            element={<CotizacionesPage />}
          />
          <Route path="/operaciones/gastos" element={<GastosPage />} />
          <Route path="/crearRegistro" element={<CrearRegistro />} />
          <Route path="/reportes" element={<RelacionesGatos />} />

          <Route path="*" element={<h1>Not Found</h1>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </StrictMode>
);
