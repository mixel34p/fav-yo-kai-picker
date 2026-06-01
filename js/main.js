import { fetchAllYokai } from './api.js';
import { EXCLUDED_GAMES, EXCLUDED_TRIBES, EXTRA_TRIBE_FAVORITES, GAME_ORDER, TRIBE_ORDER } from './config.js';
import { initI18n, t } from './i18n.js';
import { CATEGORY_FAVORITES } from './yokai-categories.js';
import { refreshFilters, wireEvents } from './events.js?v=5';
import { normalizeImageUrl } from './image-url.js';
import { renderAll, setLoading, showError, hideError } from './render.js';
import { restoreState, setAllYokai, setSlotDefinitions, state } from './state.js';

init();

async function init() {
  try {
    await initI18n();
    restoreState();
    wireEvents();
    setLoading(true);
    hideError();
    const yokai = await fetchAllYokai();
    setAllYokai(normalizeRows(yokai));
    resetRemovedFilters();
    setSlotDefinitions(buildDynamicSlots(state.allYokai));
    refreshFilters();
    renderAll();
  } catch (error) {
    showError(t('messages.loadError'));
    console.error(error);
  } finally {
    setLoading(false);
  }
}

function normalizeRows(rows) {
  return rows
    .map((row) => ({
      id: row.id,
      name: row.name || t('states.unknownYokai'),
      tribe: row.tribe || t('states.unknownTribe'),
      imageurl: normalizeImageUrl(row.imageurl),
      game: row.game || t('states.unknownGame'),
    }))
    .filter((row) => !EXCLUDED_GAMES.includes(row.game) && !EXCLUDED_TRIBES.includes(row.tribe));
}

function resetRemovedFilters() {
  const availableGames = new Set(state.allYokai.map((yokai) => yokai.game));
  if (state.filters.game !== 'all' && !availableGames.has(state.filters.game)) {
    state.filters.game = 'all';
  }

  if (state.filters.tribe !== 'all' && !TRIBE_ORDER.includes(state.filters.tribe)) {
    state.filters.tribe = 'all';
  }
}

function buildDynamicSlots(yokai) {
  const gameNames = getDistinct(yokai, 'game', GAME_ORDER);
  const matrixTribes = TRIBE_ORDER.filter((tribe) => yokai.some((row) => row.tribe === tribe));
  const cellSlots = gameNames.flatMap((game) => (
    matrixTribes
      .filter((tribe) => yokai.some((row) => row.game === game && row.tribe === tribe))
      .map((tribe) => ({
        id: `cell-${slugify(game)}-${slugify(tribe)}`,
        label: `${game} ${tribe}`,
        type: 'cell',
        game,
        tribe,
      }))
  ));
  const games = gameNames.map((game) => ({
    id: `game-${slugify(game)}`,
    label: `${game} Favorite`,
    type: 'game',
    game,
  }));
  const tribeNames = [...new Set([
    ...getDistinct(yokai, 'tribe', [...TRIBE_ORDER, ...EXTRA_TRIBE_FAVORITES])
      .filter((tribe) => TRIBE_ORDER.includes(tribe) || EXTRA_TRIBE_FAVORITES.includes(tribe)),
    ...EXTRA_TRIBE_FAVORITES,
  ])];
  const tribes = tribeNames.map((tribe) => ({
    id: `tribe-${slugify(tribe)}`,
    label: `${tribe} Favorite`,
    type: 'tribe',
    tribe,
  }));

  const categories = CATEGORY_FAVORITES.map((entry) => ({
    id: entry.id,
    label: entry.label,
    type: 'category',
    category: entry.category,
    color: entry.color,
  }));

  return [...cellSlots, ...games, ...tribes, ...categories];
}

function getDistinct(rows, key, preferredOrder) {
  return [...new Set(rows.map((row) => row[key]).filter(Boolean))].sort((a, b) => {
    const ai = preferredOrder.indexOf(a);
    const bi = preferredOrder.indexOf(b);
    if (ai !== -1 || bi !== -1) {
      return (ai === -1 ? Number.MAX_SAFE_INTEGER : ai) - (bi === -1 ? Number.MAX_SAFE_INTEGER : bi);
    }
    return a.localeCompare(b);
  });
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
