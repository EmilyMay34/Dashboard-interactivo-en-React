import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';

const STORAGE_KEYS = {
  nombreCompleto: 'perfil_nombre_completo',
  puestoUsuario: 'perfil_puesto_usuario',
  areaTrabajo: 'perfil_area_trabajo',
  idUsuario: 'perfil_id_usuario',
  entornoTrabajo: 'perfil_entorno_trabajo',
  notasLista: 'perfil_notas_lista',
  ultimoAcceso: 'perfil_ultimo_acceso',
  historial: 'dashboard_historial_actividad',
  ultimaSeccion: 'dashboard_ultima_sesion'
};

const TEXTOS = {
  titulo: 'Perfil de Usuario',
  nombreLabel: 'Nombre completo',
  nombreDefault: 'Juliana Silva',
  cuentaActiva: 'Cuenta Activa',
  puestoLabel: 'Puesto',
  puestoDefault: 'Analista de Datos de Entretenimiento',
  areaLabel: 'Área de trabajo',
  areaDefault: 'Exploración de Catálogo y Tendencias',
  idLabel: 'ID de usuario',
  idDefault: 'USR-NFLX-2026',
  entornoLabel: 'Entorno',
  entornoDefault: 'Análisis Global (CSV)',
  sesionActivaLabel: 'Sesión activa',
  sesionActivaEstado: 'Conectada',
  expandirSesion: 'Extender',
  contraerSesion: 'Contraer',
  detalleEstado: 'Estado',
  detalleEnLinea: 'En línea en el tablero',
  detalleOrigen: 'Fuente',
  detalleFuenteCsv: 'netflix_titles.csv',
  ultimoAccesoLabel: 'Último acceso',
  metricasTitulo: 'Métricas personales de uso en sesión',
  metricasDesc: 'Actividad acumulada y estado del catálogo en tu sesión actual.',
  movimientosLabel: 'Acciones registradas',
  recargasLabel: 'Recargas de CSV',
  titulosLabel: 'Títulos en catálogo',
  seccionActualLabel: 'Última sección',
  notasTitulo: 'Notas rápidas',
  notasPlaceholder: 'Escribe una nota rápida y presiona Guardar nota...',
  guardarNota: 'Guardar nota',
  notaGuardadaOk: 'Nota guardada correctamente.',
  notasGuardadasTitulo: 'Notas guardadas',
  sinNotasGuardadas: 'Aún no hay notas guardadas.',
  eliminarNota: 'Quitar',
  limpiarNota: 'Limpiar campo'
};

function leerStorage(key, fallback = '') {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const val = window.localStorage.getItem(key);
    return val === null ? fallback : val;
  } catch {
    return fallback;
  }
}

function guardarStorage(key, value) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, String(value));
  } catch {
    // Ignorar errores de cuota o privacidad
  }
}

function notificarNombrePerfil(nombre) {
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(
        new CustomEvent('perfil-nombre-change', { detail: { nombreCompleto: nombre } })
      );
    }
  } catch {
    // Ignorar errores
  }
}

