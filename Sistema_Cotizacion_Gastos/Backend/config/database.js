// Backend/database.js
import mysql from "mysql2/promise"; // Usa promise para await

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "sistema_cotizacion_gastos",
});

export default db;
