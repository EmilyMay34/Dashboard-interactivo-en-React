import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NOMBRE_DEFAULT = 'Juliana Silva';

function leerNombrePerfil() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return NOMBRE_DEFAULT;
    const guardado = window.localStorage.getItem('perfil_nombre_completo');
    return guardado !== null && guardado !== '' ? guardado : NOMBRE_DEFAULT;
  } catch {
    return NOMBRE_DEFAULT;
  }
}

export default function Sidebar({ onLogout }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const [nombreUsuario, setNombreUsuario] = useState(() => leerNombrePerfil());

  useEffect(() => {
    const actualizarNombre = (evento) => {
      const desdeEvento = evento?.detail?.nombreCompleto;
      if (typeof desdeEvento === 'string') {
        setNombreUsuario(desdeEvento || 'Usuario');
        return;
      }
      setNombreUsuario(leerNombrePerfil() || 'Usuario');
    };

    window.addEventListener('perfil-nombre-change', actualizarNombre);
    window.addEventListener('storage', actualizarNombre);
    return () => {
      window.removeEventListener('perfil-nombre-change', actualizarNombre);
      window.removeEventListener('storage', actualizarNombre);
    };
  }, []);

  const handleLogout = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('dashboard_sesion_activa', 'false');
      }
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('dashboard-logout'));
      }
    } catch {
      // Ignorar errores de almacenamiento
    }

    if (typeof onLogout === 'function') {
      onLogout();
    }
  };

  const getNavItemClass = (path) =>
    `flex items-center gap-4 px-4 py-3 rounded-full transition ${
      isActive(path)
        ? 'bg-[#d92638] text-white font-medium shadow-lg shadow-red-600/20'
        : 'text-slate-300 hover:text-red-400 hover:bg-red-500/10'
    }`;

  return (
    <aside className="w-72 bg-[#121118] text-white flex flex-col justify-between h-screen p-6 border-r border-slate-800/50 select-none shrink-0">
      <div>
        {/* Perfil de Usuario (clic para ir a Perfil) */}
        <Link
          to="/perfil"
          className={`flex items-center gap-3 mb-10 pb-6 border-b border-slate-800 p-2 rounded-xl transition ${
            isActive('/perfil')
              ? 'bg-[#d92638] text-white font-medium shadow-lg shadow-red-600/20'
              : 'hover:bg-red-500/10 hover:text-red-400'
          }`}
        >
          <div className="w-10 h-10 rounded-full border border-slate-400 flex items-center justify-center text-white bg-slate-800">
            👤
          </div>
          <div>
            <span className="font-semibold text-sm block">{nombreUsuario}</span>
            <span
              className={`text-xs ${
                isActive('/perfil') ? 'text-white/90' : 'text-slate-400'
              }`}
            >
              Ver perfil
            </span>
          </div>
        </Link>

        {/* Menú de Navegación */}
        <nav className="space-y-3">
          <Link to="/" className={getNavItemClass('/')}>
            🏠 Inicio
          </Link>
          <Link to="/colecciones" className={getNavItemClass('/colecciones')}>
            🖥️ Colecciones populares
          </Link>
          <Link to="/tendencias" className={`${getNavItemClass('/tendencias')} relative`}>
            🌐 Tendencias actuales
          </Link>
          <Link to="/actuaciones" className={getNavItemClass('/actuaciones')}>
            🏆 Mejores actuaciones
          </Link>
          <Link to="/ajustes" className={getNavItemClass('/ajustes')}>
            ⚙️ Ajustes
          </Link>
        </nav>
      </div>

      {/* Botón Salir */}
      <div className="pt-6 border-t border-slate-800">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
        >
          🚪 <span className="underline text-sm">Salir</span>
        </button>
      </div>
    </aside>
  );
}