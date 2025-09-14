import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import configureStore from "./redux/reducers/configureStore.js";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

const store = configureStore();
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>
);
