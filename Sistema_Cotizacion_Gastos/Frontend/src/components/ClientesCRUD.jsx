// src/components/ListaClientes.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import ModalAñadirCliente from "./ModalAñadirCliente";

const ListaClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState(""); 
  const [page, setPage] = useState(1);
  const [editandoCliente, setEditandoCliente] = useState(null);
  const [clienteEditado, setClienteEditado] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
  });

  // Función para iniciar la edición de un cliente
  // Se usa para llenar el formulario de edición con los datos del cliente seleccionado
  const iniciarEdicion = (cliente) => {
    setEditandoCliente(cliente);
    setClienteEditado({
      nombre: cliente.nombre || "",
      email: cliente.email || "",
      telefono: cliente.telefono || "",
      direccion: cliente.direccion || "",
    });
  };
  const [mostrarModal, setMostrarModal] = useState(false); // Estado del modal

  const limit = 10;

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/api/clientes?page=${page}&limit=${limit}`
      );
      setClientes(response.data);
      setClientesFiltrados(response.data); // Inicializamos los clientes filtrados con todos los clientes
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const abrirModal = () => setMostrarModal(true);
  const cerrarModal = () => setMostrarModal(false);

  // Función para manejar el cambio en el input de búsqueda
  const manejarBusqueda = (e) => {
    const termino = e.target.value;
    setBusqueda(termino);

    // Filtramos los clientes que coinciden con el término de búsqueda
    const clientesFiltrados = clientes.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        cliente.email.toLowerCase().includes(termino.toLowerCase()) ||
        cliente.telefono.toLowerCase().includes(termino.toLowerCase()) ||
        cliente.direccion.toLowerCase().includes(termino.toLowerCase())
    );

    setClientesFiltrados(clientesFiltrados);
  };

  const eliminarCliente = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este cliente?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/clientes/${id}`);
      setClientes((prev) => prev.filter((cliente) => cliente.id !== id));
      setClientesFiltrados((prev) =>
        prev.filter((cliente) => cliente.id !== id)
      ); // Filtrar de la lista mostrada
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      alert("Hubo un error al eliminar el cliente.");
    }
  };

  const manejarCambioFormulario = (e) => {
    const { name, value } = e.target;
    setClienteEditado((prev) => ({ ...prev, [name]: value }));
  };

  const guardarClienteEditado = async () => {
    try {
      // 1. Enviar los cambios al servidor
      const response = await axios.put(
        `http://localhost:3000/api/clientes/${editandoCliente.id}`,
        clienteEditado
      );
      const actualizado = response.data;

      // 2. Actualización optimista del estado local
      const nuevosClientes = clientes.map((cliente) =>
        cliente.id === actualizado.id ? { ...cliente, ...actualizado } : cliente
      );

      setClientes(nuevosClientes);
      setClientesFiltrados(nuevosClientes);

      // 3. Forzar recarga de datos desde el servidor para garantizar consistencia
      await fetchClientes();

      // 4. Cerrar el formulario de edición y mostrar feedback
      setEditandoCliente(null);
      alert("Cliente actualizado correctamente");
    } catch (error) {
      console.error("Error al editar cliente:", error);

      // 5. En caso de error, recargar los datos originales
      await fetchClientes();

      alert(
        "Hubo un error al actualizar el cliente. Los datos se han actualizado."
      );
    }
  };

  const cancelarEdicion = () => {
    setEditandoCliente(null); // Cerrar formulario de edición sin guardar
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 p-4">
        {/* Buscador */}
        <div className=" w-full md:w-1/2 ">
          <form className="flex items-center">
            <label htmlFor="busqueda-simple" className="sr-only ">
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
                placeholder="Buscar clientes..."
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
          Añadir Cliente
        </button>

        {mostrarModal && (
          <ModalAñadirCliente
            onCancel={cerrarModal}
            onSubmit={(nuevoCliente) => {
              setClientes((prevClientes) => [...prevClientes, nuevoCliente]); // Agregar cliente a la lista
              setClientesFiltrados((prevClientes) => [
                ...prevClientes,
                nuevoCliente,
              ]);
              cerrarModal(); // Cerrar el modal después de agregar el cliente
            }}
          />
        )}
      </div>

      {/* Lista de Clientes */}
      {editandoCliente ? (
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Editar Cliente</h2>
          <form>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={clienteEditado.nombre}
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
                value={clienteEditado.email}
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
                value={clienteEditado.telefono}
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
                value={clienteEditado.direccion}
                onChange={manejarCambioFormulario}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={guardarClienteEditado}
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
            {clientesFiltrados.map((cliente) => (
              <tr key={cliente.id} className="border-b dark:border-gray-700">
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {cliente.nombre}
                </td>
                <td className="px-4 py-3">{cliente.email}</td>
                <td className="px-4 py-3">{cliente.telefono}</td>
                <td className="px-4 py-3">{cliente.direccion}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => iniciarEdicion(cliente)}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarCliente(cliente.id)}
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
      {/* Paginación */}
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

export default ListaClientes;