export default function Perfil({ datosCsv, ultimaSeccion = 'Inicio' }) {
  const [nombreCompleto, setNombreCompleto] = useState(() =>
    leerStorage(STORAGE_KEYS.nombreCompleto, TEXTOS.nombreDefault)
  );
  const [puestoUsuario, setPuestoUsuario] = useState(() =>
    leerStorage(STORAGE_KEYS.puestoUsuario, TEXTOS.puestoDefault)
  );
  const [areaTrabajo, setAreaTrabajo] = useState(() =>
    leerStorage(STORAGE_KEYS.areaTrabajo, TEXTOS.areaDefault)
  );
  const [idUsuario, setIdUsuario] = useState(() =>
    leerStorage(STORAGE_KEYS.idUsuario, TEXTOS.idDefault)
  );
  const [entornoTrabajo, setEntornoTrabajo] = useState(() =>
    leerStorage(STORAGE_KEYS.entornoTrabajo, TEXTOS.entornoDefault)
  );

  const [sesionExtendida, setSesionExtendida] = useState(false);

  const [ultimoAcceso] = useState(() => {
    const guardado = leerStorage(STORAGE_KEYS.ultimoAcceso, '');
    if (guardado) return guardado;
    let ahora = '';
    try {
      ahora = new Date().toLocaleString('es-MX');
    } catch {
      ahora = new Date().toISOString();
    }
    guardarStorage(STORAGE_KEYS.ultimoAcceso, ahora);
    return ahora;
  });

  const [borradorNota, setBorradorNota] = useState('');
  const [notasGuardadas, setNotasGuardadas] = useState(() => {
    try {
      const parsed = JSON.parse(leerStorage(STORAGE_KEYS.notasLista, '[]'));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [estadoGuardadoNota, setEstadoGuardadoNota] = useState('');

  const [historial, setHistorial] = useState(() => {
    try {
      const parsed = JSON.parse(leerStorage(STORAGE_KEYS.historial, '[]'));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [rowsInternas, setRowsInternas] = useState([]);

  useEffect(() => {
    notificarNombrePerfil(nombreCompleto);
  }, [nombreCompleto]);

  useEffect(() => {
    const actualizarHistorial = () => {
      try {
        const parsed = JSON.parse(leerStorage(STORAGE_KEYS.historial, '[]'));
        setHistorial(Array.isArray(parsed) ? parsed : []);
      } catch {
        setHistorial([]);
      }
    };

    window.addEventListener('dashboard-settings-change', actualizarHistorial);
    window.addEventListener('storage', actualizarHistorial);
    return () => {
      window.removeEventListener('dashboard-settings-change', actualizarHistorial);
      window.removeEventListener('storage', actualizarHistorial);
    };
  }, []);

  useEffect(() => {
    if (Array.isArray(datosCsv)) return;
    let cancelado = false;
    fetch('/netflix_titles.csv')
      .then((res) => (res && res.ok ? res.text() : ''))
      .then((csvText) => {
        if (cancelado || !csvText || !Papa || typeof Papa.parse !== 'function') return;
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (!cancelado) {
              setRowsInternas(Array.isArray(results?.data) ? results.data : []);
            }
          }
        });
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [datosCsv]);

  const registrarEnHistorial = useCallback((accionEs) => {
    let hora = '';
    try {
      hora = new Date().toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      hora = new Date().toISOString().slice(11, 19);
    }

    const nuevo = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      es: accionEs,
      en: accionEs,
      hora
    };

    setHistorial((prev) => {
      const base = Array.isArray(prev) ? prev : [];
      const next = [nuevo, ...base].slice(0, 50);
      guardarStorage(STORAGE_KEYS.historial, JSON.stringify(next));
      return next;
    });
  }, []);

  const totalFilasCsv = useMemo(() => {
    const arr = Array.isArray(datosCsv) ? datosCsv : rowsInternas;
    return Array.isArray(arr) ? arr.length : 0;
  }, [datosCsv, rowsInternas]);

  const recargasCsvCount = useMemo(() => {
    if (!Array.isArray(historial)) return 0;
    return historial.filter((item) => {
      const texto = `${item?.es || ''} ${item?.en || ''}`.toLowerCase();
      return texto.includes('csv') || texto.includes('catálogo') || texto.includes('catalog');
    }).length;
  }, [historial]);

  const seccionRegistrada = useMemo(() => {
    if (ultimaSeccion) return ultimaSeccion;
    try {
      const saved = JSON.parse(leerStorage(STORAGE_KEYS.ultimaSeccion, 'null'));
      return saved?.seccion || 'Inicio';
    } catch {
      return 'Inicio';
    }
  }, [ultimaSeccion]);

  const cargoVisible = (puestoUsuario || '').trim() || TEXTOS.puestoDefault;

  const handleNombreChange = (e) => {
    const valor = e.target.value;
    setNombreCompleto(valor);
    guardarStorage(STORAGE_KEYS.nombreCompleto, valor);
    notificarNombrePerfil(valor);
  };

  const handleGuardarNota = () => {
    const texto = borradorNota.trim();
    if (!texto) return;
    let hora = '';
    try {
      hora = new Date().toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      hora = new Date().toISOString().slice(11, 16);
    }

    const nuevaNota = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      texto,
      cargo: cargoVisible,
      hora
    };

    setNotasGuardadas((prev) => {
      const base = Array.isArray(prev) ? prev : [];
      const actualizada = [nuevaNota, ...base];
      guardarStorage(STORAGE_KEYS.notasLista, JSON.stringify(actualizada));
      return actualizada;
    });

    setBorradorNota('');
    setEstadoGuardadoNota(TEXTOS.notaGuardadaOk);
    registrarEnHistorial('Guardó una nota rápida');
  };

  const handleEliminarNota = (idNota) => {
    setNotasGuardadas((prev) => {
      const base = Array.isArray(prev) ? prev : [];
      const filtradas = base.filter((item) => item.id !== idNota);
      guardarStorage(STORAGE_KEYS.notasLista, JSON.stringify(filtradas));
      return filtradas;
    });
  };

  const handleLimpiarBorrador = () => {
    setBorradorNota('');
    setEstadoGuardadoNota('');
  };

  return (
    <section className="p-6 md:p-8 bg-[#181722] min-h-screen text-white space-y-6 transition-all">
      {/* Encabezado */}
      <header className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-7 bg-[#e50914] rounded" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-wide text-white">
            {TEXTOS.titulo}
          </h1>
        </div>
      </header>

      {/* Identidad del usuario, puesto editable, ID editable, entorno, área, sesión extensible y último acceso */}
      <div className="bg-[#23222e] border border-slate-800 rounded-2xl p-6 max-w-6xl shadow-xl space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#181722] border-2 border-emerald-500 flex items-center justify-center text-2xl shrink-0">
            👤
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-white">{nombreCompleto}</h2>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-600 text-white">
                {TEXTOS.cuentaActiva}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-300 mt-1">
              {TEXTOS.puestoLabel}: {cargoVisible}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{areaTrabajo}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="bg-[#181722] p-3 rounded-xl border border-slate-800 space-y-1">
            <label className="text-slate-400 block">{TEXTOS.nombreLabel}</label>
            <input
              type="text"
              value={nombreCompleto}
              onChange={handleNombreChange}
              className="w-full bg-[#23222e] text-white font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-[#e50914]"
            />
          </div>

          <div className="bg-[#181722] p-3 rounded-xl border border-slate-800 space-y-1">
            <label className="text-slate-400 block">{TEXTOS.puestoLabel}</label>
            <input
              type="text"
              value={puestoUsuario}
              onChange={(e) => {
                setPuestoUsuario(e.target.value);
                guardarStorage(STORAGE_KEYS.puestoUsuario, e.target.value);
              }}
              className="w-full bg-[#23222e] text-white font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-[#e50914]"
            />
          </div>

          <div className="bg-[#181722] p-3 rounded-xl border border-slate-800 space-y-1">
            <label className="text-slate-400 block">{TEXTOS.idLabel}</label>
            <input
              type="text"
              value={idUsuario}
              onChange={(e) => {
                setIdUsuario(e.target.value);
                guardarStorage(STORAGE_KEYS.idUsuario, e.target.value);
              }}
              className="w-full bg-[#23222e] text-white font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-[#e50914]"
            />
          </div>

          <div className="bg-[#181722] p-3 rounded-xl border border-slate-800 space-y-1">
            <label className="text-slate-400 block">{TEXTOS.entornoLabel}</label>
            <input
              type="text"
              value={entornoTrabajo}
              onChange={(e) => {
                setEntornoTrabajo(e.target.value);
                guardarStorage(STORAGE_KEYS.entornoTrabajo, e.target.value);
              }}
              className="w-full bg-[#23222e] text-white font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-[#e50914]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-[#181722] p-3 rounded-xl border border-slate-800 space-y-1">
            <label className="text-slate-400 block">{TEXTOS.areaLabel}</label>
            <input
              type="text"
              value={areaTrabajo}
              onChange={(e) => {
                setAreaTrabajo(e.target.value);
                guardarStorage(STORAGE_KEYS.areaTrabajo, e.target.value);
              }}
              className="w-full bg-[#23222e] text-white font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-[#e50914]"
            />
          </div>

          <div className="bg-[#181722] p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-slate-400 block">{TEXTOS.sesionActivaLabel}</span>
                <span className="font-semibold text-white">{TEXTOS.sesionActivaEstado}</span>
              </div>
              <button
                type="button"
                onClick={() => setSesionExtendida((prev) => !prev)}
                className="px-2.5 py-1 rounded-lg bg-[#e50914] hover:bg-red-700 text-white font-bold text-[11px] transition cursor-pointer shrink-0"
              >
                {sesionExtendida ? TEXTOS.contraerSesion : TEXTOS.expandirSesion}
              </button>
            </div>

            {sesionExtendida && (
              <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px] text-slate-300">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">{TEXTOS.detalleEstado}:</span>
                  <span className="font-semibold text-white">{TEXTOS.detalleEnLinea}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">{TEXTOS.detalleOrigen}:</span>
                  <span className="font-semibold text-white">{TEXTOS.detalleFuenteCsv}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#181722] px-4 py-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">{TEXTOS.ultimoAccesoLabel}</span>
            <span className="font-semibold text-white">{ultimoAcceso}</span>
          </div>
        </div>
      </div>

      {/* Métricas personales de uso en sesión */}
      <div className="bg-[#23222e] border border-slate-800 rounded-2xl p-6 max-w-6xl shadow-xl space-y-4">
        <div>
          <h2 className="text-base font-bold text-white">{TEXTOS.metricasTitulo}</h2>
          <p className="text-xs text-slate-400">{TEXTOS.metricasDesc}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#181722] p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block">{TEXTOS.movimientosLabel}</span>
            <span className="text-lg font-bold text-white mt-0.5 block">
              {historial.length}
            </span>
          </div>

          <div className="bg-[#181722] p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block">{TEXTOS.recargasLabel}</span>
            <span className="text-lg font-bold text-white mt-0.5 block">
              {recargasCsvCount}
            </span>
          </div>

          <div className="bg-[#181722] p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block">{TEXTOS.titulosLabel}</span>
            <span className="text-lg font-bold text-white mt-0.5 block">
              {totalFilasCsv.toLocaleString()}
            </span>
          </div>

          <div className="bg-[#181722] p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block">{TEXTOS.seccionActualLabel}</span>
            <span className="text-sm font-bold text-white mt-1.5 block truncate">
              {seccionRegistrada}
            </span>
          </div>
        </div>
      </div>

      {/* Notas rápidas + listado de notas guardadas */}
      <div className="bg-[#23222e] border border-slate-800 rounded-2xl p-6 max-w-6xl shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white">{TEXTOS.notasTitulo}</h2>
            <p className="text-xs text-slate-400">{cargoVisible}</p>
          </div>
          {estadoGuardadoNota && (
            <span className="text-xs font-semibold text-emerald-400">
              {estadoGuardadoNota}
            </span>
          )}
        </div>

        <textarea
          rows={3}
          value={borradorNota}
          onChange={(e) => {
            setBorradorNota(e.target.value);
            if (estadoGuardadoNota) setEstadoGuardadoNota('');
          }}
          placeholder={TEXTOS.notasPlaceholder}
          className="w-full bg-[#181722] text-white text-xs p-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-[#e50914] resize-none"
        />

        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={handleLimpiarBorrador}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#181722] hover:bg-slate-900 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            {TEXTOS.limpiarNota}
          </button>
          <button
            type="button"
            onClick={handleGuardarNota}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#e50914] hover:bg-red-700 text-white transition cursor-pointer"
          >
            {TEXTOS.guardarNota}
          </button>
        </div>

        <div className="pt-2 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {TEXTOS.notasGuardadasTitulo} ({notasGuardadas.length})
          </h3>
          {notasGuardadas.length === 0 ? (
            <p className="text-xs text-slate-400 bg-[#181722] px-4 py-3 rounded-xl border border-slate-800">
              {TEXTOS.sinNotasGuardadas}
            </p>
          ) : (
            <ul className="space-y-2">
              {notasGuardadas.map((nota) => (
                <li
                  key={nota.id}
                  className="bg-[#181722] px-4 py-3 rounded-xl border border-slate-800 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <p className="text-white font-medium">{nota.texto}</p>
                    <p className="text-[11px] text-slate-400">
                      {nota.cargo} • {nota.hora}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEliminarNota(nota.id)}
                    className="text-[11px] font-semibold text-slate-400 hover:text-white cursor-pointer shrink-0"
                  >
                    {TEXTOS.eliminarNota}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}