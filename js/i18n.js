const LANGUAGE_KEY = 'ultimate-yokai-picker:language';
const SUPPORTED_LANGUAGES = ['es', 'en'];

const DEFAULT_LANGUAGE = 'es';

const EN = {
  app: {
    title: 'Ultimate Yo-kai Watch Favorite Picker',
    description: 'Ultimate Yo-kai Watch Favorite Picker',
  },
  actions: {
    applyImport: 'Import',
    clear: 'Clear {label}',
    closeDialog: 'Close dialog',
    closeYokaiMenu: 'Close Yo-kai menu',
    copied: 'Copied',
    copy: 'Copy',
    downloadPng: 'Download PNG',
    exportImage: 'Export image',
    generatingPng: 'Generating PNG...',
    support: 'Support me!',
    supportAria: 'Support me on Ko-fi',
  },
  dialog: {
    export: 'Export',
    exportCode: 'Export Code',
    favoriteList: 'Favorite List',
    importCode: 'Import Code',
  },
  export: {
    dateLocale: 'en-US',
    eyebrow: 'Ultimate Yo-kai Watch',
    filenamePrefix: 'yokai-favorites',
    footer: 'fav-yo-kai-picker',
    title: 'My Yo-kai favorites',
  },
  filters: {
    allGames: 'All games',
    allTribes: 'All tribes',
    game: 'Game filter',
    language: 'Language',
    searchPlaceholder: 'Yo-kai name',
    tribe: 'Tribe filter',
  },
  language: {
    en: 'English',
    es: 'Español',
  },
  matrix: {
    aria: 'Yo-kai matrix',
    corner: 'Pick your<br>favorites!',
    empty: 'No Yo-kai match these filters.',
    favorite: 'Favorite',
    favoriteCells: 'Favorite cells are built into the matrix.',
    filled: '{count} filled',
    loading: 'Loading Yo-kai...',
    resultCount: '{count} Yo-kai',
    resultsAria: 'Yo-kai results',
    selectionsAria: 'Favorite selections',
    status: 'Pick a row, column, or overall favorite cell.',
  },
  messages: {
    exportImageError: 'Could not generate the PNG ({message}). Reload the page with Ctrl+F5 and try again once the images have loaded.',
    loadError: 'Could not load Yo-kai data. Check the Supabase connection and try again.',
  },
  slots: {
    category: {
      classic: 'Favorite Classic',
      legendary: 'Favorite Legendary',
      merican: "Favorite 'Merican",
    },
    cell: '{game} {tribe}',
    gameFavorite: '{game} Favorite',
    tribeFavorite: '{tribe} Favorite',
  },
  states: {
    empty: 'Empty',
    unknownGame: 'Unknown Game',
    unknownTribe: 'Unknown',
    unknownYokai: 'Unknown Yo-kai',
  },
  yokaiMenu: {
    choose: 'Choose Yo-kai',
    empty: 'Choose row and column favorites first.',
  },
};

