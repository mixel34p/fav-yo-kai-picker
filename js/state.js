import { STATIC_SLOTS, STORAGE_KEYS } from './config.js';

const defaultFilters = {
  game: 'all',
  tribe: 'all',
  search: '',
};

export const state = {
  allYokai: [],
  filtered: [],
  favorites: {},
  activeSlotId: null,
  filters: { ...defaultFilters },
  slotDefinitions: [...STATIC_SLOTS],
  restoredFavoriteIds: {},
};

export function restoreState() {
  state.filters = {
    ...defaultFilters,
    ...readJson(STORAGE_KEYS.filters, {}),
  };
  state.restoredFavoriteIds = readJson(STORAGE_KEYS.favorites, {});
}

export function setAllYokai(yokai) {
  state.allYokai = yokai;
}

export function setFiltered(filtered) {
  state.filtered = filtered;
}

export function setSlotDefinitions(slots) {
  state.slotDefinitions = [...STATIC_SLOTS, ...slots];
  hydrateFavorites();
}

export function setFilter(key, value) {
  if (!(key in state.filters)) {
    return;
  }

  state.filters[key] = value;
  persistFilters();
}

export function setActiveSlot(id) {
  state.activeSlotId = state.activeSlotId === id ? null : id;
}

export function assignFavorite(slotId, yokai) {
  if (!slotId || !yokai) {
    return;
  }

  state.favorites[slotId] = yokai;
  persistFavorites();
}

export function clearFavorite(slotId) {
  delete state.favorites[slotId];
  persistFavorites();
}

export function importFavoriteCode(code) {
  const nextIds = {};
  const pairs = code
    .split(/[,\n]+/)
    .map((pair) => pair.trim())
    .filter(Boolean);

  pairs.forEach((pair) => {
    const [slotId, yokaiId] = pair.split(':').map((value) => value.trim());
    if (slotId && yokaiId) {
      nextIds[slotId] = yokaiId;
    }
  });

  state.restoredFavoriteIds = nextIds;
  hydrateFavorites();
  persistFavorites();
}

function hydrateFavorites() {
  if (!state.allYokai.length || !state.slotDefinitions.length) {
    return;
  }

  const byId = new Map(state.allYokai.map((yokai) => [String(yokai.id), yokai]));
  const validSlots = new Set(state.slotDefinitions.map((slot) => slot.id));
  const nextFavorites = {};

  Object.entries(state.restoredFavoriteIds).forEach(([slotId, yokaiId]) => {
    const yokai = byId.get(String(yokaiId));
    if (yokai && validSlots.has(slotId)) {
      nextFavorites[slotId] = yokai;
    }
  });

  Object.entries(state.favorites).forEach(([slotId, yokai]) => {
    if (validSlots.has(slotId)) {
      nextFavorites[slotId] = yokai;
    }
  });

  state.favorites = nextFavorites;
  persistFavorites();
}

function persistFilters() {
  localStorage.setItem(STORAGE_KEYS.filters, JSON.stringify(state.filters));
}

function persistFavorites() {
  const favoriteIds = Object.fromEntries(
    Object.entries(state.favorites).map(([slotId, yokai]) => [slotId, yokai.id])
  );
  state.restoredFavoriteIds = favoriteIds;
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favoriteIds));
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
