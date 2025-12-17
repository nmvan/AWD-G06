// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";

// Hàm khởi tạo Mocking
async function enableMocking() {
  // Chỉ chạy ở môi trường development
  const { worker } = await import("./mocks/browser");
  
  // Khởi động worker
  // onUnhandledRequest: "bypass" -> Để các request Auth (Login/Register) đi qua backend thật
  return worker.start({
    onUnhandledRequest: "bypass", 
  });
}

const queryClient = new QueryClient();

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
});