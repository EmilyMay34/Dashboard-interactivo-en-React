import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardHome from './views/DashboardHome';
import ColeccionesPopulares from './views/ColeccionesPopulares';
import TendenciasActuales from './views/TendenciasActuales';
import MejoresActuaciones from './views/MejoresActuaciones';
import Ajustes from './views/Ajustes';
import Perfil from './views/Perfil';

function leerSesionCerrada() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    return window.localStorage.getItem('dashboard_sesion_activa') === 'false';
  } catch {
    return false;
  }
}

export default function App() {
  const [sesionCerrada, setSesionCerrada] = useState(() => leerSesionCerrada());

  useEffect(() => {
    const alSalir = () => setSesionCerrada(true);
    const alCambiarStorage = () => setSesionCerrada(leerSesionCerrada());

    window.addEventListener('dashboard-logout', alSalir);
    window.addEventListener('storage', alCambiarStorage);
    return () => {
      window.removeEventListener('dashboard-logout', alSalir);
      window.removeEventListener('storage', alCambiarStorage);
    };
  }, []);

  const handleVolverEntrar = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('dashboard_sesion_activa', 'true');
      }
    } catch {
      // Ignorar errores de almacenamiento
    }
    setSesionCerrada(false);
  };

  if (sesionCerrada) {
    return (
      <div className="min-h-screen w-full bg-[#181722] text-white flex items-center justify-center p-6 font-sans">
        <div className="bg-[#23222e] border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center space-y-5 shadow-xl">
          <div className="w-1.5 h-7 bg-[#e50914] rounded mx-auto" />
          <h1 className="text-2xl font-bold">Saliste del dashboard</h1>
          <p className="text-sm text-slate-400">
            La sesión del tablero se ha cerrado. Puedes volver a entrar cuando lo necesites.
          </p>
          <button
            type="button"
            onClick={handleVolverEntrar}
            className="w-full py-2.5 px-4 rounded-xl bg-[#e50914] hover:bg-red-700 text-xs font-bold text-white transition cursor-pointer"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-[#1e1b1e] overflow-hidden font-sans">
        <Sidebar onLogout={() => setSesionCerrada(true)} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/colecciones" element={<ColeccionesPopulares />} />
            <Route path="/tendencias" element={<TendenciasActuales />} />
            <Route path="/actuaciones" element={<MejoresActuaciones />} />
            <Route path="/ajustes" element={<Ajustes />} />
            <Route path="/perfil" element={<Perfil />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}