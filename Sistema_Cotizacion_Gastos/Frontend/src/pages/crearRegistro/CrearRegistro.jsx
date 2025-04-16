// src/components/NuevoRegistro.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const NuevoRegistro = () => {
  const [servicios, setServicios] = useState([]);
  const [tipoRegistro, setTipoRegistro] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [clientes, setClientes] = useState([]);
  const [itemsAgregados, setItemsAgregados] = useState([]);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });
  const [mostrarFormCliente, setMostrarFormCliente] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  // Obtener datos iniciales
  useEffect(() => {
    const fetchDatosIniciales = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/registros");
        setServicios(response.data.servicios);
        setClientes(response.data.clientes);
        setLoading(false);
      } catch (err) {
        setError("Error al cargar los datos");
        setLoading(false);
        console.error(err);
      }
    };

    fetchDatosIniciales();
  }, []);

  // Filtrar servicios basados en la búsqueda
  const serviciosFiltrados = servicios.filter((servicio) =>
    servicio.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Agregar servicio al detalle
  const agregarServicio = (servicio) => {
    setItemsAgregados((prevItems) => [
      ...prevItems,
      {
        id: servicio.id,
        nombre: servicio.nombre,
        precio: servicio.precio,
        cantidad: 1,
      },
    ]);
  };

  // Eliminar item del detalle
  const eliminarItem = (id) => {
    setItemsAgregados((prevItems) =>
      prevItems.filter((item) => item.id !== id)
    );
  };

  // Actualizar cantidad de un item
  const actualizarCantidad = (id, nuevaCantidad) => {
    setItemsAgregados((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, cantidad: Math.max(1, nuevaCantidad) }
          : item
      )
    );
  };

  // Agregar nuevo cliente
  const agregarCliente = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/clientes",
        nuevoCliente
      );
      setClientes((prev) => [...prev, response.data]);
      setClienteSeleccionado(response.data.id);
      setMostrarFormCliente(false);
      setNuevoCliente({ nombre: "", email: "", telefono: "" });
    } catch (err) {
      console.error("Error al agregar cliente:", err);
      setError("Error al agregar cliente");
    }
  };

  // Crear el registro (cotización o gasto)
  const crearRegistro = async () => {
    if (itemsAgregados.length === 0) {
      setError("Debe agregar al menos un item");
      return;
    }

    try {
      const total = itemsAgregados.reduce(
        (sum, item) => sum + item.precio * item.cantidad,
        0
      );

      const datos = {
        tipo: tipoRegistro,
        datos: {
          cliente_id:
            tipoRegistro === "cotizacion" ? clienteSeleccionado : null,
          proveedor_id: tipoRegistro === "gasto" ? 1 : null, // Aquí deberías seleccionar proveedor
          total,
          detalle: itemsAgregados.map((item) => ({
            servicio_productos_id: item.id,
            cantidad: item.cantidad,
            precio_unitario: item.precio,
          })),
        },
      };

      await axios.post("http://localhost:3000/api/registros", datos);
      alert("Registro creado con éxito");
      // Resetear formulario
      setItemsAgregados([]);
      setTipoRegistro("");
      setClienteSeleccionado("");
    } catch (err) {
      console.error("Error al crear registro:", err);
      setError("Error al crear el registro");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando datos...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Nuevo Registro</h1>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* Barra de búsqueda */}
      <div className="flex mb-6">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-500"
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
            placeholder="Buscar servicios..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          />
        </div>
      </div>

      {/* Selector de tipo de registro */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo
        </label>
        <select
          value={tipoRegistro}
          onChange={(e) => {
            setTipoRegistro(e.target.value);
            setItemsAgregados([]);
          }}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        >
          <option value="">Seleccione un tipo de registro</option>
          <option value="cotizacion">Cotización</option>
          <option value="gasto">Gasto</option>
        </select>
      </div>

      {/* Selector de cliente (solo para cotizaciones) */}
      {tipoRegistro === "cotizacion" && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Cliente
            </label>
            <button
              onClick={() => setMostrarFormCliente(!mostrarFormCliente)}
              className="text-sm text-blue-600 hover:underline"
            >
              {mostrarFormCliente ? "Seleccionar existente" : "Agregar nuevo"}
            </button>
          </div>

          {mostrarFormCliente ? (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={nuevoCliente.nombre}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        nombre: e.target.value,
                      })
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={nuevoCliente.email}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        email: e.target.value,
                      })
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={nuevoCliente.telefono}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        telefono: e.target.value,
                      })
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  />
                </div>
              </div>
              <button
                onClick={agregarCliente}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                disabled={!nuevoCliente.nombre}
              >
                Guardar Cliente
              </button>
            </div>
          ) : (
            <select
              value={clienteSeleccionado}
              onChange={(e) => setClienteSeleccionado(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              <option value="">Seleccione un cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Lista de servicios/productos */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Servicios/Productos</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {serviciosFiltrados.map((servicio) => (
                <tr key={servicio.id} className="bg-white border-b">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {servicio.nombre}
                  </td>
                  <td className="px-4 py-3">${servicio.precio}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => agregarServicio(servicio)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Agregar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla de items agregados */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Detalle del Registro</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Nombre del servicio</th>
                <th className="px-4 py-3">Precio unitario</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Subtotal</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {itemsAgregados.length > 0 ? (
                itemsAgregados.map((item) => (
                  <tr key={item.id} className="bg-white border-b">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.nombre}
                    </td>
                    <td className="px-4 py-3">${item.precio}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) =>
                          actualizarCantidad(item.id, parseInt(e.target.value))
                        }
                        className="w-16 p-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      ${(item.precio * item.cantidad).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => eliminarItem(item.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="bg-white border-b">
                  <td
                    colSpan="5"
                    className="px-4 py-3 text-center text-gray-500"
                  >
                    No hay items agregados
                  </td>
                </tr>
              )}
              {itemsAgregados.length > 0 && (
                <tr className="bg-white font-bold">
                  <td colSpan="3" className="px-4 py-3 text-right">
                    Total:
                  </td>
                  <td className="px-4 py-3">
                    $
                    {itemsAgregados
                      .reduce(
                        (sum, item) => sum + item.precio * item.cantidad,
                        0
                      )
                      .toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4">
        <button className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400">
          Cancelar
        </button>
        <button
          onClick={crearRegistro}
          disabled={
            !tipoRegistro ||
            itemsAgregados.length === 0 ||
            (tipoRegistro === "cotizacion" && !clienteSeleccionado)
          }
          className={`px-4 py-2 rounded-lg ${
            !tipoRegistro ||
            itemsAgregados.length === 0 ||
            (tipoRegistro === "cotizacion" && !clienteSeleccionado)
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
        >
          Crear registro
        </button>
      </div>
    </div>
  );
};

export default NuevoRegistro;
