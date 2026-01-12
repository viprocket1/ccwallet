// src/main.jsx (or src/index.js)
import { Buffer } from 'buffer';
import process from 'process';

// Polyfill immediately before any other imports
window.global = window;
window.process = process;
window.Buffer = Buffer;

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
