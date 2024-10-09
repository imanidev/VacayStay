import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import "./index.css";
import configureStore from "./store";
import { restoreCSRF, csrfFetch } from "./store/csrf";

const store = configureStore();

if (import.meta.env.MODE !== "production") {
  // In development mode, restore CSRF token and attach csrfFetch and store to window
  restoreCSRF();
  window.csrfFetch = csrfFetch;
}

// Attach the store to the window object in both development and production
window.store = store;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
