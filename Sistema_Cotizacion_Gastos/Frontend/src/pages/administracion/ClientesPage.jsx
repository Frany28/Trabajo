import React, { useState, useEffect } from "react";
import Sidebar from "../../components/general/Sidebar";
import ListaClientes from "../../components/ClientesCRUD";

/**
 * @description Página de administración de clientes
 * @returns {JSX.Element} Componente de la página de administración de clientes
 * @component ClientesPage
 * @description Este componente representa la página de administración de clientes.
 * @description Muestra una lista de clientes y permite crear nuevos clientes.
 * @param {Array} clientes - Lista de clientes obtenidos desde la API.
 * @param {Function} setClientes - Función para actualizar la lista de clientes.
 * @param {boolean} mostrarFormulario - Estado que indica si se debe mostrar el formulario para crear un nuevo cliente.
 * @param {Function} setMostrarFormulario - Función para actualizar el estado de mostrarFormulario.
 * @param {Array} ClientesSidebarItems - Array de objetos que representan los items del sidebar.
 * @param {Function} obtenerClientes - Función para obtener la lista de clientes desde la API.
 * @param {Function} manejarGuardar - Función para manejar la creación de un nuevo cliente.
 * @param {Function} useEffect - Hook para manejar efectos secundarios en el componente.
 * @param {Function} useState - Hook para manejar el estado en el componente.
 */

function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const ClientesSidebarItems = [
    { path: "/administracion/clientes", label: "Clientes" },
    {
      path: "/administracion/Servicios-productos",
      label: "Servicios/Productos",
    },
    { path: "/administracion/proveedores", label: "Proveedores" },
  ];

  // Obtener clientes
  const obtenerClientes = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/clientes");
      const data = await res.json();
      console.log("✅ Clientes obtenidos: ", data);
      setClientes(data);
    } catch (error) {
      console.error("❌ Error al obtener clientes:", error);
      alert("Ocurrió un error al obtener la lista de clientes.");
    }
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  // Guardar cliente
  const manejarGuardar = async (nuevoCliente) => {
    try {
      const res = await fetch("http://localhost:3000/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoCliente),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Cliente registrado exitosamente.");
        console.log("✅ Cliente creado:", data);
        obtenerClientes();
        setMostrarFormulario(false);
      } else {
        alert("⚠️ Error al registrar el cliente.");
        console.error("❌ Respuesta del servidor:", data);
      }
    } catch (error) {
      alert("❌ Error al conectar con el servidor.");
      console.error("❌ Error en la creación del cliente:", error);
    }
  };

  return (
    <>
      <Sidebar items={ClientesSidebarItems} />

      <main className="ml-64 mt-16 p-4">
        <section className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5 antialiased">
          <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
            <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
              {/* Modal crear cliente */}
              {mostrarFormulario && (
                <ModalCrearCliente
                  onClose={() => setMostrarFormulario(false)}
                  onGuardar={manejarGuardar}
                  onCancel={() => setMostrarFormulario(false)}
                />
              )}

              {/* Tabla de Clientes */}
              <ListaClientes
                clientes={clientes}
                obtenerClientes={obtenerClientes}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default ClientesPage;
