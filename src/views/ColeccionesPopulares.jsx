import React, { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const CONFIG_RANGOS_POR_CATEGORIA = {
  'International Movies': {
    unidad: 'minutos',
    rangos: [
      {
        key: 'intl_cortas',
        label: 'Películas cortas: Menos de 1h 20m (< 80 min)',
        gradient: 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)',
        match: (min) => min !== null && min < 80
      },
      {
        key: 'intl_normal',
        label: 'Películas de duración normal: 1h 20m a 1h 50m (80 - 110 min)',
        gradient: 'linear-gradient(90deg, #38bdf8 0%, #60a5fa 100%)',
        match: (min) => min !== null && min >= 80 && min <= 110
      },
      {
        key: 'intl_largas',
        label: 'Películas largas: 1h 51m a 2h 20m (111 - 140 min)',
        gradient: 'linear-gradient(90deg, #fb923c 0%, #fdba74 100%)',
        match: (min) => min !== null && min > 110 && min <= 140
      },
      {
        key: 'intl_muy_largas',
        label: 'Películas muy largas: Más de 2h 20m (> 140 min)',
        gradient: 'linear-gradient(90deg, #f472b6 0%, #fda4af 100%)',
        match: (min) => min !== null && min > 140
      }
    ]
  },
  Dramas: {
    unidad: 'minutos',
    rangos: [
      {
        key: 'drama_breves',
        label: 'Historias breves: Menos de 1h 25m (< 85 min)',
        gradient: 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)',
        match: (min) => min !== null && min < 85
      },
      {
        key: 'drama_tipica',
        label: 'Duración típica: 1h 25m a 1h 55m (85 - 115 min)',
        gradient: 'linear-gradient(90deg, #38bdf8 0%, #60a5fa 100%)',
        match: (min) => min !== null && min >= 85 && min <= 115
      },
      {
        key: 'drama_extensas',
        label: 'Historias extensas: 1h 56m a 2h 25m (116 - 145 min)',
        gradient: 'linear-gradient(90deg, #fb923c 0%, #fdba74 100%)',
        match: (min) => min !== null && min > 115 && min <= 145
      },
      {
        key: 'drama_maraton',
        label: 'Maratón dramático: Más de 2h 25m (> 145 min)',
        gradient: 'linear-gradient(90deg, #2dd4bf 0%, #38bdf8 100%)',
        match: (min) => min !== null && min > 145
      }
    ]
  },
  Comedies: {
    unidad: 'minutos',
    rangos: [
      {
        key: 'com_especiales',
        label: 'Especiales y cortas: Menos de 1h 05m (< 65 min)',
        gradient: 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)',
        match: (min) => min !== null && min < 65
      },
      {
        key: 'com_ligeras',
        label: 'Comedias ligeras: 1h 05m a 1h 35m (65 - 95 min)',
        gradient: 'linear-gradient(90deg, #fb923c 0%, #fdba74 100%)',
        match: (min) => min !== null && min >= 65 && min <= 95
      },
      {
        key: 'com_estandar',
        label: 'Comedias estándar: 1h 36m a 2h 00m (96 - 120 min)',
        gradient: 'linear-gradient(90deg, #38bdf8 0%, #60a5fa 100%)',
        match: (min) => min !== null && min > 95 && min <= 120
      },
      {
        key: 'com_largas',
        label: 'Comedias largas: Más de 2h 00m (> 120 min)',
        gradient: 'linear-gradient(90deg, #f472b6 0%, #fda4af 100%)',
        match: (min) => min !== null && min > 120
      }
    ]
  },
  'International TV Shows': {
    unidad: 'temporadas',
    rangos: [
      {
        key: 'tv_1_temp',
        label: 'Series de 1 temporada',
        gradient: 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)',
        match: (_min, temp) => temp !== null && temp === 1
      },
      {
        key: 'tv_2_3_temp',
        label: 'Series de 2 a 3 temporadas',
        gradient: 'linear-gradient(90deg, #38bdf8 0%, #60a5fa 100%)',
        match: (_min, temp) => temp !== null && temp >= 2 && temp <= 3
      },
      {
        key: 'tv_4_mas_temp',
        label: 'Series de 4 o más temporadas',
        gradient: 'linear-gradient(90deg, #2dd4bf 0%, #38bdf8 100%)',
        match: (_min, temp) => temp !== null && temp >= 4
      }
    ]
  },
  Documentaries: {
    unidad: 'minutos',
    rangos: [
      {
        key: 'doc_cortos',
        label: 'Documentales cortos: Menos de 50 min',
        gradient: 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)',
        match: (min) => min !== null && min < 50
      },
      {
        key: 'doc_estandar',
        label: 'Documentales estándar: 50 a 95 min (hasta 1h 35m)',
        gradient: 'linear-gradient(90deg, #38bdf8 0%, #60a5fa 100%)',
        match: (min) => min !== null && min >= 50 && min <= 95
      },
      {
        key: 'doc_largos',
        label: 'Documentales largos: 96 a 120 min (1h 36m a 2h)',
        gradient: 'linear-gradient(90deg, #fb923c 0%, #fdba74 100%)',
        match: (min) => min !== null && min > 95 && min <= 120
      },
      {
        key: 'doc_muy_largos',
        label: 'Documentales muy largos: Más de 2h 00m (> 120 min)',
        gradient: 'linear-gradient(90deg, #f472b6 0%, #fda4af 100%)',
        match: (min) => min !== null && min > 120
      }
    ]
  },
  'Action & Adventure': {
    unidad: 'minutos',
    rangos: [
      {
        key: 'act_rapida',
        label: 'Acción rápida: Menos de 1h 30m (< 90 min)',
        gradient: 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)',
        match: (min) => min !== null && min < 90
      },
      {
        key: 'act_estandar',
        label: 'Aventura estándar: 1h 30m a 2h 00m (90 - 120 min)',
        gradient: 'linear-gradient(90deg, #38bdf8 0%, #60a5fa 100%)',
        match: (min) => min !== null && min >= 90 && min <= 120
      },
      {
        key: 'act_extendida',
        label: 'Acción extendida: 2h 01m a 2h 25m (121 - 145 min)',
        gradient: 'linear-gradient(90deg, #fb923c 0%, #fdba74 100%)',
        match: (min) => min !== null && min > 120 && min <= 145
      },
      {
        key: 'act_gran_aventura',
        label: 'Gran aventura: Más de 2h 25m (> 145 min)',
        gradient: 'linear-gradient(90deg, #2dd4bf 0%, #38bdf8 100%)',
        match: (min) => min !== null && min > 145
      }
    ]
  }
};

