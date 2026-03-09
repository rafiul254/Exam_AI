import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <AuthProvider>
            <App />
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: "#12121a",
                        color: "#e8e8f0",
                        border: "1px solid #1e1e2e",
                    },
                }}
            />
        </AuthProvider>
    </BrowserRouter>
);
