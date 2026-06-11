import { createRoot } from "react-dom/client";
import App from "./App";
// @ts-ignore: CSS import handled by bundler
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
