import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';

const STORAGE_KEYS = {
  mostrarHistorial: 'dashboard_mostrar_historial',
  enfoqueActivo: 'dashboard_enfoque_activo',
  alertasRuta: 'dashboard_alertas_ruta',
  historial: 'dashboard_historial_actividad',
  ultimaCarga: 'dashboard_ultima_carga_csv',
  ultimaSesion: 'dashboard_ultima_sesion'
};

const TEXTOS = {
  titulo: 'Ajustes del Tablero',
  subtitulo:
    'Preferencias de vista, historial de actividad, actualización de datos y diagnóstico del sistema.',
  vistaTitulo: 'Vista y Enfoque',
  vistaDesc: 'Controla cómo se presenta la información y la visibilidad del registro.',
  mostrarHistorial: 'Mostrar historial en pantalla',
  mostrarHistorialDesc: 'Muestra u oculta el listado de movimientos recientes.',
  enfoqueResaltado: 'Resaltar tarjetas activas',
  enfoqueResaltadoDesc: 'Marca con mayor claridad los paneles del tablero.',
  alertasTitulo: 'Alertas y notificaciones en ruta',
  alertasDesc:
    'Activa o silencia los avisos emergentes al cambiar ajustes, recargar datos o limpiar el historial.',
  alertasActivas: 'Alertas en ruta activadas',
  alertasSilenciadas: 'Alertas en ruta silenciadas',
  historialTitulo: 'Historial de actividad',
  historialDesc: 'Administra el registro de movimientos de la sesión.',
  historialOculto:
    'El historial está oculto. Activa "Mostrar historial en pantalla" para verlo.',
  limpiarHistorial: 'Borrar historial',
  historialVacio: 'Aún no hay movimientos registrados en esta sesión.',
  historialLimpiado: 'El historial de actividad se ha limpiado.',
  datosTitulo: 'Datos y actualización (netflix_titles.csv)',
  datosDesc: 'Recarga el archivo CSV y revisa cuándo se actualizó por última vez.',
  recargarCsv: 'Recargar catálogo CSV',
  recargando: 'Recargando...',
  csvRecargado: 'Catálogo netflix_titles.csv actualizado correctamente.',
  ultimaCargaLabel: 'Última carga registrada',
  sinCargaPrevia: 'Carga inicial de sesión',
  diagnosticoTitulo: 'Tablero de diagnóstico y salud del sistema',
  diagnosticoDesc:
    'Testigos en tiempo real del estado del CSV, integridad de filas y memoria del navegador.',
  estadoCsv: 'Estado del CSV',
  csvOk: 'Sin errores detectados',
  csvAlerta: 'Error o sin datos',
  cargando: 'Cargando...',
  integridadCsv: 'Verificación de integridad del CSV',
  filasCompletas: 'Filas completas',
  camposVacios: 'Campos vacíos detectados',
  memoriaNavegador: 'Memoria del navegador (localStorage)',
  memoriaOk: 'Disponible y sincronizada',
  memoriaNoDisp: 'No disponible',
  sesionTitulo: 'Resumen de última sesión',
  sesionDesc: 'Último estado registrado antes o durante tu visita a Ajustes.',
  ultimaSeccion: 'Última sección visitada',
  ultimoFiltro: 'Último filtro activo',
  sinFiltro: 'Sin filtro específico',
  noDisponible: 'No registrado'
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
    // Ignorar errores
  }
}

function borrarStorage(key) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.removeItem(key);
  } catch {
    // Ignorar errores
  }
}

function emitirEstadoGlobal(detalle) {
  try {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.toggle(
        'high-focus',
        Boolean(detalle.enfoqueActivo)
      );
    }
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('dashboard-settings-change', { detail }));
    }
  } catch {
    // Ignorar errores
  }
}

