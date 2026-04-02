import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import GymVendorLogin from "./components/Login.jsx";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<GymVendorLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
