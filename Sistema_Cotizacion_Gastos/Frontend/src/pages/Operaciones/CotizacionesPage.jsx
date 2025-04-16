import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/general/Sidebar";

const OperacionesSidebarItems = [
  { path: "/operaciones/cotizaciones", label: "Cotizaciones" },
  { path: "/operaciones/gastos", label: "Gastos" },
  { path: "/operaciones/solicitudes", label: "Solicitudes" },
];

function CotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const fetchCotizaciones = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:3000/api/cotizaciones"
      );
      const formattedData = data.map((cotizacion) => ({
        ...cotizacion,
        total: Number(cotizacion.total) || 0,
      }));
      setCotizaciones(formattedData);
      setLoading(false);
    } catch (err) {
      setError("Error al cargar cotizaciones");
      setLoading(false);
      console.error("Error fetching cotizaciones:", err);
    }
  };

  const handleEstadoChange = async (id, nuevoEstado) => {
    try {
      await axios.put(`http://localhost:3000/api/cotizaciones/${id}/estado`, {
        estado: nuevoEstado,
      });
      fetchCotizaciones();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      alert("Error al actualizar el estado");
    }
  };

  const generarPDF = (id) => {
    window.open(`http://localhost:3000/api/cotizaciones/${id}/pdf`, "_blank");
  };

  useEffect(() => {
    fetchCotizaciones();
  }, []);

  if (loading) return <div className="ml-64 p-4">Cargando...</div>;
  if (error) return <div className="ml-64 p-4 text-red-500">{error}</div>;

  return (
    <>
      <Sidebar items={OperacionesSidebarItems} />

      <main className="ml-64 mt-16 p-4">
        <section className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5 antialiased">
          <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
            <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Listado de Cotizaciones
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cotizaciones.length > 0 ? (
                      cotizaciones.map((cotizacion) => (
                        <tr
                          key={cotizacion.id}
                          className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {cotizacion.id}
                          </td>
                          <td className="px-4 py-3">
                            {cotizacion.cliente_nombre || "N/A"}
                          </td>
                          <td className="px-4 py-3">
                            {cotizacion.fecha
                              ? new Date(cotizacion.fecha).toLocaleDateString(
                                  "es-ES",
                                  {
                                    year: "2-digit",
                                    month: "numeric",
                                    day: "numeric",
                                  }
                                )
                              : "N/A"}
                          </td>
                          <td className="px-4 py-3">
                            ${cotizacion.total.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                cotizacion.estado === "aprobada"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : cotizacion.estado === "rechazada"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              }`}
                            >
                              {cotizacion.estado || "pendiente"}
                            </span>
                          </td>
                          <td className="px-4 py-3 flex space-x-2">
                            {cotizacion.estado !== "aprobada" && (
                              <button
                                onClick={() =>
                                  handleEstadoChange(cotizacion.id, "aprobada")
                                }
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Aprobar
                              </button>
                            )}
                            {cotizacion.estado !== "rechazada" && (
                              <button
                                onClick={() =>
                                  handleEstadoChange(cotizacion.id, "rechazada")
                                }
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Rechazar
                              </button>
                            )}
                            {cotizacion.estado === "aprobada" && (
                              <button
                                onClick={() => generarPDF(cotizacion.id)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                PDF
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-3 text-center">
                          No hay cotizaciones disponibles
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default CotizacionesPage;
