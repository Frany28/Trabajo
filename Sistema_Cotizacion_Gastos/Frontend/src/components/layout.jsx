// src/components/Layout.jsx
import React from "react";
import Navbar from "./general/Navbar";

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="p-4">{children}</main>
    </>
  );
};

export default Layout;
