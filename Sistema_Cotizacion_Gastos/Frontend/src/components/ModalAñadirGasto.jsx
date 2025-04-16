// src/components/ModalAñadirGasto.jsx
import { useState } from "react";
import axios from "axios";

export default function ModalAñadirGasto({ onCancel, onSubmit, tiposGasto }) {
  const [form, setForm] = useState({
    tipo_gasto_id: "",
    proveedor_id: "",
    concepto_pago_id: "",
    monto: "",
    descripcion: "",
    fecha: "",
    estado: "pendiente",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    if (serverError) setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.tipo_gasto_id) {
      newErrors.tipo_gasto_id = "El tipo de gasto es requerido";
    }
    if (!form.monto || isNaN(form.monto) || parseFloat(form.monto) <= 0) {
      newErrors.monto = "El monto debe ser un número positivo";
    }
    if (!form.fecha) {
      newErrors.fecha = "La fecha es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/gastos",
        form
      );

      if (response.status === 201) {
        alert("Gasto agregado exitosamente!");
        onSubmit(response.data);
        setForm({
          tipo_gasto_id: "",
          proveedor_id: "",
          concepto_pago_id: "",
          monto: "",
          descripcion: "",
          fecha: "",
          estado: "pendiente",
        });
        onCancel();
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response) {
        setServerError(
          error.response.data.error ||
            "Error al agregar el gasto. Por favor intente nuevamente."
        );
      } else {
        setServerError("Error de conexión. Por favor intente nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
      <div className="relative p-4 w-full max-w-2xl max-h-full">
        <div className="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
          <div className="flex justify-between items-center pb-4 mb-4 border-b rounded-t dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Añadir Gasto
            </h3>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">Cerrar</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 mb-4">
            {serverError && (
              <div className="col-span-2 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {serverError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Tipo de Gasto*
                </label>
                <select
                  name="tipo_gasto_id"
                  value={form.tipo_gasto_id}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">Seleccione un tipo</option>
                  {tiposGasto.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
                {errors.tipo_gasto_id && (
                  <p className="text-red-500 text-sm">{errors.tipo_gasto_id}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Monto*
                </label>
                <input
                  type="number"
                  name="monto"
                  value={form.monto}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
                {errors.monto && (
                  <p className="text-red-500 text-sm">{errors.monto}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Fecha*
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={form.fecha}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
                {errors.fecha && (
                  <p className="text-red-500 text-sm">{errors.fecha}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Estado
                </label>
                <select
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="pagado">Pagado</option>
                  <option value="rechazado">Rechazado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows="3"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Descripción del gasto..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300"
                }`}
              >
                {isSubmitting ? "Guardando..." : "Guardar Gasto"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
