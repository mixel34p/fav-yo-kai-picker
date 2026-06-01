/** Hardcoded Yo-kai Watch special groups (not stored as tribe in Supabase). */

export const CATEGORY_FAVORITES = [
  {
    id: 'category-legendary',
    label: 'Favorite Legendary',
    category: 'legendary',
    color: '#C9A227',
  },
  {
    id: 'category-classic',
    label: 'Favorite Classic',
    category: 'classic',
    color: '#8B1E2D',
  },
  {
    id: 'category-merican',
    label: "Favorite 'Merican",
    category: 'merican',
    color: '#1E4FA3',
  },
];

/**
 * Añade nombres tal como aparecen en la base de datos (inglés o español).
 * También valen formas base: "Shogunyan" incluye "Shogunyan Cristalizado".
 */
const LEGENDARY_NAMES = [
  'Shogunyan',
  'Komasura',
  'Dandiniche',
  'Abuflorido',
  'Dorantúo',
  'Chafarina',
  'Repeloso',
  'Octosierpe',
  'Re-Q-Pera',
  'Divamarina',
  'Todobelicoso',
  'Pregundragón Rey',
];

const CLASSIC_NAMES = [
  'Apéstula',
  'Aracne',
  'Aracnio',
  'Atiterrador',
  'Aterrahorror',
  'Aviguito Pío',
  'Bóvida',
  'Chancleto',
  'Chíclope',
  'Chupatinas',
  'Chupatodo',
  'Cimbalina',
  'Cisnia',
  'Dex Cápito',
  'Eleganfibio',
  'Equinio',
  'Flequipilante',
  'Frikigarto',
  'Frustrolillo',
  'Gran Nomi',
  'Isotomas',
  'Joyezno',
  'Kappafalso',
  'Kappamalo',
  'Kimera',
  'Kimerreal',
  'Kyryn',
  'Masculloso',
  'Nébula',
  'Nereida',
  'Niebli',
  'Nomi',
  'Ocejno',
  'Oceánida',
  'Peluco',
  'Pillastre',
  'Saporientador',
  'Segadora',
  'Sincara',
  'Sirenia',
  'Sombrillo',
  'Sombrillogro',
  'Sombrío',
  'Sustóleo',
  'Tenguriginal',
  'Tigrapa',
  'Toragorero',
  'Torivinador',
  'Torivino',
  'Tornalmohado',
  'Unikyryn',
  'Vociferio',
  'Ángel Garudián'
];

