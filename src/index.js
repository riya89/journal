import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

const saved = localStorage.getItem("theme") || "light"; // default to light
if (saved === "dark") {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  // </React.StrictMode>
);
