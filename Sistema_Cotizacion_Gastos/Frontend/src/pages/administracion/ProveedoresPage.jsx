import Sidebar from "../../components/general/Sidebar";
import React, { useState, useEffect } from "react";
import ListaProveedores from "../../components/ProveedoresCRUD";

const ProveedoresSidebarItems = [
  { path: "/administracion/clientes", label: "Clientes" },
  { path: "/administracion/Servicios-productos", label: "Servicios/Productos" },
  { path: "/administracion/proveedores", label: "Proveedores", active: true },
];
function ProveedoresPage() {
  <Sidebar items={ProveedoresSidebarItems} />;
  const [proveedores, setProveedores] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Obtener proveedores
  const obtenerProveedores = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/proveedores");
      const data = await res.json();
      console.log("✅ Proveedores obtenidos: ", data);
      setProveedores(data);
    } catch (error) {
      console.error("❌ Error al obtener proveedores:", error);
      alert("Ocurrió un error al obtener la lista de proveedores.");
    }
  };

  useEffect(() => {
    obtenerProveedores();
  }, []);

  // Guardar proveedor
  const manejarGuardar = async (nuevoProveedor) => {
    try {
      const res = await fetch("http://localhost:3000/api/proveedores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoProveedor),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Proveedor registrado exitosamente.");
        console.log("✅ Proveedor creado:", data);
        obtenerProveedores();
        setMostrarFormulario(false);
      } else {
        alert("⚠️ Error al registrar el proveedor.");
        console.error("❌ Respuesta del servidor:", data);
      }
    } catch (error) {
      alert("❌ Error al conectar con el servidor.");
      console.error("❌ Error en la creación del proveedor:", error);
    }
  };

  return (
    <>
      <Sidebar items={ProveedoresSidebarItems} />

      <main className="ml-64 mt-16 p-4">
        <section className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5 antialiased">
          <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
            <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
              {/* Modal crear proveedor */}
              {mostrarFormulario && (
                <ModalAñadirProveedor
                  onClose={() => setMostrarFormulario(false)}
                  onGuardar={manejarGuardar}
                  onCancel={() => setMostrarFormulario(false)}
                />
              )}

              {/* Tabla de Proveedores */}
              <ListaProveedores
                proveedores={proveedores}
                obtenerProveedores={obtenerProveedores}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default ProveedoresPage;