const MERICAN_NAMES = [
  "Usapyon",           // Usapyon
  "Usapyon B",  
  "Bola Blanda",       // Goofball
  "Bateadós",          // Slugger
  "Barbacoo",          // BBQvil
  "Globonauta",        // Hot Air Buffoon
  "Shurikenny",        // Shurikenny
  "Nunchucky",         // Nunchucky
  "Cremallero",        // Zip Unlock
  "Cachocarne",        // Chicken Chukket
  "Mazorco",           // Cornfused
  "Cascarito",         // Unshelltered
  "Fiestuki",          // House Partay
  "Calaveroscopio",    // Skulleidoscope
  "Leongüista",        // Lionguist
  "Jipigenio",         // Imagenius
  "Miss Teria",        // Miss Teri
  "Renaldo",           // Squandeer
  "Coneagente",        // Agent Spect-hare
  "Blancacone",        // Snow Spect-hare
  "Prudencio",         // Oh Wheel
  "Grafilcebú",        // Roughgraff
  "Chocovaca",         // Chilled Cowcao
  "Vacaloca",          // Stircrazy Stu
  "Máster Chof",       // Oh Bah Gah!
  "Monte Merario",     // Speedemountain
  "Calmarinero",       // Shipshape Sailor
  "Almirante Admirable", // Admirable Admiral
  "Peter Punki",       // Sing Kong
  "Filete II",         // Steaking
  "Showbonyan",        // Showbonyan
  "Tiburón Tiburcio",  // The Jawsome Kid
  "Tiburón Jaquetón",  // El Sharkador
  "Capitán Nublo",     // Silver Lining
  "Brownilda",         // Petty-Cake
  "Chapulín Chapulín", // Hoppy-go-Lucky
  "Apanleado",         // Buttered Blue
  "Panduro",           // Punching Baguette
  "Superniñato",       // Unbelievaboy!
  "Superniñato Rebelde", // Unbearaboy!
  "Superniñato Picajoso",// Inflammaboy!
  "Olvirunner",        // Runsure
  "Gatallanes",        // Kittylumbus
  "Limónescente",      // Zest-a-Minute
  "Todoapesta",        // Stinkeye
  "Relapache",         // Slackoon
  "Cafechucho",        // Puppiccino
  "Tomnyan",           // Tomnyan
  "Komaestopistas",    // Koma Knomads
  "Chunda y Tachunda", // In-Tune
  "Abuzampa XXL",      // Supersize Gramps
  "Afronauta",         // Afronaut
  "Espe",              // Tomorrow Gal
  "Dormidomingo",      // Lazy Sundae
  "Auxiliadora",       // Got It Maid
  "Gememinencias",     // Right Brothers
  "Repostilleja",      // Tattlecakes
  "Esmaltina",         // Pearly White
  "Sónico",            // Double Time
  "Supersónico",       // Sonic Bam
  "Trenditópico",      // Treetter
  "Retuiterio",        // Retreeter
  'Panceto',       // Salty Bacon【14†L649-L655】
  'Bilgatino',     // Indexter【17†L4-L7】
  'Su Hackeltad',  // Hack King【19†L5-L9】
  'Timo Gallo',    // Crook-a-doodle【22†L1-L4】
  'Rocky Malrolla',// Rocky Badboya【23†L0-L2】
  'Hierodista',    // Injurnalist【25†L93-L97】
  'MC Kappa',      // Lil Kappa【27†L96-L99】
  'Dr. Nihil Listo',// Dr. E. Raser【29†L5-L8】
  'Dr. Nocturnia', // Dr. Nocturne【31†L0-L2】
  'Corbapacasa',   // Tie-red【33†L0-L3】
  'Cartairada',    // Love-Torn【35†L0-L3】
  'Amarilia',      // Grubbles【37†L0-L2】
  'Sheriff Agonio',// Nervous Rex【39†L0-L3】
  'Origenio',      // Oridjinn【41†L0-L3】
  'Horrogenio',    // Horridjinn【43†L0-L4】
  'Fulgurilla',    // Little Charrmer【45†L0-L3】
  'Don Despacito', // Snailspace【47†L0-L2】
  'Sierpesado',    // Putasockinit【49†L0-L3】
  'Cobravil',      // Snidewinder【51†L0-L3】
  'Aymadrilo',     // OMGator【53†L0-L2】
  'Naqueperder',   // Nautaloss【57†L1-L4】
  'Bebesaurio',    // T-Wrecks【59†L1-L4】
  'Destrozasaurio',// D-Stroy【61†L1-L4】
  'Torpesaurio',   // Clodzilla【63†L1-L4】
  'Tochacolate',   // Cocobanana【65†L1-L4】
  'Rey Jibanyan',  // King Jibanyan【67†L1-L4】
  'Reina Usapyon', // Queen Usapyon【69†L1-L4】
  'Jotamasan',     // Jackomasan【72†L1-L4】
  'Diez de Komajiro',// Komajiro Ten【74†L1-L4】
  'Asnyan',        // Acenyan【76†L1-L4】
  'Whismodín',     // Josper【79†L1-L3】
  'Terminyanator', // Terminyanator【81†L1-L4】
  'Supernyan',     // Supernyan (mismo nombre)
  'Frauduralla',   // Judgebrick【88†L1-L4】
  'Venoctobot',    // Venoctobot【90†L1-L4】
  'Kyubot',        // Kyubot【92†L1-L4】
  'Ciclomán',      // Deadcool【94†L1-L4】
  'Deporchugo',    // Sweattuce【97†L1-L4】
  'Maripasada',    // Amplifly【100†L1-L4】
  'Milperdones',   // My-Baaad【103†L1-L4】
  'Kapman',        // Kaped Komander【105†L1-L4】
  'Tofupyon', //(nombre original, sin traducción conocida)
  'Embajador Fabuloso' // Gorgeous Ambassador【110†L1-L4】

];


export function normalizeYokaiKey(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function matchesName(name, catalog) {
  const key = normalizeYokaiKey(name);
  return catalog.some((entry) => {
    const needle = normalizeYokaiKey(entry);
    return key === needle || key.startsWith(needle);
  });
}

export function isLegendaryYokai(yokai) {
  return Boolean(yokai) && matchesName(yokai.name, LEGENDARY_NAMES);
}

export function isClassicYokai(yokai) {
  return Boolean(yokai) && matchesName(yokai.name, CLASSIC_NAMES);
}

export function isMericanYokai(yokai) {
  return Boolean(yokai) && matchesName(yokai.name, MERICAN_NAMES);
}

export function filterYokaiByCategory(yokaiList, category) {
  const predicate = {
    legendary: isLegendaryYokai,
    classic: isClassicYokai,
    merican: isMericanYokai,
  }[category];

  if (!predicate) {
    return [];
  }

  return yokaiList.filter(predicate);
}

export function getCategoryColor(category) {
  return CATEGORY_FAVORITES.find((entry) => entry.category === category)?.color || '#8FA1C2';
}
