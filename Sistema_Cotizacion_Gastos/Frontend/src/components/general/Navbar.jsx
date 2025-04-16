import { useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: "/Dashboard", label: "Principal" },
    { path: "/administracion", label: "Administración" },
    { path: "/operaciones", label: "Operaciones" },
    { path: "/crearRegistro", label: "Crear Registro" },
    { path: "/reportes", label: "Reportes" },
  ];

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900 sticky top-0 left-0 w-full h-16 z-50  ">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <button
          data-collapse-toggle="navbar-default"
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          aria-controls="navbar-default"
          aria-expanded="false"
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>
        <div className="hidden w-full md:block md:w-auto" id="navbar-default">
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <a
                    href={item.path}
                    className={`block py-2 px-3 rounded-sm md:p-0 ${
                      isActive
                        ? "text-blue-700 font-bold border-b-2 border-blue-700"
                        : "text-white hover:text-blue-700"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
