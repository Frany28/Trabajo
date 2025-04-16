import React, { useEffect, useState } from "react";
import axios from "axios";
import ModalAñadirProveedor from "./ModalAñadirProveedor";

const ProveedoresCRUD = ({ proveedores, obtenerProveedores }) => {
  const [proveedoresFiltrados, setProveedoresFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const [editandoProveedor, setEditandoProveedor] = useState(null);
  const [proveedorEditado, setProveedorEditado] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
  });
  const [mostrarModal, setMostrarModal] = useState(false);

  const LIMIT = 10; // Renamed to follow the allowed naming convention for unused variables
  

  useEffect(() => {
    setProveedoresFiltrados(proveedores);
    setLoading(false);
  }, [proveedores]);

  const abrirModal = () => setMostrarModal(true);
  const cerrarModal = () => setMostrarModal(false);

  const manejarBusqueda = (e) => {
    const termino = e.target.value;
    setBusqueda(termino);

    const filtrados = proveedores.filter(
      (proveedor) =>
        proveedor.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        proveedor.email.toLowerCase().includes(termino.toLowerCase()) ||
        proveedor.telefono.toLowerCase().includes(termino.toLowerCase()) ||
        (proveedor.direccion &&
          proveedor.direccion.toLowerCase().includes(termino.toLowerCase()))
    );

    setProveedoresFiltrados(filtrados);
  };

  const iniciarEdicion = (proveedor) => {
    setEditandoProveedor(proveedor);
    setProveedorEditado({
      nombre: proveedor.nombre || "",
      email: proveedor.email || "",
      telefono: proveedor.telefono || "",
      direccion: proveedor.direccion || "",
    });
  };

  const eliminarProveedor = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este proveedor?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/proveedores/${id}`);
      obtenerProveedores();
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
      alert("Hubo un error al eliminar el proveedor.");
    }
  };

  const manejarCambioFormulario = (e) => {
    const { name, value } = e.target;
    setProveedorEditado((prev) => ({ ...prev, [name]: value }));
  };

  const guardarProveedorEditado = async () => {
    try {
      const response = await axios.put(
        `http://localhost:3000/api/proveedores/${editandoProveedor.id}`,
        proveedorEditado
      );

      if (response.status === 200) {
        obtenerProveedores();
        setEditandoProveedor(null);
        alert("Proveedor actualizado correctamente");
      }
    } catch (error) {
      console.error("Error al editar proveedor:", error);
      obtenerProveedores();
      alert(
        "Hubo un error al actualizar el proveedor. Los datos se han actualizado."
      );
    }
  };

  const cancelarEdicion = () => {
    setEditandoProveedor(null);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 p-4">
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
                placeholder="Buscar proveedores..."
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
          Añadir Proveedor
        </button>

        {mostrarModal && (
          <ModalAñadirProveedor
            onCancel={cerrarModal}
            onSubmit={() => {
              obtenerProveedores();
              cerrarModal();
            }}
          />
        )}
      </div>

      {editandoProveedor ? (
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Editar Proveedor</h2>
          <form>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={proveedorEditado.nombre}
                onChange={manejarCambioFormulario}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={proveedorEditado.email}
                onChange={manejarCambioFormulario}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                type="text"
                name="telefono"
                value={proveedorEditado.telefono}
                onChange={manejarCambioFormulario}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={proveedorEditado.direccion}
                onChange={manejarCambioFormulario}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={guardarProveedorEditado}
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
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Dirección</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresFiltrados.map((proveedor) => (
              <tr key={proveedor.id} className="border-b dark:border-gray-700">
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {proveedor.nombre}
                </td>
                <td className="px-4 py-3">{proveedor.email}</td>
                <td className="px-4 py-3">{proveedor.telefono}</td>
                <td className="px-4 py-3">{proveedor.direccion || "-"}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => iniciarEdicion(proveedor)}
                    className="px-4 py-2 bg-blue-600 text-white rounded mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarProveedor(proveedor.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex justify-center mt-4">
        <button
          className="px-4 py-2 bg-gray-300 text-black rounded"
          onClick={() => setPage(page > 1 ? page - 1 : page)}
        >
          Anterior
        </button>
        <span className="mx-2">{`Página ${page}`}</span>
        <button
          className="px-4 py-2 bg-gray-300 text-black rounded"
          onClick={() => setPage(page + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default ProveedoresCRUD;
