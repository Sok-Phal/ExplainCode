import { initApp } from "./src/app.js";

// Keep this file as the browser entry point; application features live in src/.
document.addEventListener("DOMContentLoaded", initApp, { once: true });