const BASE_COLECCIONES = [
  {
    id: 'International Movies',
    title: 'International Movies',
    icon: '🎬',
    bgImage:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop',
    posters: [
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=240&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1485846234645-262644f84728?q=80&w=240&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=240&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=240&auto=format&fit=crop'
    ]
  },
  {
    id: 'Dramas',
    title: 'Dramas',
    icon: '🎭',
    bgImage:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    posters: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=240&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=240&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=240&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=240&auto=format&fit=crop'
    ]
  },
  {
    id: 'Comedies',
    title: 'Comedies',
    icon: '😄',
    bgImage:
      'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=600&auto=format&fit=crop',
    posters: [
      'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=240&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=240&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=240&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1543536448-0209d2d13a1c?q=80&w=240&auto=format&fit=crop'
    ]
  },
  {
    id: 'International TV Shows',
    title: 'International TV Shows',
    icon: '📺',
    bgImage:
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=600&auto=format&fit=crop',
    posters: [
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=240&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=240&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=240&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=240&auto=format&fit=crop'
    ]
  },
  {
    id: 'Documentaries',
    title: 'Documentaries',
    icon: '🎞️',
    bgImage:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop',
    posters: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=240&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=240&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=240&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=240&auto=format&fit=crop'
    ]
  },
  {
    id: 'Action & Adventure',
    title: 'Action & Adventure',
    icon: '⚔️',
    bgImage:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
    posters: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=240&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=240&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1485846234645-262644f84728?q=80&w=240&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=240&auto=format&fit=crop'
    ]
  }
];

const MESES_ES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

const MESES_LARGO_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

function parsearDuracionMinutos(durationStr) {
  if (!durationStr || typeof durationStr !== 'string') return null;
  const matchMin = durationStr.match(/(\d+)\s*min/i);
  if (matchMin) return Number(matchMin[1]);
  return null;
}

function parsearTemporadas(durationStr) {
  if (!durationStr || typeof durationStr !== 'string') return null;
  const matchSeason = durationStr.match(/(\d+)\s*Season/i);
  if (matchSeason) return Number(matchSeason[1]);
  return null;
}

