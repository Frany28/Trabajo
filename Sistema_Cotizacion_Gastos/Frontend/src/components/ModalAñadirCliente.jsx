import { useState } from "react";
import axios from "axios";

const regexNombre = /^[a-zA-Z\s]+$/;
const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const regexTelefono = /^[0-9]{10}$/;

export default function ModalAñadirCliente({ onCancel, onSubmit }) {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Limpiar errores cuando el usuario escribe
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
    if (serverError) setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (!regexNombre.test(form.nombre)) {
      newErrors.nombre = "El nombre solo puede contener letras y espacios.";
    }

    if (!form.email.trim()) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!regexEmail.test(form.email)) {
      newErrors.email = "El correo electrónico no es válido.";
    }

    if (!form.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    } else if (!regexTelefono.test(form.telefono)) {
      newErrors.telefono = "El teléfono debe tener 10 dígitos.";
    }

    if (!form.direccion.trim()) {
      newErrors.direccion = "La dirección es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkExistingClient = async () => {
    try {
      // Verificar que al menos un campo tenga valor
      if (!form.nombre.trim() && !form.email.trim()) {
        return false;
      }

      const response = await axios.get(
        "http://localhost:3000/api/clientes/check",
        {
          params: {
            nombre: form.nombre.trim(),
            email: form.email.trim(),
          },
          // Para capturar mejor los errores
          validateStatus: (status) => status < 500,
        }
      );

      // Verificar estructura de respuesta
      if (!response.data || typeof response.data.exists === "undefined") {
        console.error("Respuesta inesperada:", response.data);
        return false;
      }

      return response.data.exists;
    } catch (error) {
      console.error("Error en checkExistingClient:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return false; // Permitir continuar en caso de error
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Verificar si el cliente ya existe
      const exists = await checkExistingClient();
      if (exists) {
        setServerError("Ya existe un cliente con este nombre o email");
        setIsSubmitting(false);
        return;
      }

      // Si no existe, proceder a crear
      const response = await axios.post(
        "http://localhost:3000/api/clientes",
        form
      );

      if (response.status === 201) {
        alert("Cliente agregado exitosamente!");
        onSubmit(response.data);
        setForm({ nombre: "", email: "", telefono: "", direccion: "" });
        onCancel();
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response) {
        if (error.response.status === 409) {
          setServerError("Ya existe un cliente con este nombre o email");
        } else {
          setServerError(
            "Error al agregar el cliente. Por favor intente nuevamente."
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
              Añadir Cliente
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
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Juan Pérez"
                required
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm">{errors.nombre}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="correo@dominio.com"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Teléfono
              </label>
              <input
                type="text"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="0412123456"
                required
              />
              {errors.telefono && (
                <p className="text-red-500 text-sm">{errors.telefono}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Av. Siempre Viva 742"
                required
              />
              {errors.direccion && (
                <p className="text-red-500 text-sm">{errors.direccion}</p>
              )}
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
                {isSubmitting ? "Guardando..." : "Guardar Cliente"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
