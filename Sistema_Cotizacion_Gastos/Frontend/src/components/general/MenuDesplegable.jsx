import { useState, useRef, useEffect } from "react";

export default function MenuDesplegable({ onEditar, onEliminar, onVer }) {
  const [abierto, setAbierto] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const manejarClickFuera = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", manejarClickFuera);
    return () => document.removeEventListener("mousedown", manejarClickFuera);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        className="inline-flex items-center text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 dark:hover-bg-gray-800 text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
        type="button"
        onClick={() => setAbierto(!abierto)}
      >
        <svg
          className="w-5 h-5"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      </button>

      {abierto && (
        <div className="z-10 absolute right-0 mt-2 w-40 bg-white rounded shadow dark:bg-gray-700">
          <button
            onClick={onVer}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white"
          >
            Ver
          </button>
          <button
            onClick={onEditar}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white"
          >
            Editar
          </button>
          <button
            onClick={onEliminar}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-600 dark:text-red-400"
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}