function parsearFechaAgregado(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const limpia = dateStr.trim();
  const d = new Date(limpia);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatearFechaCorta(dateObj) {
  if (!dateObj) return 'Fecha no disponible';
  return `${dateObj.getDate()} ${MESES_ES[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
}

function formatearFechaLarga(dateObj) {
  if (!dateObj) return 'fecha no disponible';
  return `${dateObj.getDate()} de ${MESES_LARGO_ES[dateObj.getMonth()]} de ${dateObj.getFullYear()}`;
}

export default function ColeccionesPopulares() {
  const [rawRows, setRawRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [modoTemporal, setModoTemporal] = useState('anio');
  const [rangoDuracionFiltro, setRangoDuracionFiltro] = useState('TODAS');
  const [busquedaTitulo, setBusquedaTitulo] = useState('');
  const [anioIngresoFiltro, setAnioIngresoFiltro] = useState('TODOS');
  const [tituloSeleccionado, setTituloSeleccionado] = useState(null);

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

  const abrirCategoria = (col) => {
    setCategoriaSeleccionada(col);
    setModoTemporal('anio');
    setRangoDuracionFiltro('TODAS');
    setBusquedaTitulo('');
    setAnioIngresoFiltro('TODOS');
    setTituloSeleccionado(null);
  };

  const detalleCategoria = useMemo(() => {
    if (!categoriaSeleccionada) return null;
    const catId = categoriaSeleccionada.id;
    const postersList = categoriaSeleccionada.posters || [];
    const cfgCat = CONFIG_RANGOS_POR_CATEGORIA[catId] || {
      unidad: 'minutos',
      rangos: [
        {
          key: 'r1',
          label: 'Títulos cortos: Menos de 1h 15m (< 75 min)',
          gradient: 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)',
          match: (min) => min !== null && min < 75
        },
        {
          key: 'r2',
          label: 'Duración normal: 1h 15m a 1h 55m (75 - 115 min)',
          gradient: 'linear-gradient(90deg, #38bdf8 0%, #60a5fa 100%)',
          match: (min) => min !== null && min >= 75 && min <= 115
        },
        {
          key: 'r3',
          label: 'Títulos largos: Más de 1h 55m (> 115 min)',
          gradient: 'linear-gradient(90deg, #fb923c 0%, #fdba74 100%)',
          match: (min) => min !== null && min > 115
        }
      ]
    };

    const itemsBase = rawRows
      .filter((r) => r.listed_in && String(r.listed_in).includes(catId))
      .map((r, idx) => {
        const fechaAgregado = parsearFechaAgregado(r.date_added);
        const minutos = parsearDuracionMinutos(r.duration);
        const temporadas = parsearTemporadas(r.duration);
        const tituloStr = r.title || `Título ${idx + 1}`;
        const rangoEncontrado = cfgCat.rangos.find((rg) => rg.match(minutos, temporadas));
        const bucketKey = rangoEncontrado ? rangoEncontrado.key : 'Otros';
        const posterUrl =
          postersList.length > 0
            ? postersList[(idx + tituloStr.length) % postersList.length]
            : categoriaSeleccionada.bgImage;

        return {
          id: `${r.show_id || idx}-${idx}`,
          title: tituloStr,
          type: r.type || 'Movie',
          releaseYear: r.release_year || 'N/A',
          duration: r.duration || 'N/A',
          minutos,
          temporadas,
          bucketKey,
          fechaAgregado,
          anioAgregado: fechaAgregado ? fechaAgregado.getFullYear() : null,
          mesAgregado: fechaAgregado ? fechaAgregado.getMonth() : null,
          description: r.description || 'Sin sinopsis disponible en el catálogo.',
          poster: posterUrl
        };
      });

    const rangosConConteo = cfgCat.rangos.map((r) => {
      const count = itemsBase.filter((item) => item.bucketKey === r.key).length;
      return { ...r, count };
    });
    const maxRangoCount = Math.max(...rangosConConteo.map((r) => r.count), 1);

    const conFecha = itemsBase
      .filter((i) => i.fechaAgregado)
      .sort((a, b) => b.fechaAgregado - a.fechaAgregado);

    const porAnioMap = {};
    const porMesMap = {};
    const aniosSet = new Set();

    conFecha.forEach((item) => {
      const y = item.anioAgregado;
      aniosSet.add(y);
      porAnioMap[y] = (porAnioMap[y] || 0) + 1;
      const m = item.mesAgregado;
      porMesMap[m] = (porMesMap[m] || 0) + 1;
    });

    const aniosOrdenados = Array.from(aniosSet).sort((a, b) => a - b);
    const serieAnio = aniosOrdenados.map((y) => ({
      etiqueta: String(y),
      total: porAnioMap[y]
    }));

    let acumuladoHistorico = 0;
    const serieHistorica = aniosOrdenados.map((y) => {
      acumuladoHistorico += porAnioMap[y];
      return {
        etiqueta: String(y),
        total: acumuladoHistorico
      };
    });

    const serieMes = MESES_ES.map((nombreMes, idx) => ({
      etiqueta: nombreMes,
      total: porMesMap[idx] || 0
    }));

    const serieGrafica =
      modoTemporal === 'mes'
        ? serieMes
        : modoTemporal === 'historico'
          ? serieHistorica
          : serieAnio;

    let picoTexto = '';
    if (modoTemporal === 'anio' && serieAnio.length > 0) {
      const pico = [...serieAnio].sort((a, b) => b.total - a.total)[0];
      picoTexto = `${pico.etiqueta}: Año con mayor incorporación de ${catId.toLowerCase()} (${pico.total.toLocaleString()} registros)`;
    } else if (modoTemporal === 'mes') {
      const pico = [...serieMes].sort((a, b) => b.total - a.total)[0];
      picoTexto = `${pico.etiqueta}: Mes con mayor volumen de incorporaciones (${pico.total.toLocaleString()} registros)`;
    } else if (serieHistorica.length > 0) {
      const ultimo = serieHistorica[serieHistorica.length - 1];
      picoTexto = `Acumulado histórico al cierre del registro: ${ultimo.total.toLocaleString()} registros`;
    }

    const ultimoAnioIngreso =
      aniosOrdenados.length > 0
        ? {
            anio: aniosOrdenados[aniosOrdenados.length - 1],
            total: porAnioMap[aniosOrdenados[aniosOrdenados.length - 1]] || 0
          }
        : null;

    const kpiIzquierda = {
      label: 'ÚLTIMO AÑO DE INCORPORACIÓN',
      valor: ultimoAnioIngreso
        ? `${ultimoAnioIngreso.anio} (${ultimoAnioIngreso.total.toLocaleString()})`
        : 'Sin fecha'
    };

    const filtradosExplorador = itemsBase.filter((item) => {
      if (rangoDuracionFiltro !== 'TODAS' && item.bucketKey !== rangoDuracionFiltro) {
        return false;
      }
      if (
        anioIngresoFiltro !== 'TODOS' &&
        String(item.anioAgregado) !== String(anioIngresoFiltro)
      ) {
        return false;
      }
      if (
        busquedaTitulo.trim() !== '' &&
        !String(item.title).toLowerCase().includes(busquedaTitulo.trim().toLowerCase())
      ) {
        return false;
      }
      return true;
    });

    return {
      kpiIzquierda,
      rangosConConteo,
      maxRangoCount,
      serieGrafica,
      picoTexto,
      aniosOrdenados: [...aniosOrdenados].reverse(),
      itemsExplorador: filtradosExplorador.slice(0, 50),
      totalCoincidencias: filtradosExplorador.length
    };
  }, [
    categoriaSeleccionada,
    rawRows,
    modoTemporal,
    rangoDuracionFiltro,
    anioIngresoFiltro,
    busquedaTitulo
  ]);

  const itemActivo =
    tituloSeleccionado ||
    (detalleCategoria && detalleCategoria.itemsExplorador.length > 0
      ? detalleCategoria.itemsExplorador[0]
      : null);

  if (loading) {
    return (
      <div className="p-6 bg-[#121118] min-h-screen w-full text-white flex items-center justify-center">
        Cargando colecciones de Netflix...
      </div>
    );
  }

  return (
    <div className="p-5 lg:p-6 bg-[#121118] min-h-screen w-full text-white font-sans flex flex-col">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#e50914] rounded"></div>
          <h2 className="text-xl font-bold tracking-wide text-white">
            {categoriaSeleccionada
              ? `Colecciones populares: ${categoriaSeleccionada.title}`
              : 'Colecciones populares'}
          </h2>
        </div>

        {categoriaSeleccionada ? (
          <button
            type="button"
            onClick={() => setCategoriaSeleccionada(null)}
            className="bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-lg flex items-center gap-2"
          >
            <span>←</span> Volver a Colecciones
          </button>
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#181722] flex items-center justify-center text-sm border border-slate-700 shadow">
            🎞️
          </div>
        )}
      </div>

      {/* VISTA 1: 6 Tarjetas de Categorías */}
      {!categoriaSeleccionada ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 flex-1 auto-rows-fr">
          {BASE_COLECCIONES.map((col) => (
            <div
              key={col.id}
              onClick={() => abrirCategoria(col)}
              className="relative min-h-[210px] h-full rounded-2xl overflow-hidden bg-[#16151f] border border-red-500/40 shadow-[0_8px_30px_rgb(0,0,0,0.5)] group cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:border-[#e50914] hover:bg-[#e50914]/10"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-55"
                style={{ backgroundImage: `url(${col.bgImage})` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#121118] via-[#121118]/45 to-transparent"></div>

              <div className="relative z-10 p-5 flex flex-col justify-between h-full pointer-events-none">
                <div className="flex justify-between items-start">
                  <span className="text-2xl text-red-500 filter drop-shadow-[0_0_8px_rgba(229,9,20,0.8)]">
                    {col.icon}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-black/60 border border-slate-700/80 flex items-center justify-center text-white shadow-md group-hover:bg-[#e50914] group-hover:border-red-500 transition-all duration-300">
                    →
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black tracking-tight text-white mb-0.5">
                    {col.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Ver análisis de categoría
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VISTA 2: Panel Analítico y Explorador Interactivo de la Categoría Seleccionada */
        detalleCategoria && (
          <div className="space-y-5 flex-1 flex flex-col">
            <div className="relative overflow-hidden rounded-2xl border-2 border-[#ff1e2d] bg-[#0e131a] px-6 py-4 flex items-center justify-between gap-4 shadow-[0_0_24px_rgba(255,30,45,0.22)] shrink-0">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-35"
                style={{ backgroundImage: `url(${categoriaSeleccionada.bgImage})` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#0c1017]/90 via-[#121822]/70 to-[#0c1017]/85"></div>

              <div className="relative z-10 flex flex-col justify-center">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#ff6b6b]">
                  {detalleCategoria.kpiIzquierda.label}
                </p>
                <p className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-0.5 tabular-nums">
                  {detalleCategoria.kpiIzquierda.valor}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1">
              <div className="lg:col-span-6 flex flex-col justify-between gap-5">
                <div className="bg-[#181722] border border-slate-800 rounded-2xl p-5 shadow-xl">
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-white">
                        DISTRIBUCIÓN DE DURACIÓN
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Segmentación de {categoriaSeleccionada.title} según duración
                      </p>
                    </div>
                    {rangoDuracionFiltro !== 'TODAS' && (
                      <button
                        type="button"
                        onClick={() => setRangoDuracionFiltro('TODAS')}
                        className="text-[11px] font-bold text-red-400 hover:underline cursor-pointer"
                      >
                        Limpiar rango ✕
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {detalleCategoria.rangosConConteo.map((rango) => {
                      const pctAncho = Math.max(
                        (rango.count / detalleCategoria.maxRangoCount) * 100,
                        rango.count > 0 ? 6 : 0
                      );
                      const activo = rangoDuracionFiltro === rango.key;
                      return (
                        <div
                          key={rango.key}
                          onClick={() =>
                            setRangoDuracionFiltro(activo ? 'TODAS' : rango.key)
                          }
                          className={`p-2 rounded-xl transition cursor-pointer ${
                            activo
                              ? 'bg-[#e50914]/15 ring-1 ring-[#e50914]'
                              : 'hover:bg-[#e50914]/10 hover:ring-1 hover:ring-[#e50914]/50'
                          }`}
                        >
                          <div className="flex justify-between items-center text-xs mb-1.5">
                            <span className="text-slate-200">{rango.label}</span>
                            <span
                              className={`font-bold tabular-nums ${
                                activo ? 'text-[#e50914]' : 'text-slate-300'
                              }`}
                            >
                              {rango.count.toLocaleString()} registros
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${pctAncho}%`,
                                background: rango.gradient
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-slate-500 text-center mt-3">
                    Haz clic en un rango para filtrar los registros
                  </p>
                </div>

                <div className="bg-[#181722] border border-slate-800 rounded-2xl p-5 shadow-xl flex-1 flex flex-col justify-between">
                  <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-white">
                        INCORPORACIÓN A NETFLIX
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Años en los que se fueron implementando los registros al catálogo
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#121118] p-1 rounded-xl border border-slate-800">
                      {[
                        { id: 'anio', label: 'Por Año' },
                        { id: 'mes', label: 'Por Mes' },
                        { id: 'historico', label: 'Histórico' }
                      ].map((tab) => (
                        <button
                          type="button"
                          key={tab.id}
                          onClick={() => setModoTemporal(tab.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            modoTemporal === tab.id
                              ? 'bg-[#e50914] text-white'
                              : 'text-slate-400 hover:text-white hover:bg-[#e50914]/15'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="w-full h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={detalleCategoria.serieGrafica}
                        margin={{ top: 10, right: 12, left: -15, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="areaAzulGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0.04} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#272634"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="etiqueta"
                          stroke="#94a3b8"
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                        />
                        <YAxis
                          stroke="#94a3b8"
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                        />
                        <Tooltip
                          formatter={(value) => [
                            `${Number(value).toLocaleString()} registros`,
                            'Incorporaciones'
                          ]}
                          contentStyle={{
                            backgroundColor: '#121118',
                            borderColor: '#334155',
                            borderRadius: '10px',
                            color: '#fff',
                            fontSize: '12px'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="#38bdf8"
                          strokeWidth={2.5}
                          fill="url(#areaAzulGrad)"
                          dot={{ r: 3.5, fill: '#38bdf8', strokeWidth: 0 }}
                          activeDot={{ r: 6, fill: '#818cf8' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {detalleCategoria.picoTexto && (
                    <p className="text-xs text-slate-400 text-center mt-2">
                      {detalleCategoria.picoTexto}
                    </p>
                  )}
                </div>
              </div>

              <div className="lg:col-span-6 bg-[#181722] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between h-full">
                <div className="flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white">
                      EXPLORADOR INTERACTIVO DE {categoriaSeleccionada.title.toUpperCase()}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Listado y selector interactivo ({detalleCategoria.totalCoincidencias.toLocaleString()}{' '}
                      coincidencias)
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 mb-4">
                    <input
                      type="text"
                      value={busquedaTitulo}
                      onChange={(e) => setBusquedaTitulo(e.target.value)}
                      placeholder={`Buscar en ${categoriaSeleccionada.title}...`}
                      className="sm:col-span-6 bg-[#121118] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e50914]"
                    />
                    <select
                      value={rangoDuracionFiltro}
                      onChange={(e) => setRangoDuracionFiltro(e.target.value)}
                      className="sm:col-span-3 bg-[#121118] border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#e50914]"
                    >
                      <option value="TODAS">Duración: Todas</option>
                      {detalleCategoria.rangosConConteo.map((r) => (
                        <option key={r.key} value={r.key}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={anioIngresoFiltro}
                      onChange={(e) => setAnioIngresoFiltro(e.target.value)}
                      className="sm:col-span-3 bg-[#121118] border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#e50914]"
                    >
                      <option value="TODOS">Año ingreso: Todos</option>
                      {detalleCategoria.aniosOrdenados.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2.5 flex-1 max-h-[540px] overflow-y-auto pr-1">
                    {detalleCategoria.itemsExplorador.length === 0 ? (
                      <div className="text-center py-10 text-xs text-slate-400">
                        No se encontraron registros con los filtros seleccionados.
                      </div>
                    ) : (
                      detalleCategoria.itemsExplorador.map((item, index) => {
                        const esActivo = itemActivo && itemActivo.id === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => setTituloSeleccionado(item)}
                            className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition cursor-pointer ${
                              esActivo
                                ? 'bg-[#e50914]/15 border-[#e50914] shadow'
                                : 'bg-[#121118]/75 border-slate-800/80 hover:bg-[#e50914]/10 hover:border-[#e50914]/60'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-xs font-bold text-slate-500 w-6 shrink-0">
                                #{index + 1}
                              </span>
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-slate-800">
                                <img
                                  src={item.poster}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-extrabold text-white truncate">
                                  {item.title}
                                </p>
                                <p className="text-[11px] text-slate-400 truncate">
                                  {item.releaseYear} • {item.duration} • Agregado:{' '}
                                  {formatearFechaCorta(item.fechaAgregado)}
                                </p>
                              </div>
                            </div>
                            <span className="text-slate-400 text-xs shrink-0">›</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {itemActivo && (
                  <div className="mt-4 bg-[#121118] border border-slate-800 rounded-xl p-4 flex flex-col justify-center shrink-0">
                    <p className="text-xs text-slate-200">
                      <span className="font-bold text-white">Selección:</span>{' '}
                      {itemActivo.title} ({itemActivo.duration}) • Agregado el{' '}
                      {formatearFechaLarga(itemActivo.fechaAgregado)}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                      {itemActivo.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}