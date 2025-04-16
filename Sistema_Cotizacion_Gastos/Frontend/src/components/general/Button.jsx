import propTypes from "prop-types";

function Button({ texto = "Presioname", estilos = "text-white bg-red-600" }) {
  return <button className={`p-2 rounded-md ${estilos}`}>{texto}</button>;
}

Button.propTypes = {
  texto: propTypes.string,
  estilos: propTypes.string,
};

export default Button;
