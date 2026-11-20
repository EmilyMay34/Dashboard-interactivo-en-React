import React, { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';

function formatearPorcentaje(cantidad, total) {
  if (!total || cantidad <= 0) return '0.0%';
  const pct = (cantidad / total) * 100;
  if (pct < 0.1) return '< 0.1%';
  return `${pct.toFixed(1)}%`;
}

function esAudienciaValida(ratingStr) {
  if (!ratingStr) return false;
  const limpia = String(ratingStr).trim();
  if (!limpia) return false;
  // Descartar valores sucios del CSV que corresponden a duraciones ("74 min", "66 min", "1 Season", etc.)
  if (/^\d+\s*(min|season)/i.test(limpia)) return false;
  return true;
}

function TooltipPorcentajeAudiencia({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const dato = payload[0].payload;

  return (
    <div className="bg-[#f8fafc] text-slate-900 px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-300 text-xs">
      <p className="font-extrabold text-slate-900">{dato.audiencia}</p>
      <p className="font-semibold text-slate-700 mt-0.5 tabular-nums">
        {Number(dato.cantidad).toLocaleString()} títulos{' '}
        <span className="font-black text-slate-900">({dato.porcentaje})</span>
      </p>
    </div>
  );
}

export default function TendenciasActuales() {
  const [rawRows, setRawRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limiteAudiencias, setLimiteAudiencias] = useState('top6'); // 'top6' | 'top10' | 'completas'
  const [audienciaMarcada, setAudienciaMarcada] = useState(null);
  const [peliculaSeleccionada, setPeliculaSeleccionada] = useState(null);

  useEffect(() => {
    fetch('/netflix_titles.csv')
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: false,
          skipEmptyLines: true,
          complete: (results) => {
            setRawRows(results.data || []);
            setLoading(false);
          }
        });
      })
      .catch(() => setLoading(false));
  }, []);

  // Orden de clasificación de audiencia según el campo `rating` del CSV
  const pesoAudiencia = {
    'NC-17': 100,
    'TV-MA': 95,
    'R': 90,
    'TV-14': 80,
    'PG-13': 75,
    'TV-PG': 65,
    'PG': 60,
    'TV-Y7-FV': 50,
    'TV-Y7': 45,
    'TV-Y': 40,
    'G': 35,
    'NR': 20,
    'UR': 15
  };

  const coloresBarras = ['#e50914', '#ea580c', '#d97706', '#334155', '#475569', '#64748b'];

  const fotosRespaldo = [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop'
  ];

  const analisisCsv = useMemo(() => {
    const filasValidas = rawRows.filter(
      (row) => row && row.title && String(row.title).trim() !== ''
    );

    const filasConRating = filasValidas.filter((row) => esAudienciaValida(row.rating));

    // Conteo exacto por `rating` válido en el CSV
    const conteoAudiencia = new Map();
    filasConRating.forEach((row) => {
      const aud = String(row.rating).trim();
      conteoAudiencia.set(aud, (conteoAudiencia.get(aud) || 0) + 1);
    });

    const totalConAudiencia = filasConRating.length;

    const audienciaOrdenada = Array.from(conteoAudiencia.entries())
      .filter(([, cantidad]) => cantidad > 0)
      .sort((a, b) => b[1] - a[1]);

    const clasificacionesDistintas = audienciaOrdenada.length;

    const audienciaPredominante = audienciaOrdenada[0]?.[0] || 'N/D';
    const cantidadPredominante = audienciaOrdenada[0]?.[1] || 0;
    const porcentajePredominante = formatearPorcentaje(
      cantidadPredominante,
      totalConAudiencia
    );

    const distribucionAudiencias = audienciaOrdenada.map(([audiencia, cantidad], index) => ({
      audiencia,
      cantidad,
      porcentaje: formatearPorcentaje(cantidad, totalConAudiencia),
      color: coloresBarras[index % coloresBarras.length]
    }));

    // Top 5 por nivel de audiencia según el CSV (o filtrado si se marca una audiencia)
    const baseTabla = audienciaMarcada
      ? filasConRating.filter((row) => String(row.rating).trim() === audienciaMarcada)
      : filasConRating;

    const top5Audiencia = [...baseTabla]
      .sort((a, b) => {
        const audA = String(a.rating).trim();
        const audB = String(b.rating).trim();
        const diffAud = (pesoAudiencia[audB] || 0) - (pesoAudiencia[audA] || 0);
        if (diffAud !== 0) return diffAud;
        return (Number(b.release_year) || 0) - (Number(a.release_year) || 0);
      })
      .slice(0, 5)
      .map((row, idx) => ({
        id: idx + 1,
        title: String(row.title).trim(),
        type: row.type ? String(row.type).trim() : 'Título',
        releaseYear: row.release_year ? String(row.release_year).trim() : 'N/D',
        audiencia: String(row.rating).trim(),
        duration: row.duration ? String(row.duration).trim() : 'N/D',
        desc: row.description
          ? String(row.description).trim()
          : 'Sin descripción disponible en el CSV.',
        poster: fotosRespaldo[idx % fotosRespaldo.length]
      }));

    return {
      top5Audiencia,
      clasificacionesDistintas,
      audienciaPredominante,
      porcentajePredominante,
      distribucionAudiencias
    };
  }, [rawRows, audienciaMarcada]);

  const datosGraficoAudiencias = useMemo(() => {
    const lista = analisisCsv.distribucionAudiencias.filter((d) => d.cantidad > 0);
    if (!lista.length) return [];
    if (limiteAudiencias === 'top6') return lista.slice(0, 6);
    if (limiteAudiencias === 'top10') return lista.slice(0, 10);
    return lista;
  }, [analisisCsv.distribucionAudiencias, limiteAudiencias]);

  if (loading) {
    return (
      <div className="p-8 bg-[#121118] min-h-screen text-white flex items-center justify-center">
        Cargando panel de tendencias actuales...
      </div>
    );
  }

  const maxGrafico = Math.max(...datosGraficoAudiencias.map((d) => d.cantidad), 100);

  return (
    <div className="p-8 bg-[#121118] min-h-screen text-white font-sans overflow-y-auto relative">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#e50914] rounded"></div>
          <h2 className="text-xl font-bold tracking-wide text-white">Tendencias actuales</h2>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#1e1d28] flex items-center justify-center text-lg border border-slate-700 shadow cursor-pointer hover:scale-105 transition">
          🔔
        </div>
      </div>

      {/* 2 Tarjetas Métricas Superiores con borde rojo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* KPI 1: Clasificaciones distintas */}
        <div className="relative bg-[#181722] border border-[#e50914] p-5 rounded-2xl flex justify-between items-center shadow-[0_0_18px_rgba(229,9,20,0.18)] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop')`
            }}
          ></div>
          <div className="relative z-10">
            <div className="text-xs font-semibold text-slate-400 mb-1">
              Clasificaciones distintas
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-white">
                {analisisCsv.clasificacionesDistintas}{' '}
                <span className="text-sm font-normal text-slate-400">audiencias</span>
              </h3>
              <span className="text-xs font-bold text-emerald-400">Catálogo</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Audiencia predominante */}
        <div className="relative bg-[#181722] border border-[#e50914] p-5 rounded-2xl flex justify-between items-center shadow-[0_0_18px_rgba(229,9,20,0.18)] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=400&auto=format&fit=crop')`
            }}
          ></div>
          <div className="relative z-10">
            <div className="text-xs font-semibold text-slate-400 mb-1">Audiencia predominante</div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-white">
                {analisisCsv.audienciaPredominante}
              </h3>
              <span className="text-xs font-bold text-emerald-400">
                {analisisCsv.porcentajePredominante}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección Central: Títulos destacados por clasificación */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Títulos destacados por clasificación */}
        <div className="lg:col-span-7 bg-[#181722] border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e50914] inline-block shrink-0 shadow-[0_0_8px_rgba(229,9,20,0.9)]"></span>
              <h3 className="text-base font-bold text-white">
                Títulos destacados por clasificación (Haz clic en un título)
              </h3>
            </div>
            {audienciaMarcada && (
              <button
                onClick={() => setAudienciaMarcada(null)}
                className="text-[11px] font-bold text-[#ff6b6b] hover:underline cursor-pointer"
              >
                Filtro: {audienciaMarcada} ✕
              </button>
            )}
          </div>

          <div
            className="overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[#121118] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#262533] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-[#343245]"
            style={{ scrollbarColor: '#262533 #121118', scrollbarWidth: 'thin' }}
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 pr-3 w-8">#</th>
                  <th className="pb-3 px-3">Título</th>
                  <th className="pb-3 px-4 whitespace-nowrap">Audiencia</th>
                  <th className="pb-3 px-4 whitespace-nowrap">Duración</th>
                  <th className="pb-3 pl-6">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {analisisCsv.top5Audiencia.map((item) => (
                  <tr
                    key={`${item.title}-${item.id}`}
                    onClick={() => setPeliculaSeleccionada(item)}
                    className="hover:bg-[#1e1d28] transition group cursor-pointer"
                  >
                    <td className="py-3.5 pr-3 font-extrabold text-slate-400 align-middle">
                      {item.id}
                    </td>
                    <td className="py-3.5 px-3 align-middle">
                      <div className="flex items-center gap-3 min-w-[140px]">
                        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-slate-700">
                          <img
                            src={item.poster}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-bold text-white group-hover:text-[#e50914] transition truncate max-w-[150px]">
                          {item.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-amber-400 whitespace-nowrap align-middle">
                      ⭐ {item.audiencia}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap align-middle">
                      ⏱️ {item.duration}
                    </td>
                    <td className="py-3.5 pl-6 text-slate-400 truncate max-w-[180px] sm:max-w-xs align-middle">
                      {item.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gráfica de barras: Distribución de títulos por audiencia */}
        <div className="lg:col-span-5 bg-[#d4d4d8] border border-slate-400 p-6 rounded-2xl shadow-xl flex flex-col justify-between text-slate-900">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Títulos por audiencia</h3>
              {audienciaMarcada && (
                <button
                  onClick={() => setAudienciaMarcada(null)}
                  className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#e50914] text-white cursor-pointer"
                >
                  {audienciaMarcada} ✕
                </button>
              )}
            </div>
            <div className="flex bg-[#bcbcc2] p-1 rounded-xl border border-slate-400 text-[10px] font-bold">
              {[
                { key: 'top6', label: 'Top 6' },
                { key: 'top10', label: 'Top 10' },
                { key: 'completas', label: 'Completas' }
              ].map((opcion) => (
                <button
                  key={opcion.key}
                  onClick={() => setLimiteAudiencias(opcion.key)}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-bold ${
                    limiteAudiencias === opcion.key
                      ? 'bg-[#e50914] text-white shadow-md'
                      : 'text-slate-700 hover:text-black'
                  }`}
                >
                  {opcion.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datosGraficoAudiencias}
                margin={{ top: 15, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#a1a1aa" vertical={false} />
                <XAxis
                  dataKey="audiencia"
                  stroke="#52525b"
                  tick={{ fontSize: 10, fill: '#3f3f46', fontWeight: 'bold' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#52525b"
                  domain={[0, maxGrafico]}
                  tick={{ fontSize: 10, fill: '#3f3f46', fontWeight: 'bold' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(229, 9, 20, 0.08)' }}
                  content={<TooltipPorcentajeAudiencia />}
                />
                <Bar
                  dataKey="cantidad"
                  radius={[8, 8, 0, 0]}
                  className="cursor-pointer"
                  onClick={(data) => {
                    if (!data || !data.audiencia) return;
                    setAudienciaMarcada((prev) =>
                      prev === data.audiencia ? null : data.audiencia
                    );
                  }}
                >
                  {datosGraficoAudiencias.map((entrada, idx) => {
                    const estaMarcada = audienciaMarcada === entrada.audiencia;
                    const hayOtraMarcada = audienciaMarcada && !estaMarcada;
                    return (
                      <Cell
                        key={`cell-${entrada.audiencia}-${idx}`}
                        fill={estaMarcada ? '#e50914' : entrada.color}
                        fillOpacity={hayOtraMarcada ? 0.45 : 1}
                        stroke={estaMarcada ? '#18181b' : 'none'}
                        strokeWidth={estaMarcada ? 2 : 0}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[10px] font-semibold text-slate-600 text-center mt-1">
            Pasa el cursor para ver el porcentaje o haz clic para marcar una audiencia
          </p>

          {/* Resumen rápido de las 3 audiencias principales */}
          <div className="mt-3 pt-3 border-t border-slate-400/70">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-2">
              Clasificaciones con más títulos
            </p>
            <div className="grid grid-cols-3 gap-2">
              {analisisCsv.distribucionAudiencias.slice(0, 3).map((item, idx) => {
                const marcada = audienciaMarcada === item.audiencia;
                return (
                  <button
                    key={item.audiencia}
                    onClick={() =>
                      setAudienciaMarcada((prev) =>
                        prev === item.audiencia ? null : item.audiencia
                      )
                    }
                    className={`rounded-xl px-2.5 py-2 text-center border transition cursor-pointer ${
                      marcada
                        ? 'bg-[#e50914]/15 border-[#e50914] ring-1 ring-[#e50914]'
                        : 'bg-white/75 border-slate-400 hover:bg-white'
                    }`}
                  >
                    <p className="text-[10px] font-bold text-slate-600">#{idx + 1}</p>
                    <p className="text-xs font-black text-slate-900">{item.audiencia}</p>
                    <p className="text-xs font-black text-[#e50914]">{item.porcentaje}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL / PANTALLA GRANDE DE DETALLE (SOLO X) */}
      {peliculaSeleccionada && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#181722] border border-slate-700 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setPeliculaSeleccionada(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 border border-slate-600 flex items-center justify-center text-white hover:bg-[#e50914] transition cursor-pointer"
            >
              ✕
            </button>

            <div className="relative h-64 sm:h-80 w-full overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center filter brightness-90"
                style={{ backgroundImage: `url(${peliculaSeleccionada.poster})` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#181722] via-[#181722]/40 to-transparent"></div>

              <div className="absolute bottom-6 left-6 right-6 z-10">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#e50914] text-white mb-2 inline-block">
                  {peliculaSeleccionada.type} • {peliculaSeleccionada.releaseYear}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {peliculaSeleccionada.title}
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl text-amber-400 font-bold text-sm">
                  <span>⭐</span> Audiencia: {peliculaSeleccionada.audiencia}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1 rounded-xl text-slate-300 font-semibold text-sm">
                  <span>⏱️</span> Duración: {peliculaSeleccionada.duration}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Descripción completa
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed bg-[#121118] p-4 rounded-xl border border-slate-800">
                  {peliculaSeleccionada.desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}