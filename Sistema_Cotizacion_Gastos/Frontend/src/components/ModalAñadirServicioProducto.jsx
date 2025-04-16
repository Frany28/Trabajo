// src/components/ModalAñadirServicioProducto.jsx
import { useState } from "react";
import axios from "axios";

const regexNombre = /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/;
const regexPrecio = /^\d+(\.\d{1,2})?$/;

export default function ModalAñadirServicioProducto({ onCancel, onSubmit }) {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    tipo: "servicio",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Limpiar errores cuando el usuario escribe
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    if (serverError) setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (!regexNombre.test(form.nombre)) {
      newErrors.nombre = "El nombre contiene caracteres no válidos";
    }

    if (!form.descripcion.trim()) {
      newErrors.descripcion = "La descripción es requerida";
    }

    if (!form.precio) {
      newErrors.precio = "El precio es requerido";
    } else if (!regexPrecio.test(form.precio)) {
      newErrors.precio = "El precio debe ser un número válido (ej. 10.99)";
    } else if (parseFloat(form.precio) <= 0) {
      newErrors.precio = "El precio debe ser mayor a cero";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkExisting = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/servicios-productos/check",
        {
          params: {
            nombre: form.nombre.trim(),
          },
          validateStatus: (status) => status < 500,
        }
      );

      if (!response.data || typeof response.data.exists === "undefined") {
        console.error("Respuesta inesperada:", response.data);
        return false;
      }

      return response.data.exists;
    } catch (error) {
      console.error("Error en verificación:", {
        message: error.message,
        response: error.response?.data,
      });
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Verificar si ya existe
      const exists = await checkExisting();
      if (exists) {
        setServerError("Ya existe un servicio/producto con este nombre");
        setIsSubmitting(false);
        return;
      }

      // Preparar datos para enviar
      const datosEnviar = {
        ...form,
        precio: parseFloat(form.precio),
      };

      // Crear el servicio/producto
      const response = await axios.post(
        "http://localhost:3000/api/servicios-productos",
        datosEnviar
      );

      if (response.status === 201) {
        alert("Servicio/Producto agregado exitosamente!");
        onSubmit(response.data);
        setForm({
          nombre: "",
          descripcion: "",
          precio: "",
          tipo: "servicio",
        });
        onCancel();
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response) {
        if (error.response.status === 409) {
          setServerError("Ya existe un servicio/producto con este nombre");
        } else {
          setServerError(
            "Error al agregar el registro. Por favor intente nuevamente."
          );
        }
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
              Añadir Servicio/Producto
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

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 mb-4 sm:grid-cols-2"
          >
            {serverError && (
              <div className="sm:col-span-2 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {serverError}
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Ej: Mantenimiento preventivo"
                required
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm">{errors.nombre}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Descripción *
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows="3"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Descripción detallada del servicio o producto"
                required
              />
              {errors.descripcion && (
                <p className="text-red-500 text-sm">{errors.descripcion}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Precio *
              </label>
              <input
                type="number"
                name="precio"
                value={form.precio}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="0.00"
                required
              />
              {errors.precio && (
                <p className="text-red-500 text-sm">{errors.precio}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Tipo *
              </label>
              <select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="servicio">Servicio</option>
                <option value="producto">Producto</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                }`}
              >
                {isSubmitting ? "Guardando..." : "Guardar Servicio/Producto"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
