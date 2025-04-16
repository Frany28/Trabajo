// src/pages/GastosPage.jsx
import Sidebar from "../../components/general/Sidebar";
import ListaGastos from "../../components/ListaGastos";

const GastosSidebarItems = [
  { path: "/operaciones/cotizaciones", label: "Cotizaciones" },
  { path: "/operaciones/gastos", label: "Gastos" },
  { path: "/operaciones/solicitudes", label: "Solicitudes" },
];

function GastosPage() {
  return (
    <>
      <Sidebar items={GastosSidebarItems} />
      
      <ListaGastos />
    </>
  );
}

export default GastosPage;
