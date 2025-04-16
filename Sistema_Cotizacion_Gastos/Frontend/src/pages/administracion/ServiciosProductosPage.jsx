// Frontend/components/ServiciosProductosPage.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/general/Sidebar";
import ListaServiciosProductos from "../../components/ServiciosProductosCRUD";

function ServiciosProductosPage() {
  const [serviciosProductos, setServiciosProductos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState("todos"); // 'todos', 'servicio' o 'producto'

  const ServiciosSidebarItems = [
    { path: "/administracion/clientes", label: "Clientes" },
    {
      path: "/administracion/Servicios-productos",
      label: "Servicios/Productos",
      active: true,
    },
    { path: "/administracion/proveedores", label: "Proveedores" },
  ];

  // Obtener servicios/productos
  const obtenerServiciosProductos = React.useCallback(async () => {
    try {
      let url = "http://localhost:3000/api/servicios-productos";
      // Añadir filtro si no es 'todos'
      if (tipoFiltro !== "todos") {
        url += `?tipo=${tipoFiltro}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      console.log("✅ Servicios/Productos obtenidos: ", data);
      setServiciosProductos(data);
    } catch (error) {
      console.error("❌ Error al obtener servicios/productos:", error);
      alert("Ocurrió un error al obtener la lista de servicios/productos.");
    }
  }, [tipoFiltro]);

  useEffect(() => {
    obtenerServiciosProductos();
  }, [tipoFiltro, obtenerServiciosProductos]); // Se ejecuta cuando cambia el filtro

  // Guardar servicio/producto
  async function manejarGuardar(nuevoServicioProducto) {
    try {
      const res = await fetch("http://localhost:3000/api/servicios-productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoServicioProducto),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Servicio/Producto registrado exitosamente.");
        console.log("✅ Servicio/Producto creado:", data);
        obtenerServiciosProductos();
        setMostrarFormulario(false);
      } else {
        alert("⚠️ Error al registrar el servicio/producto.");
        console.error("❌ Respuesta del servidor:", data);
      }
    } catch (error) {
      alert("❌ Error al conectar con el servidor.");
      console.error("❌ Error en la creación del servicio/producto:", error);
    }
  }

  return (
    <>
      <Sidebar items={ServiciosSidebarItems} />

      <main className="ml-64 mt-16 p-4">
        <section className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5 antialiased">
          <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
            <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
              {/* Filtros */}
              <div className="flex flex-col md:flex-row items-center justify-between p-4">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setTipoFiltro("todos")}
                    className={`px-4 py-2 rounded-md ${
                      tipoFiltro === "todos"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setTipoFiltro("servicio")}
                    className={`px-4 py-2 rounded-md ${
                      tipoFiltro === "servicio"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    Servicios
                  </button>
                  <button
                    onClick={() => setTipoFiltro("producto")}
                    className={`px-4 py-2 rounded-md ${
                      tipoFiltro === "producto"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    Productos
                  </button>
                </div>
              </div>

              {/* Modal crear servicio/producto */}
              {mostrarFormulario && (
                <ModalAñadirServicioProducto
                  onClose={() => setMostrarFormulario(false)}
                  onGuardar={manejarGuardar}
                  onCancel={() => setMostrarFormulario(false)}
                />
              )}

              {/* Tabla de Servicios/Productos */}
              <ListaServiciosProductos
                serviciosProductos={serviciosProductos}
                obtenerServiciosProductos={obtenerServiciosProductos}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default ServiciosProductosPage;
