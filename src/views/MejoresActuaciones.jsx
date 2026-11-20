import React, { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';

export default function MejoresActuaciones() {
  const [rawRows, setRawRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('Todos'); // 'Todos' | 'Movie' | 'TV Show'
  const [actorSeleccionado, setActorSeleccionado] = useState(null);

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

  const imagenesKpi = {
    actores:
      'https://mexico.unir.net/wp-content/uploads/sites/6/2022/06/diplomado-actuacion-teatral-portada-desk.png',
    apariciones:
      'https://colorvision.com.do/wp-content/uploads/2021/02/Cine-Republica-Dominicana.jpeg',
    titulos: 'https://significado.com/wp-content/uploads/actuacion.jpg'
  };

  const perfilesTrayectoria = {
    'Anupam Kher': {
      nacimiento: '17 de marzo de 1955',
      inicioCarrera: '1982',
      trayectoria:
        'Reconocido actor y director indio con cientos de participaciones en cine hindi e internacional, destacado por su versatilidad entre el drama, la comedia y el cine de autor.',
      foto: 'https://filmfare.wwmindia.com/content/2021/jan/anupamkher101612094918.jpg'
    },
    'Shah Rukh Khan': {
      nacimiento: '12 de noviembre de 1965',
      inicioCarrera: '1988',
      trayectoria:
        'Una de las figuras más emblemáticas del cine mundial y Bollywood, célebre por sus papeles románticos, dramáticos y de acción de alto alcance global.',
      foto: 'https://c.saavncdn.com/artists/Shah_Rukh_Khan_500x500.jpg'
    },
    'Naseeruddin Shah': {
      nacimiento: '20 de julio de 1950',
      inicioCarrera: '1975',
      trayectoria:
        'Aclamado actor y director teatral y cinematográfico con amplia trayectoria en el cine paralelo y comercial, multipremiado por sus interpretaciones de carácter.',
      foto: 'https://www.tbsnews.net/sites/default/files/styles/big_2/public/images/2023/09/12/untitled-design-3_pm24_0_0.jpg'
    },
    'Akshay Kumar': {
      nacimiento: '19 de septiembre de 1967',
      inicioCarrera: '1991',
      trayectoria:
        'Actor y productor prolífico conocido por su ritmo constante de estrenos, artes marciales, comedia y dramas sociales.',
      foto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0bgDZfVfgLtkbVLC5rY9zAN20uLyiHakE-IVnc6EU7CuQxE1FxqDy3zc&s=10'
    },
    'Om Puri': {
      nacimiento: '18 de octubre de 1950',
      inicioCarrera: '1976',
      trayectoria:
        'Destacado intérprete con presencia tanto en producciones de la India como en cine británico y hollywoodense, recordado por su profundidad dramática.',
      foto: 'https://ntvb.tmsimg.com/assets/assets/72503_v9_bb.jpg'
    },
    'Paresh Rawal': {
      nacimiento: '30 de mayo de 1955',
      inicioCarrera: '1984',
      trayectoria:
        'Legendario actor de carácter en Bollywood, galardonado múltiples veces por sus icónicos papeles cómicos y antagónicos.',
      foto: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/paresh-rawal-1644-13-09-2017-03-44-45.jpg'
    },
    'Boman Irani': {
      nacimiento: '2 de diciembre de 1959',
      inicioCarrera: '2001',
      trayectoria:
        'Actor, fotógrafo y locutor indio conocido por sus memorables papeles secundarios y cómicos en grandes éxitos del cine.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Boman_Irani.jpg?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=original'
    },
    'Amitabh Bachchan': {
      nacimiento: '11 de octubre de 1942',
      inicioCarrera: '1969',
      trayectoria:
        'Considerado uno de los actores más influyentes en la historia del cine indio, con una trayectoria de más de cinco décadas.',
      foto: 'https://ntvb.tmsimg.com/assets/assets/4153_v9_bc.jpg'
    },
    Kajol: {
      nacimiento: '5 de agosto de 1974',
      inicioCarrera: '1992',
      trayectoria:
        'Una de las actrices más exitosas y aclamadas de la industria cinematográfica india, célebre por sus actuaciones en películas románticas y dramáticas.',
      foto: 'https://m.media-amazon.com/images/M/MV5BMjIwMjQ5MTQ4N15BMl5BanBnXkFtZTgwOTIyMDU0OTE@._V1_FMjpg_UX1000_.jpg'
    },
    'Ajay Devgn': {
      nacimiento: '2 de abril de 1969',
      inicioCarrera: '1991',
      trayectoria:
        'Destacado actor, director y productor indio, reconocido por sus intensas interpretaciones en películas de acción y drama.',
      foto: 'https://in.bmscdn.com/iedb/artist/images/website/poster/large/ajay-devgn-24051-12-09-2017-04-41-13.jpg'
    },
    'Rupa Ganguly': {
      nacimiento: '25 de noviembre de 1966',
      inicioCarrera: '1986',
      trayectoria:
        'Actriz y cantante india reconocida por su trabajo en el cine bengalí e hindi, así como por su participación en dramas televisivos históricos.',
      foto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhaGbYy_Y09SVrGVQUupeJ6DHhGqxA5Q-M-xkGhZ_PIAx_sHBr2oeOdkw&s=10'
    },
    'Gulshan Grover': {
      nacimiento: '21 de septiembre de 1955',
      inicioCarrera: '1980',
      trayectoria:
        'Actor veterano con más de 400 películas en su haber, célebre en Bollywood y el cine internacional por sus papeles antagónicos.',
      foto: 'https://resizing.flixster.com/RJKOCDhkCHp99p8UiFp5S18Mkek=/218x280/v2/https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/74401_v9_ba.jpg'
    },
    'Kareena Kapoor': {
      nacimiento: '21 de septiembre de 1980',
      inicioCarrera: '2000',
      trayectoria:
        'Reconocida estrella del cine hindi ganadora de múltiples premios Filmfare, destacada tanto en comedias románticas como en dramas contemporáneos.',
      foto: 'https://media.themoviedb.org/t/p/w235_and_h235_face/kp9xnwDALUt6nuPBGuJHlvnxGnM.jpg'
    },
    'Mithun Chakraborty': {
      nacimiento: '16 de junio de 1950',
      inicioCarrera: '1976',
      trayectoria:
        'Actor y productor emblemático del cine indio con cientos de películas en hindi y bengalí.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mithun_Chakraborty_at_IFFI_2017.jpg/440px-Mithun_Chakraborty_at_IFFI_2017.jpg'
    },
    'Jackie Shroff': {
      nacimiento: '1 de febrero de 1957',
      inicioCarrera: '1982',
      trayectoria:
        'Veterano actor de cine hindi con más de doscientas películas en drama, acción y comedia.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Jackie_Shroff_at_the_special_screening_of_Pad_Man.jpg/440px-Jackie_Shroff_at_the_special_screening_of_Pad_Man.jpg'
    },
    'Amrish Puri': {
      nacimiento: '22 de junio de 1932',
      inicioCarrera: '1971',
      trayectoria:
        'Uno de los intérpretes más recordados del cine indio y de producciones internacionales por su presencia escénica.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amrish_Puri_in_1990s.jpg/440px-Amrish_Puri_in_1990s.jpg'
    },
    'Salman Khan': {
      nacimiento: '27 de diciembre de 1965',
      inicioCarrera: '1988',
      trayectoria:
        'Actor y productor de enorme popularidad en el cine comercial indio, protagonista de éxitos de taquilla.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Salman_Khan_at_Berlin_Film_Festival_2018.jpg/440px-Salman_Khan_at_Berlin_Film_Festival_2018.jpg'
    },
    'Irrfan Khan': {
      nacimiento: '17 de enero de 1967',
      inicioCarrera: '1987',
      trayectoria:
        'Aclamado actor indio de proyección internacional, célebre por sus interpretaciones contenidas y profundas.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Irrfan_Khan_at_Piku_promotions.jpg/440px-Irrfan_Khan_at_Piku_promotions.jpg'
    },
    'Aamir Khan': {
      nacimiento: '14 de marzo de 1965',
      inicioCarrera: '1984',
      trayectoria:
        'Actor, director y productor reconocido por su enfoque selectivo en guiones de alto impacto social y comercial.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Aamir_Khan_at_the_launch_of_Laal_Singh_Chaddha.jpg/440px-Aamir_Khan_at_the_launch_of_Laal_Singh_Chaddha.jpg'
    },
    'Saif Ali Khan': {
      nacimiento: '16 de agosto de 1970',
      inicioCarrera: '1993',
      trayectoria:
        'Actor y productor indio destacado en comedias, thrillers y dramas contemporáneos.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Saif_Ali_Khan_at_the_special_screening_of_Pad_Man.jpg/440px-Saif_Ali_Khan_at_the_special_screening_of_Pad_Man.jpg'
    },
    'Madhuri Dixit': {
      nacimiento: '15 de mayo de 1967',
      inicioCarrera: '1984',
      trayectoria:
        'Icónica actriz y bailarina del cine hindi con decenas de películas y participaciones televisivas.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Madhuri_Dixit_at_the_special_screening_of_Pad_Man.jpg/440px-Madhuri_Dixit_at_the_special_screening_of_Pad_Man.jpg'
    },
    Tabu: {
      nacimiento: '4 de noviembre de 1971',
      inicioCarrera: '1985',
      trayectoria:
        'Multipremiada actriz india elogiada por su versatilidad en cine de autor y comercial.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Tabu_at_the_special_screening_of_Pad_Man.jpg/440px-Tabu_at_the_special_screening_of_Pad_Man.jpg'
    },
    'Nawazuddin Siddiqui': {
      nacimiento: '19 de mayo de 1974',
      inicioCarrera: '1999',
      trayectoria:
        'Actor indio reconocido por su naturalismo y personajes complejos en cine y series.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Nawazuddin_Siddiqui_at_the_special_screening_of_Pad_Man.jpg/440px-Nawazuddin_Siddiqui_at_the_special_screening_of_Pad_Man.jpg'
    },
    'Takahiro Sakurai': {
      nacimiento: '13 de junio de 1974',
      inicioCarrera: '1996',
      trayectoria:
        'Prolífico actor de voz japonés reconocido mundialmente por interpretar protagonistas en series de anime y producciones animadas de gran éxito.',
      foto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ83nwurOvLv6HfU2Sc-7uxfVYa7f9Jq1W-dhDepaJTAf5Ed6m30X9O9SQ&s=10'
    },
    'Yuki Kaji': {
      nacimiento: '13 de septiembre de 1985',
      inicioCarrera: '2004',
      trayectoria:
        'Galardonado actor de voz y cantante japonés, célebre por dar vida a personajes emblemáticos en series de acción, fantasía y drama.',
      foto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQq3vsMoGitp8_3Fu3fIrHfllTzEZVFzbB90gzDJKvtPd3_Lbx7JsoNgVMB&s=10'
    },
    'Junichi Suwabe': {
      nacimiento: '29 de marzo de 1972',
      inicioCarrera: '1995',
      trayectoria:
        'Destacado seiyū y narrador japonés con una amplia trayectoria en series animadas, videojuegos y programas televisivos.',
      foto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKQVX6Rz6bM45hXnp5pDqwWiD9LKYdBEbIpxBxZHhVWQ&s=10'
    },
    'Ai Kayano': {
      nacimiento: '13 de septiembre de 1987',
      inicioCarrera: '2010',
      trayectoria:
        'Reconocida actriz de voz japonesa con decenas de roles principales en series de drama, romance y fantasía dentro del catálogo.',
      foto: 'https://m.media-amazon.com/images/M/MV5BYWQyNTNmMTItNTY4NC00M2JhLWEwNjItMDkyZDA1OTlhZjg5XkEyXkFqcGc@._V1_.jpg'
    },
    'David Attenborough': {
      nacimiento: '8 de mayo de 1926',
      inicioCarrera: '1952',
      trayectoria:
        'Legendario divulgador científico, escritor y narrador británico, referente mundial de las series documentales sobre naturaleza y vida salvaje.',
      foto: 'https://cdn.britannica.com/30/253530-050-8F2376E9/David-Attenborough-Woodbury-Wetlands-2016.jpg'
    },
    'Ashleigh Ball': {
      nacimiento: '31 de marzo de 1983',
      inicioCarrera: '2005',
      trayectoria:
        'Actriz de voz y música canadiense muy activa en series animadas infantiles y familiares de alcance internacional.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Ashleigh_Ball_2014.jpg/440px-Ashleigh_Ball_2014.jpg'
    },
    'Andrea Libman': {
      nacimiento: '19 de julio de 1984',
      inicioCarrera: '1989',
      trayectoria:
        'Actriz canadiense con amplia trayectoria en televisión y doblaje de series animadas desde temprana edad.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Andrea_Libman_2014.jpg/440px-Andrea_Libman_2014.jpg'
    },
    'Vincent Tong': {
      nacimiento: '2 de mayo de 1980',
      inicioCarrera: '2004',
      trayectoria:
        'Actor de voz canadiense conocido por su participación constante en series de animación y aventuras para televisión.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Vincent_Tong_2015.jpg/440px-Vincent_Tong_2015.jpg'
    },
    'Daisuke Ono': {
      nacimiento: '4 de mayo de 1978',
      inicioCarrera: '2001',
      trayectoria:
        'Multipremiado actor de voz japonés con extensa presencia en series de acción, misterio y ciencia ficción.',
      foto: 'https://www.animenewsnetwork.com/images/encyc/P14929-1221532563.1413189991.jpg'
    },
    'Yuichi Nakamura': {
      nacimiento: '20 de febrero de 1980',
      inicioCarrera: '2001',
      trayectoria:
        'Actor de voz y narrador japonés reconocido por interpretar personajes principales en numerosas series animadas populares.',
      foto: 'https://image.tmdb.org/t/p/original/tGGJ20ySSHTKcinLuX5bkVOK6Ny.jpg'
    },
    'Julie Tejwani': {
      nacimiento: '18 de noviembre de 1980',
      inicioCarrera: '1990',
      trayectoria:
        'Actriz de doblaje y locutora india con amplia trayectoria dando voz a personajes en series animadas y producciones infantiles.',
      foto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlgv7liFYbUPRIatET9VV9nA_oYhZPnsXN05cBRmTOf7m4kYEAp8AsLnlo&s=10'
    },
    'Rupa Bhimani': {
      nacimiento: 'Dato no especificado',
      inicioCarrera: '1990',
      trayectoria:
        'Actriz de doblaje y voz india reconocida por su participación constante en series animadas y adaptaciones internacionales.',
      foto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSON4zO4WP88DQb_lTekRUH-5D6dNzFaCaLMZZjn4NK8wGWRHQMQY52NeR5&s=10'
    },
    'Jun Fukuyama': {
      nacimiento: '26 de noviembre de 1978',
      inicioCarrera: '1997',
      trayectoria:
        'Reconocido actor de voz y cantante japonés, célebre por sus papeles protagónicos en numerosas series de anime.',
      foto: 'https://peliculas.lavanguardia.com/imagenes/h632/eT9eloyIaIkTvTqMmpcsAleP2hM.jpg'
    },
    'Yoshimasa Hosoya': {
      nacimiento: '10 de febrero de 1982',
      inicioCarrera: '2005',
      trayectoria:
        'Destacado actor de voz japonés con extensa participación en series de drama, deportes y fantasía.',
      foto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdispwFjRctBIqhsbyj8M6mVym_8szk78UTMLG7PRF5dXYCyVxhMTV__Fn&s=10'
    },
    'Yoshitsugu Matsuoka': {
      nacimiento: '17 de septiembre de 1986',
      inicioCarrera: '2009',
      trayectoria:
        'Prolífico actor de voz japonés conocido por dar vida a personajes principales en series animadas de gran popularidad.',
      foto: 'https://www.handthatfeedshq.com/wp-content/uploads/2020/06/yoshitsugu-matsuoka-1.jpg'
    },
    'Kenjiro Tsuda': {
      nacimiento: '11 de junio de 1971',
      inicioCarrera: '1995',
      trayectoria:
        'Actor de voz y actor japonés reconocido por su timbre grave en series animadas y dramas.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Kenjiro_Tsuda_2019.jpg/440px-Kenjiro_Tsuda_2019.jpg'
    },
    'Kana Hanazawa': {
      nacimiento: '25 de febrero de 1989',
      inicioCarrera: '2003',
      trayectoria:
        'Actriz de voz y cantante japonesa con una amplísima participación en series de animación.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Kana_Hanazawa_at_Anime_Expo_2018.jpg/440px-Kana_Hanazawa_at_Anime_Expo_2018.jpg'
    },
    'Mamoru Miyano': {
      nacimiento: '8 de junio de 1983',
      inicioCarrera: '2001',
      trayectoria:
        'Actor de voz, cantante y actor japonés destacado en series animadas de gran audiencia.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Mamoru_Miyano_2019.jpg/440px-Mamoru_Miyano_2019.jpg'
    },
    'Tomokazu Sugita': {
      nacimiento: '11 de octubre de 1980',
      inicioCarrera: '1999',
      trayectoria:
        'Actor de voz japonés conocido por su versatilidad en comedia, drama y acción en series.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Tomokazu_Sugita_2018.jpg/440px-Tomokazu_Sugita_2018.jpg'
    },
    'Hiroshi Kamiya': {
      nacimiento: '28 de enero de 1975',
      inicioCarrera: '1994',
      trayectoria:
        'Reconocido actor de voz japonés con decenas de papeles protagónicos y secundarios en series.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Hiroshi_Kamiya_2018.jpg/440px-Hiroshi_Kamiya_2018.jpg'
    },
    'Nana Mizuki': {
      nacimiento: '21 de enero de 1980',
      inicioCarrera: '1997',
      trayectoria:
        'Actriz de voz y cantante japonesa con destacada trayectoria en series y espectáculos musicales.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Nana_Mizuki_at_Anime_Expo_2018.jpg/440px-Nana_Mizuki_at_Anime_Expo_2018.jpg'
    },
    'Rie Kugimiya': {
      nacimiento: '30 de mayo de 1979',
      inicioCarrera: '1998',
      trayectoria:
        'Actriz de voz japonesa célebre por múltiples personajes populares en series animadas.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Rie_Kugimiya_2018.jpg/440px-Rie_Kugimiya_2018.jpg'
    },
    'Samuel L. Jackson': {
      nacimiento: '21 de diciembre de 1948',
      inicioCarrera: '1972',
      trayectoria:
        'Actor y productor estadounidense de extensa filmografía y presencia en series y producciones globales.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/SamuelLJackson.jpg/440px-SamuelLJackson.jpg'
    },
    'Bryan Cranston': {
      nacimiento: '17 de marzo de 1956',
      inicioCarrera: '1980',
      trayectoria:
        'Actor, director y productor estadounidense multipremiado por su trabajo en televisión y cine.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Bryan_Cranston_by_Gage_Skidmore.jpg/440px-Bryan_Cranston_by_Gage_Skidmore.jpg'
    },
    'Aaron Paul': {
      nacimiento: '27 de agosto de 1979',
      inicioCarrera: '1999',
      trayectoria:
        'Actor estadounidense reconocido por sus papeles dramáticos en series de televisión.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Aaron_Paul_by_Gage_Skidmore.jpg/440px-Aaron_Paul_by_Gage_Skidmore.jpg'
    }
  }; //[cite: 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]

  const fotosRespaldo = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop'
  ];

  const estilosMedalla = {
    1: {
      etiqueta: 'ORO #1',
      cardBg: 'bg-gradient-to-b from-[#2a210d] via-[#1f1a14] to-[#181722]',
      border: 'border-2 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.28)]',
      ring: 'ring-4 ring-amber-400/50 border-2 border-amber-300',
      badge: 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-slate-950 shadow-md',
      accentText: 'text-amber-300',
      glow: 'bg-amber-400/20'
    },
    2: {
      etiqueta: 'PLATA #2',
      cardBg: 'bg-gradient-to-b from-[#272b33] via-[#1b1d24] to-[#181722]',
      border: 'border-2 border-slate-300 shadow-[0_0_22px_rgba(203,213,225,0.22)]',
      ring: 'ring-4 ring-slate-300/45 border-2 border-slate-200',
      badge: 'bg-gradient-to-r from-slate-100 via-slate-300 to-slate-400 text-slate-950 shadow-md',
      accentText: 'text-slate-200',
      glow: 'bg-slate-300/15'
    },
    3: {
      etiqueta: 'BRONCE #3',
      cardBg: 'bg-gradient-to-b from-[#301e14] via-[#211816] to-[#181722]',
      border: 'border-2 border-amber-600 shadow-[0_0_22px_rgba(217,119,6,0.25)]',
      ring: 'ring-4 ring-amber-600/45 border-2 border-orange-400',
      badge: 'bg-gradient-to-r from-orange-300 via-amber-600 to-orange-700 text-white shadow-md',
      accentText: 'text-orange-300',
      glow: 'bg-orange-500/15'
    }
  };

  const analisisActores = useMemo(() => {
    const titulosVistos = new Set();

    const filasFiltradas = rawRows.filter((row) => {
      if (!row || !row.cast || !row.title) return false;
      const castLimpio = String(row.cast).trim();
      const tituloLimpio = String(row.title).trim();
      if (!castLimpio || !tituloLimpio) return false;

      const tipoFila = row.type ? String(row.type).trim() : '';
      if (filtroTipo !== 'Todos' && tipoFila !== filtroTipo) return false;

      const claveTitulo = `${tipoFila}::${tituloLimpio.toLowerCase()}`;
      if (titulosVistos.has(claveTitulo)) return false;
      titulosVistos.add(claveTitulo);
      return true;
    });

    const mapaActores = new Map();

    filasFiltradas.forEach((row) => {
      const tituloLimpio = String(row.title).trim();
      const tipoFila = row.type ? String(row.type).trim() : 'Título';

      const actoresUnicosEnFila = Array.from(
        new Set(
          String(row.cast)
            .split(',')
            .map((nombre) => nombre.replace(/\s+/g, ' ').trim())
            .filter(Boolean)
        )
      );

      actoresUnicosEnFila.forEach((actor) => {
        if (!mapaActores.has(actor)) {
          mapaActores.set(actor, {
            nombre: actor,
            apariciones: 0,
            peliculasCount: 0,
            seriesCount: 0,
            titulos: [],
            titulosSet: new Set()
          });
        }

        const entry = mapaActores.get(actor);
        const claveActorTitulo = `${tipoFila}::${tituloLimpio.toLowerCase()}`;
        if (entry.titulosSet.has(claveActorTitulo)) return;

        entry.titulosSet.add(claveActorTitulo);
        entry.apariciones += 1;
        if (tipoFila === 'Movie') entry.peliculasCount += 1;
        if (tipoFila === 'TV Show') entry.seriesCount += 1;

        entry.titulos.push({
          title: tituloLimpio,
          type: tipoFila,
          releaseYear: row.release_year ? String(row.release_year).trim() : 'N/D',
          listedIn: row.listed_in ? String(row.listed_in).trim() : 'General',
          description: row.description
            ? String(row.description).trim()
            : 'Sin descripción disponible en el catálogo.'
        });
      });
    });

    const listaActores = Array.from(mapaActores.values());
    const totalAparicionesExactas = listaActores.reduce(
      (acum, actor) => acum + actor.apariciones,
      0
    );

    const rankingOrdenado = listaActores
      .sort(
        (a, b) =>
          b.apariciones - a.apariciones ||
          b.peliculasCount + b.seriesCount - (a.peliculasCount + a.seriesCount) ||
          a.nombre.localeCompare(b.nombre)
      )
      .map((actor, idx) => {
        const extra = perfilesTrayectoria[actor.nombre];
        const aniosActivos = actor.titulos
          .map((t) => Number(t.releaseYear))
          .filter((y) => !Number.isNaN(y) && y > 0);
        const anioMasAntiguo = aniosActivos.length ? Math.min(...aniosActivos) : 2000;

        return {
          nombre: actor.nombre,
          apariciones: actor.apariciones,
          peliculasCount: actor.peliculasCount,
          seriesCount: actor.seriesCount,
          titulos: actor.titulos,
          rank: idx + 1,
          foto: extra?.foto || fotosRespaldo[idx % fotosRespaldo.length],
          nacimiento: extra?.nacimiento || 'Dato no especificado en catálogo',
          inicioCarrera: extra?.inicioCarrera || `${anioMasAntiguo} (reg. en catálogo)`,
          trayectoria:
            extra?.trayectoria ||
            `Intérprete con ${actor.apariciones} ${
              actor.apariciones === 1 ? 'participación registrada' : 'participaciones registradas'
            } en el catálogo seleccionado, abarcando producciones desde ${anioMasAntiguo}.`,
          destacados: actor.titulos.slice(0, 4)
        };
      });

    return {
      totalActores: listaActores.length,
      totalApariciones: totalAparicionesExactas,
      totalTitulosConReparto: filasFiltradas.length,
      top10: rankingOrdenado.slice(0, 10),
      maxApariciones: rankingOrdenado[0]?.apariciones || 1
    };
  }, [rawRows, filtroTipo]);

  if (loading) {
    return (
      <div className="p-8 bg-[#121118] min-h-screen text-white flex items-center justify-center">
        Cargando mejores actuaciones...
      </div>
    );
  }

  const podioOrdenado = [
    analisisActores.top10[1],
    analisisActores.top10[0],
    analisisActores.top10[2]
  ].filter(Boolean);

  const restoRanking = analisisActores.top10.slice(3, 10);

  return (
    <div className="p-8 bg-[#121118] min-h-screen text-white font-sans overflow-y-auto">
      {/* Encabezado limpio */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#e50914] rounded"></div>
          <h2 className="text-xl font-bold tracking-wide text-white">Mejores actuaciones</h2>
        </div>

        {/* Filtro Todos / Películas / Series */}
        <div className="flex bg-[#181722] p-1.5 rounded-2xl border border-slate-700/80 text-xs font-bold shadow-lg self-start sm:self-auto">
          {[
            { key: 'Todos', label: 'Todos' },
            { key: 'Movie', label: 'Películas' },
            { key: 'TV Show', label: 'Series' }
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => {
                setFiltroTipo(btn.key);
                setActorSeleccionado(null);
              }}
              className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                filtroTipo === btn.key
                  ? 'bg-[#e50914] text-white shadow-[0_0_12px_rgba(229,9,20,0.45)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3 KPIs con imagen de fondo y orillas rojas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="relative overflow-hidden bg-[#181722] border-2 border-[#e50914] p-5 rounded-2xl shadow-[0_0_18px_rgba(229,9,20,0.18)]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url('${imagenesKpi.actores}')` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#121118]/90 via-[#181722]/80 to-[#121118]/85"></div>
          <div className="relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-red-300 mb-1">
              Total de actores
            </p>
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-3xl font-black text-white tabular-nums">
                {analisisActores.totalActores.toLocaleString()}
              </p>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#e50914]/25 text-red-200 border border-[#e50914]/60">
                Elenco único
              </span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-[#181722] border-2 border-[#e50914] p-5 rounded-2xl shadow-[0_0_18px_rgba(229,9,20,0.18)]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url('${imagenesKpi.apariciones}')` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#121118]/90 via-[#181722]/80 to-[#121118]/85"></div>
          <div className="relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-red-300 mb-1">
              Apariciones totales
            </p>
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-3xl font-black text-white tabular-nums">
                {analisisActores.totalApariciones.toLocaleString()}
              </p>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#e50914]/25 text-red-200 border border-[#e50914]/60">
                Participaciones
              </span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-[#181722] border-2 border-[#e50914] p-5 rounded-2xl shadow-[0_0_18px_rgba(229,9,20,0.18)]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url('${imagenesKpi.titulos}')` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#121118]/90 via-[#181722]/80 to-[#121118]/85"></div>
          <div className="relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-red-300 mb-1">
              Total de títulos
            </p>
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-3xl font-black text-white tabular-nums">
                {analisisActores.totalTitulosConReparto.toLocaleString()}
              </p>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#e50914]/25 text-red-200 border border-[#e50914]/60">
                Con reparto
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PODIO DECORADO: ORO (#1), PLATA (#2) Y BRONCE (#3) */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-extrabold tracking-wide text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#e50914]"></span>
            Top 3 Actores • Oro, Plata y Bronce ({filtroTipo})
          </h3>
          <span className="text-xs text-slate-400">
            Selecciona cualquiera para ver su ficha completa
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {podioOrdenado.map((actor) => {
            const estilo = estilosMedalla[actor.rank];
            const esOro = actor.rank === 1;

            return (
              <div
                key={actor.nombre}
                onClick={() => setActorSeleccionado(actor)}
                className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-300 cursor-pointer hover:-translate-y-1.5 ${estilo.cardBg} ${estilo.border} ${esOro ? 'md:py-8' : ''}`}
              >
                <div
                  className={`absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-2xl pointer-events-none ${estilo.glow}`}
                ></div>

                <div className="flex justify-center mb-4 relative z-10">
                  <span
                    className={`text-[11px] font-black tracking-widest uppercase px-4 py-1 rounded-full ${estilo.badge}`}
                  >
                    {estilo.etiqueta}
                  </span>
                </div>

                <div className="flex justify-center mb-4 relative z-10">
                  <div className={`rounded-full p-1 ${estilo.ring}`}>
                    <img
                      src={actor.foto}
                      alt={actor.nombre}
                      onError={(e) => {
                        e.currentTarget.src =
                          fotosRespaldo[actor.rank % fotosRespaldo.length];
                      }}
                      className={`${
                        esOro ? 'w-24 h-24' : 'w-20 h-20'
                      } rounded-full object-cover`}
                    />
                  </div>
                </div>

                <div className="text-center space-y-1.5 relative z-10">
                  <h4 className="text-lg font-black text-white truncate">{actor.nombre}</h4>
                  <p className={`text-sm font-extrabold ${estilo.accentText}`}>
                    {actor.apariciones} apariciones
                  </p>
                  <p className="text-[11px] text-slate-300">
                    {actor.peliculasCount} películas • {actor.seriesCount} series
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 text-center relative z-10">
                  <span className={`text-xs font-bold ${estilo.accentText}`}>
                    Ver trayectoria y filmografía
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PUESTOS DEL #4 AL #10 */}
      <div className="bg-[#181722] border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">Clasificación #4 al #10</h3>
          <span className="text-xs text-slate-400">
            Haz clic en un actor para abrir su perfil
          </span>
        </div>

        <div className="space-y-3">
          {restoRanking.map((actor) => {
            const anchoBarra = Math.max(
              Math.round((actor.apariciones / analisisActores.maxApariciones) * 100),
              14
            );

            return (
              <div
                key={actor.nombre}
                onClick={() => setActorSeleccionado(actor)}
                className="p-3.5 rounded-2xl bg-[#1e1d28]/70 border border-slate-800 hover:border-[#e50914]/70 hover:bg-[#232130] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <span className="w-8 h-8 rounded-xl bg-[#121118] border border-slate-700 flex items-center justify-center text-xs font-black text-slate-300 shrink-0">
                    #{actor.rank}
                  </span>
                  <img
                    src={actor.foto}
                    alt={actor.nombre}
                    onError={(e) => {
                      e.currentTarget.src =
                        fotosRespaldo[actor.rank % fotosRespaldo.length];
                    }}
                    className="w-11 h-11 rounded-full object-cover border-2 border-slate-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{actor.nombre}</p>
                    <p className="text-[11px] text-slate-400">
                      {actor.peliculasCount} películas • {actor.seriesCount} series
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:w-64 shrink-0">
                  <div className="flex-1 bg-[#121118] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#e50914] to-[#ea580c]"
                      style={{ width: `${anchoBarra}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-extrabold text-[#ea580c] whitespace-nowrap">
                    {actor.apariciones} títulos
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL DESPLEGABLE AL SELECCIONAR CUALQUIER ACTOR */}
      {actorSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#181722] border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setActorSeleccionado(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#121118] border border-slate-700 text-white text-xs font-bold hover:bg-[#e50914] transition cursor-pointer"
            >
              ✕
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pr-8">
              <div
                className={`rounded-full p-1 shrink-0 ${
                  estilosMedalla[actorSeleccionado.rank]?.ring ||
                  'ring-4 ring-[#e50914]/40 border-2 border-[#e50914]'
                }`}
              >
                <img
                  src={actorSeleccionado.foto}
                  alt={actorSeleccionado.nombre}
                  onError={(e) => {
                    e.currentTarget.src =
                      fotosRespaldo[actorSeleccionado.rank % fotosRespaldo.length];
                  }}
                  className="w-24 h-24 rounded-full object-cover"
                />
              </div>

              <div className="space-y-1.5">
                <span
                  className={`text-[11px] font-black uppercase px-3 py-0.5 rounded-full inline-block ${
                    estilosMedalla[actorSeleccionado.rank]?.badge ||
                    'bg-[#e50914] text-white'
                  }`}
                >
                  {estilosMedalla[actorSeleccionado.rank]?.etiqueta ||
                    `Ranking #${actorSeleccionado.rank}`}
                </span>
                <h3 className="text-2xl font-black text-white">{actorSeleccionado.nombre}</h3>
                <p className="text-xs text-slate-300">
                  <strong className="text-slate-400">Fecha de nacimiento:</strong>{' '}
                  {actorSeleccionado.nacimiento}
                </p>
                <p className="text-xs text-slate-300">
                  <strong className="text-slate-400">Inicio de carrera:</strong>{' '}
                  {actorSeleccionado.inicioCarrera}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Trayectoria
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#121118] p-4 rounded-2xl border border-slate-800">
                {actorSeleccionado.trayectoria}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2.5">
                Destacados en el catálogo
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {actorSeleccionado.destacados.map((item, i) => (
                  <div
                    key={`${item.title}-${i}`}
                    className="bg-[#121118] border border-slate-800 hover:border-amber-400/50 p-3.5 rounded-2xl transition"
                  >
                    <p className="text-xs font-extrabold text-white truncate">{item.title}</p>
                    <p className="text-[10px] text-amber-300/90 mt-0.5">
                      {item.type} • {item.releaseYear}
                    </p>
                    <p className="text-[11px] text-slate-300 mt-1.5 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Filmografía / Títulos ({actorSeleccionado.titulos.length})
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {actorSeleccionado.titulos.map((t, i) => (
                  <div
                    key={`${t.title}-${i}`}
                    className="flex items-center justify-between gap-3 bg-[#121118] px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs"
                  >
                    <span className="font-semibold text-white truncate">{t.title}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {t.type === 'Movie' ? 'Película' : 'Serie'} • {t.releaseYear}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}