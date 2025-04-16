// src/components/GastosCRUD.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const GastosCRUD = () => {
  const [gastos, setGastos] = useState([]);
  const [gastosFiltrados, setGastosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const [editandoGasto, setEditandoGasto] = useState(null);
  const [gastoEditado, setGastoEditado] = useState({
    tipo_gasto_id: "",
    proveedor_id: "",
    concepto_pago_id: "",
    monto: "",
    descripcion: "",
    fecha: "",
    estado: "pendiente",
  });
  const [tiposGasto, setTiposGasto] = useState([]);

  const limit = 10;

  const fetchGastos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/api/gastos?page=${page}&limit=${limit}`
      );
      setGastos(response.data);
      setGastosFiltrados(response.data);
    } catch (error) {
      console.error("Error al obtener gastos:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchTiposGasto = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/gastos/tipos"
      );
      setTiposGasto(response.data);
    } catch (error) {
      console.error("Error al obtener tipos de gasto:", error);
    }
  };

  useEffect(() => {
    fetchGastos();
    fetchTiposGasto();
  }, [fetchGastos]);

  const manejarBusqueda = (e) => {
    const termino = e.target.value;
    setBusqueda(termino);

    const gastosFiltrados = gastos.filter(
      (gasto) =>
        (gasto.descripcion &&
          gasto.descripcion.toLowerCase().includes(termino.toLowerCase())) ||
        (gasto.monto && gasto.monto.toString().includes(termino)) ||
        (gasto.fecha && gasto.fecha.includes(termino)) ||
        tiposGasto
          .find((t) => t.id === gasto.tipo_gasto_id)
          ?.nombre.toLowerCase()
          .includes(termino.toLowerCase())
    );

    setGastosFiltrados(gastosFiltrados);
  };

  const eliminarGasto = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este gasto?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/gastos/${id}`);
      setGastos((prev) => prev.filter((gasto) => gasto.id !== id));
      setGastosFiltrados((prev) => prev.filter((gasto) => gasto.id !== id));
    } catch (error) {
      console.error("Error al eliminar gasto:", error);
      alert("Hubo un error al eliminar el gasto.");
    }
  };

  const iniciarEdicion = (gasto) => {
    setEditandoGasto(gasto);
    setGastoEditado({
      tipo_gasto_id: gasto.tipo_gasto_id || "",
      proveedor_id: gasto.proveedor_id || "",
      concepto_pago_id: gasto.concepto_pago_id || "",
      monto: gasto.monto || "",
      descripcion: gasto.descripcion || "",
      fecha: gasto.fecha || "",
      estado: gasto.estado || "pendiente",
    });
  };

  const manejarCambioFormulario = (e) => {
    const { name, value } = e.target;
    setGastoEditado((prev) => ({ ...prev, [name]: value }));
  };

  const guardarGastoEditado = async () => {
    try {
      const response = await axios.put(
        `http://localhost:3000/api/gastos/${editandoGasto.id}`,
        gastoEditado
      );

      const nuevosGastos = gastos.map((gasto) =>
        gasto.id === editandoGasto.id ? { ...gasto, ...response.data } : gasto
      );

      setGastos(nuevosGastos);
      setGastosFiltrados(nuevosGastos);
      setEditandoGasto(null);
      alert("Gasto actualizado correctamente");
    } catch (error) {
      console.error("Error al editar gasto:", error);
      alert("Hubo un error al actualizar el gasto.");
    }
  };

  const cancelarEdicion = () => {
    setEditandoGasto(null);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES");
  };

  const obtenerNombreTipoGasto = (id) => {
    const tipo = tiposGasto.find((t) => t.id === id);
    return tipo ? tipo.nombre : "Desconocido";
  };

  if (loading) {
    return <div className="text-center py-8">Cargando gastos...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 p-4">
        {/* Buscador */}
        <div className="w-full md:w-1/2">
          <form className="flex items-center">
            <label htmlFor="busqueda-gastos" className="sr-only">
              Buscar gastos
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
                id="busqueda-gastos"
                placeholder="Buscar gastos..."
                value={busqueda}
                onChange={manejarBusqueda}
                className="pl-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Lista de Gastos */}
      {editandoGasto ? (
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Editar Gasto</h2>
          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Gasto
                </label>
                <select
                  name="tipo_gasto_id"
                  value={gastoEditado.tipo_gasto_id}
                  onChange={manejarCambioFormulario}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Seleccione un tipo</option>
                  {tiposGasto.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Monto
                </label>
                <input
                  type="number"
                  name="monto"
                  value={gastoEditado.monto}
                  onChange={manejarCambioFormulario}
                  className="w-full p-2 border border-gray-300 rounded"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={gastoEditado.fecha}
                  onChange={manejarCambioFormulario}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <select
                  name="estado"
                  value={gastoEditado.estado}
                  onChange={manejarCambioFormulario}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="pagado">Pagado</option>
                  <option value="rechazado">Rechazado</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={gastoEditado.descripcion}
                onChange={manejarCambioFormulario}
                className="w-full p-2 border border-gray-300 rounded"
                rows="3"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={guardarGastoEditado}
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
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {gastosFiltrados.map((gasto) => (
                <tr key={gasto.id} className="border-b dark:border-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {obtenerNombreTipoGasto(gasto.tipo_gasto_id)}
                  </td>
                  <td className="px-4 py-3">${gasto.monto}</td>
                  <td className="px-4 py-3">{formatearFecha(gasto.fecha)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        gasto.estado === "aprobado"
                          ? "bg-green-100 text-green-800"
                          : gasto.estado === "pendiente"
                          ? "bg-yellow-100 text-yellow-800"
                          : gasto.estado === "pagado"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {gasto.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">{gasto.descripcion || "N/A"}</td>
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
              ))}
            </tbody>
          </table>
        </div>
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

export default GastosCRUD;