export default function Ajustes({
  onReloadCsv,
  datosCsv,
  errorCsv = false,
  ultimaSeccion = 'Inicio',
  ultimoFiltro = ''
}) {
  const [mostrarHistorial, setMostrarHistorial] = useState(
    () => leerStorage(STORAGE_KEYS.mostrarHistorial, 'true') !== 'false'
  );

  const [enfoqueActivo, setEnfoqueActivo] = useState(
    () => leerStorage(STORAGE_KEYS.enfoqueActivo, 'false') === 'true'
  );

  const [alertasRuta, setAlertasRuta] = useState(
    () => leerStorage(STORAGE_KEYS.alertasRuta, 'true') !== 'false'
  );

  const [historial, setHistorial] = useState(() => {
    try {
      const parsed = JSON.parse(leerStorage(STORAGE_KEYS.historial, '[]'));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [ultimaCarga, setUltimaCarga] = useState(() =>
    leerStorage(STORAGE_KEYS.ultimaCarga, '')
  );

  const [rowsInternas, setRowsInternas] = useState([]);
  const [cargandoCsv, setCargandoCsv] = useState(!Array.isArray(datosCsv));
  const [errorInternoCsv, setErrorInternoCsv] = useState(false);
  const [recargandoCsv, setRecargandoCsv] = useState(false);
  const [bannerRuta, setBannerRuta] = useState('');

  const t = TEXTOS;

  const mostrarAlerta = useCallback(
    (mensaje) => {
      if (!alertasRuta || !mensaje) return;
      setBannerRuta(mensaje);
    },
    [alertasRuta]
  );

  useEffect(() => {
    if (!bannerRuta) return;
    const timer = setTimeout(() => setBannerRuta(''), 3500);
    return () => clearTimeout(timer);
  }, [bannerRuta]);

  const registrarMovimiento = useCallback((accion) => {
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

    const nuevoItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      accion,
      hora
    };

    setHistorial((prev) => {
      const base = Array.isArray(prev) ? prev : [];
      const actualizado = [nuevoItem, ...base].slice(0, 50);
      guardarStorage(STORAGE_KEYS.historial, JSON.stringify(actualizado));
      return actualizado;
    });
  }, []);

  const cargarCsvConPapa = useCallback(async () => {
    setCargandoCsv(true);
    setErrorInternoCsv(false);
    try {
      const res = await fetch('/netflix_titles.csv');
      if (!res || !res.ok) throw new Error('HTTP error');
      const csvText = await res.text();
      if (!csvText || typeof csvText !== 'string') {
        setRowsInternas([]);
        return;
      }

      if (Papa && typeof Papa.parse === 'function') {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setRowsInternas(Array.isArray(results?.data) ? results.data : []);
            setCargandoCsv(false);
          },
          error: () => {
            setErrorInternoCsv(true);
            setCargandoCsv(false);
          }
        });
      } else {
        setRowsInternas([]);
        setCargandoCsv(false);
      }
    } catch {
      setErrorInternoCsv(true);
      setCargandoCsv(false);
    }
  }, []);

  useEffect(() => {
    if (!Array.isArray(datosCsv)) {
      cargarCsvConPapa();
    } else {
      setCargandoCsv(false);
    }
  }, [datosCsv, cargarCsvConPapa]);

  useEffect(() => {
    guardarStorage(STORAGE_KEYS.mostrarHistorial, mostrarHistorial);
    guardarStorage(STORAGE_KEYS.enfoqueActivo, enfoqueActivo);
    emitirEstadoGlobal({ enfoqueActivo });
  }, [mostrarHistorial, enfoqueActivo]);

  useEffect(() => {
    guardarStorage(
      STORAGE_KEYS.ultimaSesion,
      JSON.stringify({
        seccion: ultimaSeccion || '',
        filtro: ultimoFiltro || ''
      })
    );
  }, [ultimaSeccion, ultimoFiltro]);

  const filasActivas = Array.isArray(datosCsv) ? datosCsv : rowsInternas;
  const hayErrorCsv = Boolean(errorCsv || errorInternoCsv);

  const integridadCsv = useMemo(() => {
    if (!Array.isArray(filasActivas) || filasActivas.length === 0) {
      return { totalFilas: 0, filasCompletas: 0, camposVacios: 0 };
    }

    let completas = 0;
    let vacios = 0;

    for (const fila of filasActivas) {
      if (!fila || typeof fila !== 'object') {
        vacios += 1;
        continue;
      }
      const valores = Object.values(fila);
      let tieneVacio = false;

      for (const val of valores) {
        const limpio = val === null || val === undefined ? '' : String(val).trim();
        if (!limpio || limpio.toLowerCase() === 'n/a') {
          vacios += 1;
          tieneVacio = true;
        }
      }

      if (!tieneVacio && valores.length > 0) {
        completas += 1;
      }
    }

    return {
      totalFilas: filasActivas.length,
      filasCompletas: completas,
      camposVacios: vacios
    };
  }, [filasActivas]);

  const memoriaDisponible = useMemo(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const k = '__diag_storage__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  }, []);

  const resumenSesion = useMemo(() => {
    try {
      const saved = JSON.parse(leerStorage(STORAGE_KEYS.ultimaSesion, 'null'));
      return {
        seccion: ultimaSeccion || saved?.seccion || t.noDisponible,
        filtro: ultimoFiltro || saved?.filtro || t.sinFiltro
      };
    } catch {
      return { seccion: ultimaSeccion || t.noDisponible, filtro: t.sinFiltro };
    }
  }, [ultimaSeccion, ultimoFiltro, t.noDisponible, t.sinFiltro]);

  const handleToggleMostrarHistorial = () => {
    const siguiente = !mostrarHistorial;
    setMostrarHistorial(siguiente);
    registrarMovimiento(
      siguiente ? 'Mostró el historial en pantalla' : 'Ocultó el historial en pantalla'
    );
    mostrarAlerta(
      siguiente ? 'El historial ahora está visible.' : 'El historial ahora está oculto.'
    );
  };

  const handleToggleEnfoque = () => {
    const siguiente = !enfoqueActivo;
    setEnfoqueActivo(siguiente);
    registrarMovimiento(
      siguiente ? 'Activó resaltado de tarjetas' : 'Desactivó resaltado de tarjetas'
    );
    mostrarAlerta(
      siguiente ? 'Resaltado de tarjetas activado.' : 'Resaltado de tarjetas desactivado.'
    );
  };

  const handleToggleAlertas = () => {
    const siguiente = !alertasRuta;
    setAlertasRuta(siguiente);
    guardarStorage(STORAGE_KEYS.alertasRuta, siguiente);
    registrarMovimiento(
      siguiente ? 'Activó alertas en ruta' : 'Silenció alertas en ruta'
    );
    if (siguiente) {
      setBannerRuta(t.alertasActivas);
    } else {
      setBannerRuta('');
    }
  };

  const handleLimpiarHistorial = () => {
    setHistorial([]);
    borrarStorage(STORAGE_KEYS.historial);
    mostrarAlerta(t.historialLimpiado);
  };

  const handleRecargarCsv = async () => {
    setRecargandoCsv(true);
    try {
      if (typeof onReloadCsv === 'function') {
        await onReloadCsv();
      } else {
        await cargarCsvConPapa();
      }
      let marca = '';
      try {
        marca = new Date().toLocaleString('es-MX');
      } catch {
        marca = new Date().toISOString();
      }
      setUltimaCarga(marca);
      guardarStorage(STORAGE_KEYS.ultimaCarga, marca);
      registrarMovimiento('Recargó el catálogo netflix_titles.csv');
      mostrarAlerta(t.csvRecargado);
    } finally {
      setRecargandoCsv(false);
    }
  };

  const cardBorderClass = enfoqueActivo
    ? 'border-2 border-[#e50914]'
    : 'border border-slate-800';

  return (
    <section className="p-6 md:p-8 bg-[#181722] min-h-screen text-white space-y-6 transition-all">
      {/* Alerta en ruta */}
      {alertasRuta && bannerRuta && (
        <div
          role="status"
          className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-[#23222e] border border-[#e50914] text-xs md:text-sm font-semibold text-white shadow-lg"
        >
          <div className="flex items-center gap-2.5">
            <span>🔔</span>
            <span>{bannerRuta}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerRuta('')}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Encabezado */}
      <header className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-7 bg-[#e50914] rounded" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-wide text-white">
            {t.titulo}
          </h1>
        </div>
        <p className="text-sm text-slate-400 mt-1 pl-4">{t.subtitulo}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
        {/* 1. Vista y enfoque */}
        <div
          className={`bg-[#23222e] ${cardBorderClass} rounded-2xl p-5 space-y-4 shadow-xl`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-lg">📐</span>
            <div>
              <h2 className="text-base font-bold text-white">{t.vistaTitulo}</h2>
              <p className="text-xs text-slate-400">{t.vistaDesc}</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-[#181722] border border-slate-800">
            <div>
              <p className="text-sm font-semibold text-white">{t.mostrarHistorial}</p>
              <p className="text-xs text-slate-400">{t.mostrarHistorialDesc}</p>
            </div>
            <input
              type="checkbox"
              checked={mostrarHistorial}
              onChange={handleToggleMostrarHistorial}
              className="w-5 h-5 accent-[#e50914] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-[#181722] border border-slate-800">
            <div>
              <p className="text-sm font-semibold text-white">{t.enfoqueResaltado}</p>
              <p className="text-xs text-slate-400">{t.enfoqueResaltadoDesc}</p>
            </div>
            <input
              type="checkbox"
              checked={enfoqueActivo}
              onChange={handleToggleEnfoque}
              className="w-5 h-5 accent-[#e50914] cursor-pointer"
            />
          </div>
        </div>

        {/* 2. Alertas en ruta y resumen de última sesión */}
        <div
          className={`bg-[#23222e] ${cardBorderClass} rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🔔</span>
              <div>
                <h2 className="text-base font-bold text-white">{t.alertasTitulo}</h2>
                <p className="text-xs text-slate-400">{t.alertasDesc}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-[#181722] border border-slate-800">
              <div>
                <p className="text-sm font-semibold text-white">
                  {alertasRuta ? t.alertasActivas : t.alertasSilenciadas}
                </p>
                <p className="text-xs text-slate-400">{t.alertasDesc}</p>
              </div>
              <input
                type="checkbox"
                checked={alertasRuta}
                onChange={handleToggleAlertas}
                className="w-5 h-5 accent-[#e50914] cursor-pointer"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181722] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <span>👁️</span>
              <span>{t.sesionTitulo}</span>
            </div>
            <p className="text-xs text-slate-400">{t.sesionDesc}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
              <div className="bg-[#23222e] px-3 py-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">{t.ultimaSeccion}</span>
                <span className="font-semibold text-white">
                  {resumenSesion.seccion}
                </span>
              </div>
              <div className="bg-[#23222e] px-3 py-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">{t.ultimoFiltro}</span>
                <span className="font-semibold text-white">{resumenSesion.filtro}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Datos y actualización del CSV */}
        <div
          className={`bg-[#23222e] ${cardBorderClass} rounded-2xl p-5 space-y-4 shadow-xl`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🔄</span>
            <div>
              <h2 className="text-base font-bold text-white">{t.datosTitulo}</h2>
              <p className="text-xs text-slate-400">{t.datosDesc}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181722] border border-slate-800 flex items-center gap-2.5">
            <span>🕒</span>
            <div>
              <p className="text-xs text-slate-400">{t.ultimaCargaLabel}</p>
              <p className="text-sm font-semibold text-white">
                {ultimaCarga || t.sinCargaPrevia}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRecargarCsv}
            disabled={recargandoCsv}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#e50914] hover:bg-red-700 disabled:opacity-60 text-xs font-bold text-white transition cursor-pointer"
          >
            <span>🔄</span>
            {recargandoCsv ? t.recargando : t.recargarCsv}
          </button>
        </div>

        {/* 4. Diagnóstico del sistema e integridad del CSV */}
        <div
          className={`bg-[#23222e] ${cardBorderClass} rounded-2xl p-5 space-y-4 shadow-xl`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🩺</span>
            <div>
              <h2 className="text-base font-bold text-white">{t.diagnosticoTitulo}</h2>
              <p className="text-xs text-slate-400">{t.diagnosticoDesc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#181722] border border-slate-800 flex items-start gap-2.5">
              <span>{hayErrorCsv ? '⚠️' : '✅'}</span>
              <div>
                <span className="text-slate-400 block">{t.estadoCsv}</span>
                <span className="font-semibold text-white">
                  {cargandoCsv ? t.cargando : hayErrorCsv ? t.csvAlerta : t.csvOk}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#181722] border border-slate-800 flex items-start gap-2.5">
              <span>🛡️</span>
              <div>
                <span className="text-slate-400 block">{t.memoriaNavegador}</span>
                <span className="font-semibold text-white">
                  {memoriaDisponible ? t.memoriaOk : t.memoriaNoDisp}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181722] border border-slate-800 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {t.integridadCsv}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#23222e] px-3 py-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">{t.filasCompletas}</span>
                <span className="font-bold text-white">
                  {cargandoCsv
                    ? t.cargando
                    : `${integridadCsv.filasCompletas} / ${integridadCsv.totalFilas}`}
                </span>
              </div>
              <div className="bg-[#23222e] px-3 py-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">{t.camposVacios}</span>
                <span className="font-bold text-white">
                  {cargandoCsv ? t.cargando : integridadCsv.camposVacios}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Historial de actividad */}
      <div
        className={`bg-[#23222e] ${cardBorderClass} rounded-2xl p-5 space-y-4 max-w-6xl shadow-xl`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🕒</span>
            <div>
              <h2 className="text-base font-bold text-white">{t.historialTitulo}</h2>
              <p className="text-xs text-slate-400">{t.historialDesc}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLimpiarHistorial}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#181722] hover:bg-rose-950/60 text-slate-200 border border-slate-700 transition cursor-pointer self-start sm:self-auto"
          >
            <span>🗑️</span>
            {t.limpiarHistorial}
          </button>
        </div>

        {!mostrarHistorial ? (
          <p className="text-xs text-slate-400 py-4 text-center bg-[#181722] rounded-xl border border-slate-800">
            {t.historialOculto}
          </p>
        ) : historial.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center bg-[#181722] rounded-xl border border-slate-800">
            {t.historialVacio}
          </p>
        ) : (
          <ul className="divide-y divide-slate-800/80 bg-[#181722] rounded-xl border border-slate-800 px-4">
            {historial.map((item) => (
              <li
                key={item.id}
                className="py-2.5 flex items-center justify-between gap-4 text-xs"
              >
                <span className="text-slate-200">{item.accion || item.es}</span>
                <span className="text-slate-500 shrink-0">{item.hora}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}