const ES = {
  app: {
    title: 'Selector de favoritos Yo-kai Watch',
    description: 'Selector de favoritos Yo-kai Watch',
  },
  actions: {
    applyImport: 'Importar',
    clear: 'Quitar {label}',
    closeDialog: 'Cerrar dialogo',
    closeYokaiMenu: 'Cerrar menu de Yo-kai',
    copied: 'Copiado',
    copy: 'Copiar',
    downloadPng: 'Descargar PNG',
    exportImage: 'Exportar imagen',
    generatingPng: 'Generando PNG...',
    support: 'Apoyame!',
    supportAria: 'Apoyame en Ko-fi',
  },
  dialog: {
    export: 'Exportar',
    exportCode: 'Codigo de exportacion',
    favoriteList: 'Lista de favoritos',
    importCode: 'Codigo de importacion',
  },
  export: {
    dateLocale: 'es-ES',
    eyebrow: 'Ultimate Yo-kai Watch',
    filenamePrefix: 'yokai-favoritos',
    footer: 'fav-yo-kai-picker',
    title: 'Mis favoritos Yo-kai',
  },
  filters: {
    allGames: 'Todos los juegos',
    allTribes: 'Todas las tribus',
    game: 'Filtro de juego',
    language: 'Idioma',
    searchPlaceholder: 'Buscar un Yo-kai...',
    tribe: 'Filtro de tribu',
  },
  language: {
    en: 'English',
    es: 'Español',
  },
  matrix: {
    aria: 'Matriz Yo-kai',
    corner: 'Elige tus<br>favoritos!',
    empty: 'Ningun Yo-kai coincide con estos filtros.',
    favorite: 'Favorito',
    favoriteCells: 'Las casillas favoritas estan integradas en la matriz.',
    filled: '{count} completados',
    loading: 'Cargando Yo-kai...',
    resultCount: '{count} Yo-kai',
    resultsAria: 'Resultados Yo-kai',
    selectionsAria: 'Selecciones favoritas',
    status: 'Elige una casilla de fila, columna o favorito global.',
  },
  messages: {
    exportImageError: 'No se pudo generar el PNG ({message}). Recarga la pagina con Ctrl+F5 e intentalo de nuevo cuando las imagenes hayan cargado.',
    loadError: 'No se pudieron cargar los datos de Yo-kai. Revisa la conexion con Supabase e intentalo de nuevo.',
  },
  slots: {
    category: {
      classic: 'Favorito clasico',
      legendary: 'Favorito legendario',
      merican: "Favorito 'Merican",
    },
    cell: '{game} {tribe}',
    gameFavorite: 'Favorito de {game}',
    tribeFavorite: 'Favorito {tribe}',
  },
  states: {
    empty: 'Vacio',
    unknownGame: 'Juego desconocido',
    unknownTribe: 'Desconocida',
    unknownYokai: 'Yo-kai desconocido',
  },
  yokaiMenu: {
    choose: 'Elige un Yo-kai',
    empty: 'Elige primero favoritos de fila y columna.',
  },
};

const ES_TRIBES = {
  Brave: 'Valiente',
  Mysterious: 'Misteriosa',
  Tough: 'Robusta',
  Charming: 'Guapa',
  Heartful: 'Amable',
  Shady: 'Oscura',
  Eerie: 'Siniestra',
  Slippery: 'Escurridiza',
  Boss: 'Jefe',
  Wicked: 'Malefica',
  Enma: 'Enma',
  Wandroid: 'Wandroid',
};

const dictionaries = {
  en: EN,
  es: ES,
};

let language = normalizeLanguage(localStorage.getItem(LANGUAGE_KEY)) || DEFAULT_LANGUAGE;
let commonEs = {};
let yokaiCatalog = {
  names: {},
  tribes: {},
};

export async function initI18n() {
  const [common, yokai] = await Promise.all([
    fetchJson('assets/common.json'),
    fetchJson('assets/yokai.json'),
  ]);

  commonEs = common || {};
  yokaiCatalog = yokai || yokaiCatalog;
}

export function getLanguage() {
  return language;
}

export function setLanguage(nextLanguage) {
  const normalized = normalizeLanguage(nextLanguage) || DEFAULT_LANGUAGE;
  language = normalized;
  localStorage.setItem(LANGUAGE_KEY, normalized);
  document.documentElement.lang = normalized;
}

export function t(path, params = {}) {
  const value = getPath(dictionaries[language], path)
    ?? getPath(language === 'es' ? commonEs : null, path)
    ?? getPath(EN, path)
    ?? path;

  return interpolate(value, params);
}

