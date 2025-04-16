import React from "react";
import Sidebar from "../../components/general/Sidebar";
import ClientesPage from "./ClientesPage";
import ServiciosProductosPage from "./ServiciosProductosPage";
import ProveedoresPage from "./ProveedoresPage";

const ClientesSidebarItems = [
  { path: "/administracion/clientes", label: "Clientes" },
  { path: "/administracion/Servicios-productos", label: "Servicios/Productos" },
  { path: "/administracion/proveedores", label: "Proveedores" },
];

function administracion() {
  return (
    <>
      <Sidebar items={ClientesSidebarItems}>
        <ClientesPage />
        <ServiciosProductosPage />
        <ProveedoresPage />
      </Sidebar>
    </>
  );
}

export default administracion;
