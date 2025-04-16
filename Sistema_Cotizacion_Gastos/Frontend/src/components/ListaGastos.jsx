import React, { useState, useEffect } from "react";
import axios from "axios";

const ListaGastos = () => {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [mostrarCategorias, setMostrarCategorias] = useState(false);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [editandoGasto, setEditandoGasto] = useState(null);
  const [gastoEditado, setGastoEditado] = useState({
    monto: "",
    descripcion: "",
    estado: "pendiente",
  });

  // Función para iniciar la edición
  const iniciarEdicion = (gasto) => {
    setEditandoGasto(gasto);
    setGastoEditado({
      monto: gasto.monto || "",
      descripcion: gasto.descripcion || "",
      estado: gasto.estado || "pendiente",
    });
  };

  // Función para manejar cambios en el formulario de edición
  const manejarCambioFormulario = (e) => {
    const { name, value } = e.target;
    setGastoEditado((prev) => ({ ...prev, [name]: value }));
  };

  // Función para guardar los cambios
  const guardarGastoEditado = async () => {
    try {
      await axios.put(
        `http://localhost:3000/api/gastos/${editandoGasto.id}`,
        gastoEditado
      );
      setEditandoGasto(null);
      fetchGastos(); // Recargar los datos
    } catch (error) {
      console.error("Error al actualizar gasto:", error);
      alert("Hubo un error al actualizar el gasto");
    }
  };

  // Función para cancelar la edición
  const cancelarEdicion = () => {
    setEditandoGasto(null);
  };

  // Función para eliminar un gasto
  const eliminarGasto = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este gasto?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/gastos/${id}`);
      fetchGastos(); // Recargar los datos
    } catch (error) {
      console.error("Error al eliminar gasto:", error);
      alert("Hubo un error al eliminar el gasto");
    }
  };

  const fetchGastos = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page,
        estado: "",
        desde: "",
        hasta: "",
        categoria_id:
          categoriaSeleccionada === "Todas"
            ? ""
            : categoriasDisponibles.find(
                (c) => c.nombre === categoriaSeleccionada
              )?.id,
      }).toString();

      const response = await axios.get(
        `http://localhost:3000/api/gastos?${params}`
      );

      // Verificar la estructura de la respuesta
      if (response.data && response.data.data) {
        // Procesar la estructura anidada correctamente
        setGastos(response.data.data);

        // Extraer información de paginación
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages || 1);
        }

        // Extraer categorías únicas para el dropdown
        const todasCategorias = response.data.data.map((categoria) => ({
          id: categoria.id,
          nombre: categoria.categoria,
        }));

        // Eliminar duplicados
        setCategoriasDisponibles(
          todasCategorias.filter(
            (v, i, a) => a.findIndex((t) => t.nombre === v.nombre) === i
          )
        );
      } else if (Array.isArray(response.data)) {
        // Mantener compatibilidad con la estructura anterior
        setGastos(response.data);

        // Extraer categorías únicas para el dropdown
        setCategoriasDisponibles(
          response.data
            .map((item) => ({
              id: item.id,
              nombre: item.categoria,
            }))
            .filter(
              (v, i, a) => a.findIndex((t) => t.nombre === v.nombre) === i
            )
        );
      } else {
        throw new Error("Formato de datos no reconocido");
      }

      setLoading(false);
    } catch (err) {
      console.error("Error al obtener gastos:", err);
      setError(err.message || "Error al cargar los gastos");
      setLoading(false);
    }
  };

  const manejarBusqueda = (e) => {
    setBusqueda(e.target.value);
  };

  const seleccionarCategoria = (categoria) => {
    setCategoriaSeleccionada(categoria);
    setPage(1);
    setMostrarCategorias(false);
  };

  useEffect(() => {
    fetchGastos();
  }, [page, categoriaSeleccionada]);

  // Filtrar gastos basados en la búsqueda
  const gastosFiltrados = gastos
    .map((categoria) => ({
      ...categoria,
      gastos:
        categoria.gastos?.filter(
          (gasto) =>
            (gasto.proveedor?.toLowerCase().includes(busqueda.toLowerCase()) ||
              gasto.concepto?.toLowerCase().includes(busqueda.toLowerCase()) ||
              gasto.descripcion
                ?.toLowerCase()
                .includes(busqueda.toLowerCase()) ||
              gasto.id.toString().includes(busqueda)) &&
            (categoriaSeleccionada === "Todas" ||
              categoria.categoria === categoriaSeleccionada)
        ) || [],
    }))
    .filter((categoria) => categoria.gastos.length > 0);

  if (loading) return <div className="p-4">Cargando gastos...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="ml-64 mt-16 bg-gray-50 dark:bg-gray-900 p-3 sm:p-5 antialiased">
      <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
        <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
          {/* Encabezado y búsqueda */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Listado de Gastos
            </h2>

            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              {/* Dropdown de categorías */}
              <div className="relative ">
                <button
                  onClick={() => setMostrarCategorias(!mostrarCategorias)}
                  className="flex items-center justify-between w-full md:w-48 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {categoriaSeleccionada}
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {mostrarCategorias && (
                  <div className="fixed z-10 w- mt-1  rounded-md shadow-lg bg-gray-700">
                    <ul className="py-1 overflow-auto text-base max-h-60">
                      <li>
                        <button
                          onClick={() => seleccionarCategoria("Todas")}
                          className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                        >
                          Todas
                        </button>
                      </li>
                      {categoriasDisponibles.map((categoria) => (
                        <li key={categoria.id}>
                          <button
                            onClick={() =>
                              seleccionarCategoria(categoria.nombre)
                            }
                            className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                          >
                            {categoria.nombre}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Barra de búsqueda */}
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
                  placeholder="Buscar gastos..."
                  value={busqueda}
                  onChange={manejarBusqueda}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
              </div>
            </div>
          </div>
          {/* Lista de gastos */}
          {gastosFiltrados.length > 0 ? (
            gastosFiltrados.map((categoria) => (
              <div key={categoria.id} className="mb-6">
                <div className="p-4 bg-gray-100 dark:bg-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {categoria.categoria} - Total: ${categoria.total} (
                    {categoria.cantidad} gastos)
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th className="px-4 py-3">Proveedor</th>
                        <th className="px-4 py-3">Concepto</th>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Monto</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoria.gastos.length > 0 ? (
                        categoria.gastos.map((gasto) => (
                          <tr
                            key={gasto.id}
                            className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                          >
                            <td className="px-4 py-3">
                              {gasto.proveedor || "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              {gasto.concepto || "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              {gasto.fecha || "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              ${parseFloat(gasto.monto).toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  gasto.estado === "aprobado"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : gasto.estado === "rechazado"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                    : gasto.estado === "pagado"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                }`}
                              >
                                {gasto.estado || "pendiente"}
                              </span>
                            </td>

                            <td className="px-4 py-3 space-x-2">
                              <button
                                onClick={() => iniciarEdicion(gasto)}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => eliminarGasto(gasto.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-4 py-3 text-center">
                            No hay gastos en esta categoría
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No hay gastos disponibles
            </div>
          )}
          {/* Paginación mejorada */}
          <div className="flex justify-center items-center mt-4 pb-4">
            <button
              className="px-4 py-2 bg-gray-300 text-black rounded disabled:opacity-50"
              onClick={() => setPage(page > 1 ? page - 1 : page)}
              disabled={page <= 1}
            >
              Anterior
            </button>
            <span className="mx-2 px-3 py-1 bg-gray-700 text-white rounded">
              {`Página ${page} de ${totalPages}`}
            </span>
            <button
              className="px-4 py-2 bg-gray-300 text-black rounded disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
      {editandoGasto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Editar Gasto
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Monto
              </label>
              <input
                type="number"
                name="monto"
                value={gastoEditado.monto}
                onChange={manejarCambioFormulario}
                className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                step="0.01"
                min="0"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <select
                name="estado"
                value={gastoEditado.estado}
                onChange={manejarCambioFormulario}
                className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="pendiente">Pendiente</option>
                <option value="aprobado">Aprobado</option>
                <option value="pagado">Pagado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={gastoEditado.descripcion}
                onChange={manejarCambioFormulario}
                className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                rows="3"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelarEdicion}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded dark:bg-gray-600 dark:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={guardarGastoEditado}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaGastos;
