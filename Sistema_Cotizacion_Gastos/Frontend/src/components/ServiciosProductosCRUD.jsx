// src/components/ListaServiciosProductos.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import ModalAñadirServicioProducto from "./ModalAñadirServicioProducto";

const ListaServiciosProductos = ({
  serviciosProductos,
  obtenerServiciosProductos,
}) => {
  const [serviciosFiltrados, setServiciosFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [editandoServicio, setEditandoServicio] = useState(null);

  const [servicioEditado, setServicioEditado] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    tipo: "servicio",
  });
  const [mostrarModal, setMostrarModal] = useState(false);

  // Inicializar servicios filtrados
  useEffect(() => {
    setServiciosFiltrados(serviciosProductos);
  }, [serviciosProductos]);

  // Función para manejar búsqueda
  const manejarBusqueda = (e) => {
    const termino = e.target.value;
    setBusqueda(termino);

    const filtrados = serviciosProductos.filter(
      (item) =>
        item.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(termino.toLowerCase()) ||
        item.precio.toString().includes(termino) ||
        item.tipo.toLowerCase().includes(termino.toLowerCase())
    );

    setServiciosFiltrados(filtrados);
  };

  // Iniciar edición
  const iniciarEdicion = (servicio) => {
    setEditandoServicio(servicio);
    setServicioEditado({
      nombre: servicio.nombre || "",
      descripcion: servicio.descripcion || "",
      precio: servicio.precio || "",
      tipo: servicio.tipo || "servicio",
    });
  };

  // Eliminar servicio/producto
  const eliminarServicio = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este registro?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/servicios-productos/${id}`);
      obtenerServiciosProductos(); // Refrescar la lista
      alert("Registro eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Hubo un error al eliminar el registro");
    }
  };

  // Manejar cambios en el formulario de edición
  const manejarCambioFormulario = (e) => {
    const { name, value } = e.target;
    setServicioEditado((prev) => ({
      ...prev,
      [name]: name === "precio" ? parseFloat(value) || 0 : value,
    }));
  };

  // En ListaServiciosProductos.jsx

  // 1. Modifica la función guardarServicioEditado
  const guardarServicioEditado = async () => {
    try {
      // Asegurarnos que el precio es número
      const datosActualizados = {
        ...servicioEditado,
        precio: Number(servicioEditado.precio),
      };

      const response = await axios.put(
        `http://localhost:3000/api/servicios-productos/${editandoServicio.id}`,
        datosActualizados
      );

      if (response.status === 200) {
        // Actualización optimista del estado local
        const nuevosServicios = serviciosProductos.map((item) =>
          item.id === editandoServicio.id
            ? { ...item, ...datosActualizados }
            : item
        );

        setServiciosFiltrados(nuevosServicios);
        setServiciosFiltrados(nuevosServicios);

        // Opcional: Recargar datos desde el servidor para garantizar consistencia
        await obtenerServiciosProductos();

        setEditandoServicio(null);
        alert("Registro actualizado correctamente");
      } else {
        throw new Error(response.data?.message || "Error al actualizar");
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
      // Recargar datos originales
      await obtenerServiciosProductos();
      alert(`Error al actualizar: ${error.message}`);
    }
  };

  const cancelarEdicion = () => {
    setEditandoServicio(null);
  };

  const abrirModal = () => setMostrarModal(true);
  const cerrarModal = () => setMostrarModal(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-4 p-4">
        {/* Buscador */}
        <div className="w-full md:w-1/2">
          <form className="flex items-center">
            <label htmlFor="busqueda-simple" className="sr-only">
              Buscar
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500 dark:text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="busqueda-simple"
                placeholder="Buscar servicios/productos..."
                value={busqueda}
                onChange={manejarBusqueda}
                className="pl-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </form>
        </div>

        <button
          onClick={abrirModal}
          className="text-white bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded-md"
        >
          Añadir Servicio/Producto
        </button>

        {mostrarModal && (
          <ModalAñadirServicioProducto
            onCancel={cerrarModal}
            onSubmit={() => {
              obtenerServiciosProductos();
              cerrarModal();
            }}
          />
        )}
      </div>

      {/* Formulario de edición */}
      {editandoServicio ? (
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-lg font-semibold mb-4">
            Editar Servicio/Producto
          </h2>
          <form>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={servicioEditado.nombre}
                onChange={manejarCambioFormulario}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={servicioEditado.descripcion}
                onChange={manejarCambioFormulario}
                className="w-full p-2 border border-gray-300 rounded"
                rows="3"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Precio
              </label>
              <input
                type="number"
                name="precio"
                value={servicioEditado.precio}
                onChange={manejarCambioFormulario}
                className="w-full p-2 border border-gray-300 rounded"
                step="0.01"
                min="0"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Tipo
              </label>
              <select
                name="tipo"
                value={servicioEditado.tipo}
                onChange={manejarCambioFormulario}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="servicio">Servicio</option>
                <option value="producto">Producto</option>
              </select>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={guardarServicioEditado}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={cancelarEdicion}
                className="px-4 py-2 bg-gray-300 text-black rounded"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {serviciosFiltrados.map((item) => (
                <tr key={item.id} className="border-b dark:border-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {item.nombre}
                  </td>
                  <td className="px-4 py-3">{item.descripcion}</td>
                  <td className="px-4 py-3">
                    ${Number(item.precio).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 capitalize">{item.tipo}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => iniciarEdicion(item)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarServicio(item.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListaServiciosProductos;
