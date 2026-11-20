import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  CartesianGrid
} from 'recharts';

function TooltipPorcentajeBarra({ active, payload, label, unidad = 'títulos' }) {
  if (!active || !payload || !payload.length) return null;

  const entry = payload[0];
  const itemData = entry?.payload?.payload || entry?.payload || {};
  const nombre = itemData.name || label || '';
  const valor = Number(itemData.value ?? entry?.value ?? 0);
  const porcentaje = itemData.porcentaje ?? '0.0';

  return (
    <div
      style={{
        backgroundColor: '#f8fafc',
        color: '#0f172a',
        border: '1px solid #94a3b8',
        borderRadius: '10px',
        padding: '10px 14px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
        fontSize: '12px',
        lineHeight: 1.5
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: '2px', color: '#090d16' }}>{nombre}</div>
      <div style={{ color: '#111827', fontWeight: 600 }}>
        {valor.toLocaleString()} {unidad}{' '}
        <span style={{ fontWeight: 800, color: '#000000' }}>({porcentaje}%)</span>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const [rawRows, setRawRows] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [genreData, setGenreData] = useState([]);
  const [directorData, setDirectorData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de navegación por pestañas (DÍA, MES, AÑO)
  const [filtroTiempo, setFiltroTiempo] = useState(null);
  const [anosDisponibles, setAnosDisponibles] = useState([]);

  // Filtros independientes
  const [selectedAno, setSelectedAno] = useState('TODOS');
  const [selectedMes, setSelectedMes] = useState('TODOS');
  const [selectedDia, setSelectedDia] = useState('TODOS');

  const mesesAbreviados = [
    { id: 'Jan', name: 'JAN' }, { id: 'Feb', name: 'FEB' }, { id: 'Mar', name: 'MAR' },
    { id: 'Apr', name: 'APR' }, { id: 'May', name: 'MAY' }, { id: 'Jun', name: 'JUN' },
    { id: 'Jul', name: 'JUL' }, { id: 'Aug', name: 'AUG' }, { id: 'Sep', name: 'SEP' },
    { id: 'Oct', name: 'OCT' }, { id: 'Nov', name: 'NOV' }, { id: 'Dec', name: 'DEC' }
  ];
  const diasLista = Array.from({ length: 31 }, (_, i) => String(i + 1));

  // Estado para el detalle del director seleccionado
  const [selectedDirectorDetail, setSelectedDirectorDetail] = useState(null);

  useEffect(() => {
    fetch('/netflix_titles.csv')
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const rows = results.data;
            setRawRows(rows);

            // Años reales del CSV
            const yearsSet = [...new Set(rows.map((r) => r.release_year).filter(Boolean))].sort(
              (a, b) => a - b
            );
            setAnosDisponibles(yearsSet);

            // Cargar gráfico inicial general
            applySmartFilters(rows, 'TODOS', 'TODOS', 'TODOS');

            // Dona: Tipo de contenido
            let movies = 0;
            let shows = 0;
            rows.forEach((r) => {
              if (r.type === 'Movie') movies++;
              if (r.type === 'TV Show') shows++;
            });
            const total = movies + shows || 1;
            setPieData([
              {
                name: 'Película',
                value: movies,
                porcentaje: ((movies / total) * 100).toFixed(1)
              },
              {
                name: 'Serie',
                value: shows,
                porcentaje: ((shows / total) * 100).toFixed(1)
              }
            ]);

            // País (Top 10) con porcentaje respecto al total de títulos con país registrado
            const countryMap = {};
            let totalCountryCount = 0;
            rows.forEach((r) => {
              if (r.country && String(r.country).trim() !== '') {
                const c = String(r.country).split(',')[0].trim();
                countryMap[c] = (countryMap[c] || 0) + 1;
                totalCountryCount += 1;
              }
            });
            const countryBase = totalCountryCount || 1;
            setBarData(
              Object.keys(countryMap)
                .map((c) => ({
                  name: c,
                  value: countryMap[c],
                  porcentaje: ((countryMap[c] / countryBase) * 100).toFixed(1)
                }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 10)
            );

            // Género (Top 5) con porcentaje respecto al total de títulos con género registrado
            const genreMap = {};
            let totalGenreCount = 0;
            rows.forEach((r) => {
              if (r.listed_in && String(r.listed_in).trim() !== '') {
                const mainGenre = String(r.listed_in).split(',')[0].trim();
                genreMap[mainGenre] = (genreMap[mainGenre] || 0) + 1;
                totalGenreCount += 1;
              }
            });
            const genreBase = totalGenreCount || 1;
            setGenreData(
              Object.keys(genreMap)
                .map((name) => ({
                  name,
                  value: genreMap[name],
                  porcentaje: ((genreMap[name] / genreBase) * 100).toFixed(1)
                }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5)
            );

            // Director (Top 5) con porcentaje respecto al total de títulos con director registrado
            const directorMap = {};
            let totalDirectorCount = 0;
            rows.forEach((r) => {
              if (r.director && String(r.director).trim() !== '') {
                const mainDirector = String(r.director).split(',')[0].trim();
                directorMap[mainDirector] = (directorMap[mainDirector] || 0) + 1;
                totalDirectorCount += 1;
              }
            });
            const directorBase = totalDirectorCount || 1;
            setDirectorData(
              Object.keys(directorMap)
                .map((name) => ({
                  name,
                  value: directorMap[name],
                  porcentaje: ((directorMap[name] / directorBase) * 100).toFixed(1)
                }))
                .filter((d) => d.value > 1)
                .sort((a, b) => b.value - a.value)
                .slice(0, 5)
            );

            setLoading(false);
          }
        });
      });
  }, []);

  // Motor de filtrado inteligente
  const applySmartFilters = (rows, ano, mes, dia) => {
    let filtered = rows.filter((r) => r.release_year);

    if (ano !== 'TODOS') {
      filtered = filtered.filter((r) => String(r.release_year) === String(ano));
    }

    if (mes !== 'TODOS' || dia !== 'TODOS') {
      filtered = filtered.filter((r) => {
        if (!r.date_added) return false;
        const d = new Date(r.date_added);
        if (isNaN(d)) return false;

        const matchMes =
          mes === 'TODOS' ||
          d.toLocaleString('en', { month: 'short' }).toUpperCase() === mes.toUpperCase();
        const matchDia = dia === 'TODOS' || String(d.getDate()) === String(dia);

        return matchMes && matchDia;
      });
    }

    const map = {};
    filtered.forEach((r) => {
      let key = String(r.release_year);
      if (mes !== 'TODOS' || dia !== 'TODOS') {
        key = `${dia !== 'TODOS' ? `Día ${dia} ` : ''}${mes !== 'TODOS' ? mes : ''} (${r.release_year})`;
      }

      if (!map[key]) {
        map[key] = {
          name: key,
          Películas: 0,
          Series: 0,
          sortKey: Number(r.release_year) || 0
        };
      }
      if (r.type === 'Movie') map[key].Películas += 1;
      if (r.type === 'TV Show') map[key].Series += 1;
    });

    let formatted = Object.values(map).sort((a, b) => a.sortKey - b.sortKey);

    if (formatted.length === 0 && ano !== 'TODOS') {
      const fallbackMovies = rows.filter(
        (r) => String(r.release_year) === String(ano) && r.type === 'Movie'
      ).length;
      const fallbackShows = rows.filter(
        (r) => String(r.release_year) === String(ano) && r.type === 'TV Show'
      ).length;
      formatted = [
        { name: `Año ${ano} (General)`, Películas: fallbackMovies, Series: fallbackShows }
      ];
    }

    if (formatted.length === 1) {
      formatted = [{ name: 'Inicio', Películas: 0, Series: 0 }, formatted[0]];
    }

    setLineData(
      formatted.length > 0 ? formatted : [{ name: 'Sin registros', Películas: 0, Series: 0 }]
    );
  };

  const handleTabChange = (modo) => {
    setFiltroTiempo(filtroTiempo === modo ? null : modo);
  };

  const handleResetFilters = () => {
    setSelectedAno('TODOS');
    setSelectedMes('TODOS');
    setSelectedDia('TODOS');
    applySmartFilters(rawRows, 'TODOS', 'TODOS', 'TODOS');
  };

  const handleDirectorClick = (dirName) => {
    if (selectedDirectorDetail?.name === dirName) {
      setSelectedDirectorDetail(null);
    } else {
      const titles = rawRows
        .filter(
          (r) =>
            r.director &&
            String(r.director).split(',')[0].trim().toLowerCase() === dirName.toLowerCase()
        )
        .map((r) => r.title);
      setSelectedDirectorDetail({ name: dirName, titles });
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-[#181722] min-h-screen text-white flex items-center justify-center">
        Cargando datos de Netflix...
      </div>
    );
  }

  const PIE_COLORS = ['#2563eb', '#38bdf8'];
  const COUNTRY_COLORS = [
    '#d97706', '#eab308', '#f59e0b', '#ca8a04', '#eab308',
    '#facc15', '#eab308', '#ca8a04', '#f59e0b', '#eab308'
  ];
  const GENRE_COLORS = ['#ec4899', '#f97316', '#eab308', '#facc15', '#f472b6'];
  const DIRECTOR_COLORS = ['#7c3aed', '#8b5cf6', '#a855f7', '#6366f1', '#9333ea'];
  const totalTitulosDona = pieData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="p-8 bg-[#181722] min-h-screen text-white overflow-y-auto font-sans">
      {/* Encabezado Principal */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-white">
            LA ECONOMÍA DE ENTRETENIMIENTO
          </h2>
          <div className="flex items-center gap-3 mt-1 pl-24">
            <span className="text-4xl font-black tracking-tighter text-[#e50914]">NETFLIX</span>
            <span className="text-xl font-bold tracking-wide text-white">Y TENDENCIAS GLOBALES</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#23222e] flex items-center justify-center text-lg border border-slate-700 shadow cursor-pointer hover:scale-105 transition">
          🔔
        </div>
      </div>

      {/* Sección Gráfico Superior: Año de estreno */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#e50914] rounded"></div>
            <h3 className="text-lg font-medium text-slate-200">Año de estreno</h3>
          </div>
          {(selectedAno !== 'TODOS' || selectedMes !== 'TODOS' || selectedDia !== 'TODOS') && (
            <div className="flex items-center gap-3 bg-[#23222e] px-3 py-1 rounded-xl border border-red-500/50 shadow">
              <span className="text-xs text-slate-300 font-semibold">
                Filtro activo:{' '}
                <strong className="text-[#38bdf8]">
                  {selectedDia !== 'TODOS' ? `Día ${selectedDia}` : ''}{' '}
                  {selectedMes !== 'TODOS' ? `/ ${selectedMes}` : ''}{' '}
                  {selectedAno !== 'TODOS' ? `/ Año ${selectedAno}` : ''}
                </strong>
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs bg-[#d92638] text-white px-2 py-0.5 rounded font-bold hover:bg-red-700 transition cursor-pointer"
              >
                Limpiar ✕
              </button>
            </div>
          )}
        </div>

        {/* Botones de Pestañas (DÍA, MES, AÑO) */}
        <div className="flex items-center gap-3 mb-4">
          {['DÍA', 'MES', 'AÑO'].map((tipo) => (
            <button
              key={tipo}
              onClick={() => handleTabChange(tipo)}
              className={`px-6 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer shadow-md ${
                filtroTiempo === tipo
                  ? 'bg-[#d92638] border-[#d92638] text-white shadow-red-600/30'
                  : 'bg-transparent border-slate-500 text-slate-300 hover:border-white'
              }`}
            >
              {tipo}{' '}
              {tipo === 'DÍA' && selectedDia !== 'TODOS'
                ? `(${selectedDia})`
                : tipo === 'MES' && selectedMes !== 'TODOS'
                ? `(${selectedMes})`
                : tipo === 'AÑO' && selectedAno !== 'TODOS'
                ? `(${selectedAno})`
                : ''}
            </button>
          ))}
          <span className="text-xl ml-1 text-slate-400">📅</span>
        </div>

        {/* PANEL DESPLEGABLE INTERACTIVO */}
        {filtroTiempo && (
          <div className="mb-4 bg-[#23222e] p-4 rounded-2xl border border-slate-700 shadow-lg">
            {filtroTiempo === 'DÍA' && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Selecciona un Día (1 - 31):
                  </span>
                  <button
                    onClick={() => setFiltroTiempo(null)}
                    className="text-[11px] text-red-400 hover:underline cursor-pointer"
                  >
                    Cerrar ✕
                  </button>
                </div>
                <div className="grid grid-cols-7 sm:grid-cols-11 gap-2">
                  <button
                    onClick={() => {
                      setSelectedDia('TODOS');
                      applySmartFilters(rawRows, selectedAno, selectedMes, 'TODOS');
                    }}
                    className={`px-2 py-1 rounded border text-xs font-bold cursor-pointer ${
                      selectedDia === 'TODOS'
                        ? 'bg-[#d92638] border-[#d92638] text-white'
                        : 'border-slate-600 text-slate-300'
                    }`}
                  >
                    Todos
                  </button>
                  {diasLista.map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setSelectedDia(d);
                        applySmartFilters(rawRows, selectedAno, selectedMes, d);
                      }}
                      className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold transition cursor-pointer ${
                        selectedDia === d
                          ? 'bg-[#d92638] border-[#d92638] text-white shadow-md scale-110'
                          : 'border-slate-500 text-slate-300 hover:border-white hover:bg-slate-800'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filtroTiempo === 'MES' && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Selecciona un Mes:
                  </span>
                  <button
                    onClick={() => setFiltroTiempo(null)}
                    className="text-[11px] text-red-400 hover:underline cursor-pointer"
                  >
                    Cerrar ✕
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  <button
                    onClick={() => {
                      setSelectedMes('TODOS');
                      applySmartFilters(rawRows, selectedAno, 'TODOS', selectedDia);
                    }}
                    className={`flex flex-col items-center rounded-xl border p-2 text-xs font-bold cursor-pointer ${
                      selectedMes === 'TODOS'
                        ? 'bg-[#d92638] border-[#d92638] text-white'
                        : 'border-slate-600 text-slate-300 bg-slate-800'
                    }`}
                  >
                    Todos los meses
                  </button>
                  {mesesAbreviados.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedMes(m.name);
                        applySmartFilters(rawRows, selectedAno, m.name, selectedDia);
                      }}
                      className={`flex flex-col items-center rounded-xl border overflow-hidden transition cursor-pointer shadow-md ${
                        selectedMes === m.name
                          ? 'border-[#d92638] bg-[#d92638]/20 scale-105'
                          : 'border-slate-600 bg-slate-800 hover:border-slate-400'
                      }`}
                    >
                      <div className="w-full bg-[#d92638] text-white text-[10px] font-bold py-0.5 text-center">
                        NETFLIX
                      </div>
                      <span className="py-2 text-xs font-black tracking-widest text-white">
                        {m.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filtroTiempo === 'AÑO' && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    AÑOS DEL CSV:
                  </span>
                  <button
                    onClick={() => setFiltroTiempo(null)}
                    className="text-[11px] text-red-400 hover:underline cursor-pointer"
                  >
                    Cerrar ✕
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2">
                  <button
                    onClick={() => {
                      setSelectedAno('TODOS');
                      applySmartFilters(rawRows, 'TODOS', selectedMes, selectedDia);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      selectedAno === 'TODOS'
                        ? 'bg-[#d92638] border-[#d92638] text-white'
                        : 'border-slate-600 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Todos
                  </button>
                  {anosDisponibles.map((a) => (
                    <button
                      key={a}
                      onClick={() => {
                        setSelectedAno(a);
                        applySmartFilters(rawRows, a, selectedMes, selectedDia);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        String(selectedAno) === String(a)
                          ? 'bg-[#d92638] border-[#d92638] text-white scale-105'
                          : 'border-slate-600 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contenedor Gráfico de Líneas a Ancho Completo */}
        <div className="bg-[#b8b6b8] rounded-2xl p-6 text-slate-900 shadow-2xl w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <XAxis dataKey="name" stroke="#333" tick={{ fontSize: 12, fill: '#333' }} />
              <YAxis stroke="#333" tick={{ fontSize: 12, fill: '#333' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                  borderRadius: '10px',
                  border: '1px solid #94a3b8'
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="Películas"
                stroke="#ec4899"
                strokeWidth={3}
                dot={{ r: 5, fill: '#ec4899' }}
                activeDot={{ r: 8 }}
                name="Películas"
              />
              <Line
                type="monotone"
                dataKey="Series"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 5, fill: '#3b82f6' }}
                activeDot={{ r: 8 }}
                name="Series"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Contenedores Medios: Dona y Gráfica de Barras Horizontales por País */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Dona con dos tonos de azul */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1.5 h-6 bg-[#e50914] rounded"></div>
            <h3 className="text-lg font-medium text-slate-200">Por tipo de contenido</h3>
          </div>
          <div className="bg-[#b8b6b8] rounded-2xl p-6 text-slate-900 shadow-2xl h-[480px] flex flex-col justify-between">
            <div className="mb-1 border-b border-slate-400/50 pb-2">
              <h4 className="text-xs font-black tracking-wider uppercase text-slate-900">
                PROPORCIÓN GLOBAL DE TÍTULOS
              </h4>
            </div>

            <div className="relative w-full h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={6}
                    cornerRadius={4}
                    dataKey="value"
                    label={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        stroke="#1e3a8a"
                        strokeWidth={1}
                        className="cursor-pointer hover:opacity-80 transition outline-none shadow"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, item) => [
                      `${Number(value).toLocaleString()} títulos (${item?.payload?.porcentaje ?? '0.0'}%)`,
                      name
                    ]}
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      borderRadius: '10px',
                      border: '1px solid #94a3b8'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-[10px] font-black tracking-widest text-slate-600 uppercase">
                  TOTAL
                </span>
                <span className="text-xl font-black text-slate-900">
                  {totalTitulosDona.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-400/50">
              {pieData.map((item, idx) => (
                <div
                  key={item.name}
                  className="bg-slate-300/70 p-3 rounded-xl border border-slate-400/60 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-md shrink-0"
                      style={{ backgroundColor: PIE_COLORS[idx] }}
                    ></span>
                    <span className="text-xs font-black uppercase text-slate-900">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 block">
                      {item.porcentaje}%
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 block">
                      {item.value.toLocaleString()} reg.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gráfica de Barras Horizontales: Top 10 Países */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1.5 h-6 bg-[#e50914] rounded"></div>
            <h3 className="text-lg font-medium text-slate-200">
              Distribución por país (Top 10 Ranking)
            </h3>
          </div>
          <div className="bg-[#b8b6b8] rounded-2xl p-6 text-slate-900 shadow-2xl h-[480px] flex flex-col justify-between">
            <div className="mb-3 border-b border-slate-400/50 pb-2">
              <h4 className="text-xs font-black tracking-wider uppercase text-slate-900">
                TOP 10 PAÍSES CON MAYOR PRODUCCIÓN
              </h4>
            </div>

            <div className="flex-1 w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 5, right: 35, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#333"
                    tick={{ fontSize: 11, fill: '#1f2937', fontWeight: 'bold' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    stroke="#333"
                    tick={{ fontSize: 11, fill: '#111827', fontWeight: 'bold' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0, 0, 0, 0.08)' }}
                    content={<TooltipPorcentajeBarra unidad="títulos" />}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
                    {barData.map((_, idx) => (
                      <Cell
                        key={`country-bar-${idx}`}
                        fill={COUNTRY_COLORS[idx % COUNTRY_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: GÉNEROS Y DIRECTORES */}
      <div className="space-y-10 mb-8">
        {/* Gráfica de Barras Horizontales: Distribución por Género (Top 5) */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1.5 h-6 bg-[#e50914] rounded"></div>
            <h3 className="text-xl font-bold tracking-wide text-slate-100">
              Distribución por género
            </h3>
          </div>
          <div className="bg-[#b8b6b8] rounded-2xl p-6 text-slate-900 shadow-2xl h-[360px] flex flex-col justify-between">
            <div className="mb-3 border-b border-slate-400/50 pb-2">
              <h4 className="text-xs font-black tracking-wider uppercase text-slate-900">
                TOP 5 GÉNEROS MÁS POPULARES
              </h4>
            </div>

            <div className="flex-1 w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={genreData}
                  layout="vertical"
                  margin={{ top: 5, right: 35, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#333"
                    tick={{ fontSize: 12, fill: '#1f2937', fontWeight: 'bold' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={165}
                    stroke="#333"
                    tick={{ fontSize: 12, fill: '#111827', fontWeight: 'bold' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0, 0, 0, 0.08)' }}
                    content={<TooltipPorcentajeBarra unidad="títulos" />}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
                    {genreData.map((_, idx) => (
                      <Cell
                        key={`genre-bar-${idx}`}
                        fill={GENRE_COLORS[idx % GENRE_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Gráfica de Barras Horizontales: Títulos por Director (Top 5) */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1.5 h-6 bg-[#e50914] rounded"></div>
            <h3 className="text-xl font-bold tracking-wide text-slate-100">Títulos por director</h3>
          </div>
          <div className="bg-[#b8b6b8] rounded-2xl p-6 text-slate-900 shadow-2xl transition-all duration-300 flex flex-col justify-between">
            <div className="mb-3 border-b border-slate-400/50 pb-2 flex justify-between items-center">
              <h4 className="text-xs font-black tracking-wider uppercase text-slate-900">
                TOP 5 DIRECTORES CON MÁS TÍTULOS (Haz clic en una barra para ver obras)
              </h4>
              {selectedDirectorDetail && (
                <button
                  onClick={() => setSelectedDirectorDetail(null)}
                  className="text-[11px] bg-slate-900 text-white px-2 py-0.5 rounded font-bold hover:bg-red-700 transition cursor-pointer"
                >
                  Cerrar detalle ✕
                </button>
              )}
            </div>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={directorData}
                  layout="vertical"
                  margin={{ top: 5, right: 35, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    stroke="#333"
                    tick={{ fontSize: 12, fill: '#1f2937', fontWeight: 'bold' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={150}
                    stroke="#333"
                    tick={{ fontSize: 12, fill: '#111827', fontWeight: 'bold' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0, 0, 0, 0.08)' }}
                    content={<TooltipPorcentajeBarra unidad="títulos" />}
                  />
                  <Bar
                    dataKey="value"
                    radius={[0, 8, 8, 0]}
                    barSize={30}
                    className="cursor-pointer"
                    onClick={(barItem) => {
                      const clickedName = barItem?.name || barItem?.payload?.name;
                      if (clickedName) {
                        handleDirectorClick(clickedName);
                      }
                    }}
                  >
                    {directorData.map((_, idx) => (
                      <Cell
                        key={`director-bar-${idx}`}
                        fill={DIRECTOR_COLORS[idx % DIRECTOR_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {selectedDirectorDetail && (
              <div className="mt-4 bg-[#181722] text-white p-3.5 rounded-xl border border-slate-600 shadow-2xl">
                <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-1.5">
                  <span className="text-xs font-bold text-[#38bdf8] uppercase tracking-wider">
                    🎬 Obras dirigidas por {selectedDirectorDetail.name} (
                    {selectedDirectorDetail.titles.length})
                  </span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 max-h-40 overflow-y-auto pr-2 text-xs text-slate-300 list-disc list-inside">
                  {selectedDirectorDetail.titles.map((title, i) => (
                    <li key={i} className="truncate">
                      {title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}