export function applyStaticTranslations() {
  document.documentElement.lang = language;
  document.title = t('app.title');

  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.content = t('app.description');
  }

  const searchInput = document.querySelector('#search-input');
  if (searchInput) {
    searchInput.placeholder = t('filters.searchPlaceholder');
  }

  setText('#support-button-text', t('actions.support'));
  setText('#export-image-button', t('actions.downloadPng'));
  setText('#loading-text', t('matrix.loading'));
  setText('#active-slot-label', t('matrix.status'));
  setText('#dialog-title', t('dialog.export'));
  setText('#copy-dialog-button', t('actions.copy'));
  setText('#apply-import-button', t('actions.applyImport'));
  setText('#yokai-menu-title', t('yokaiMenu.choose'));
  setText('#helper-text', t('matrix.favoriteCells'));
  setText('#filled-count', t('matrix.filled', { count: 0 }));

  setAttribute('#game-tabs', 'aria-label', t('filters.game'));
  setAttribute('#tribe-filters', 'aria-label', t('filters.tribe'));
  setAttribute('#language-select', 'aria-label', t('filters.language'));
  setAttribute('.kofi-button', 'aria-label', t('actions.supportAria'));
  setAttribute('.matrix-panel', 'aria-label', t('matrix.aria'));
  setAttribute('#yokai-grid', 'aria-label', t('matrix.resultsAria'));
  setAttribute('.bottom-panel', 'aria-label', t('matrix.selectionsAria'));
  setAttribute('#close-dialog-button', 'aria-label', t('actions.closeDialog'));
  setAttribute('#close-yokai-menu-button', 'aria-label', t('actions.closeYokaiMenu'));
}

export function renderLanguageOptions(select) {
  if (!select) {
    return;
  }

  select.innerHTML = SUPPORTED_LANGUAGES
    .map((code) => {
      const selected = language === code ? ' selected' : '';
      return `<option value="${escapeHtml(code)}"${selected}>${escapeHtml(t(`language.${code}`))}</option>`;
    })
    .join('');
}

export function displayYokaiName(yokai) {
  if (!yokai) {
    return '';
  }

  return displayYokaiNameFromValue(yokai.name);
}

export function displayYokaiNameFromValue(name) {
  const baseName = String(name || '');
  if (language !== 'en') {
    return baseName;
  }

  return yokaiCatalog.names?.[baseName] || baseName;
}

export function displayTribe(tribe) {
  const baseTribe = String(tribe || '');
  if (language === 'es') {
    return ES_TRIBES[baseTribe] || baseTribe;
  }

  return yokaiCatalog.tribes?.[baseTribe] || baseTribe;
}

export function displayGame(game) {
  return String(game || '');
}

export function displaySlotLabel(slot) {
  if (!slot) {
    return '';
  }

  if (slot.id === 'overall') {
    return t('matrix.favorite');
  }

  if (slot.type === 'cell') {
    return t('slots.cell', {
      game: displayGame(slot.game),
      tribe: displayTribe(slot.tribe),
    });
  }

  if (slot.type === 'game') {
    return t('slots.gameFavorite', { game: displayGame(slot.game) });
  }

  if (slot.type === 'tribe') {
    return t('slots.tribeFavorite', { tribe: displayTribe(slot.tribe) });
  }

  if (slot.type === 'category') {
    return t(`slots.category.${slot.category}`);
  }

  return slot.label || slot.id;
}

export function getYokaiSearchText(yokai) {
  return [
    yokai?.name,
    displayYokaiName(yokai),
    yokaiCatalog.names?.[yokai?.name],
    yokai?.tribe,
    displayTribe(yokai?.tribe),
    yokai?.game,
    displayGame(yokai?.game),
  ].filter(Boolean).join(' ');
}

function normalizeLanguage(value) {
  return SUPPORTED_LANGUAGES.includes(value) ? value : null;
}

async function fetchJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

function getPath(source, path) {
  if (!source) {
    return undefined;
  }

  return path.split('.').reduce((value, key) => (
    value && Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined
  ), source);
}

function interpolate(value, params) {
  if (Array.isArray(value)) {
    return value;
  }

  return String(value).replace(/\{(\w+)\}/g, (_, key) => params[key] ?? '');
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}

function setAttribute(selector, attribute, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute(attribute, value);
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
