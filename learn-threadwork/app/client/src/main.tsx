// Given: the entry point of the React app.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@app/client/src/App";
import "@app/client/src/styles.css";

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
