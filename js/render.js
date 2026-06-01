import { EXTRA_TRIBE_FAVORITES, GAME_COLORS, GAME_LOGOS, GAME_ORDER, TRIBE_COLORS, TRIBE_ICONS, TRIBE_ORDER } from './config.js';
import { displayGame, displaySlotLabel, displayTribe, displayYokaiName, t } from './i18n.js';
import { getCategoryColor } from './yokai-categories.js';
import { getDisplayImageUrl } from './image-url.js';
import { state } from './state.js';

const elements = {
  gameTabs: document.querySelector('#game-tabs'),
  tribeFilters: document.querySelector('#tribe-filters'),
  tribeLegend: document.querySelector('#tribe-legend'),
  grid: document.querySelector('#yokai-grid'),
  slots: document.querySelector('#favorite-slots'),
  activeSlotLabel: document.querySelector('#active-slot-label'),
  resultCount: document.querySelector('#result-count'),
  filledCount: document.querySelector('#filled-count'),
  searchInput: document.querySelector('#search-input'),
  loading: document.querySelector('#loading-state'),
  error: document.querySelector('#error-state'),
};

export function renderAll() {
  renderGameTabs();
  renderTribeFilters();
  renderTribeLegend();
  renderGrid();
  renderFavoriteSlots();
  renderActiveSlotLabel();
}

export function renderGameTabs() {
  const games = ['all', ...orderedDistinct(state.allYokai, 'game', GAME_ORDER)];
  elements.gameTabs.innerHTML = games
    .map((game) => {
      const label = game === 'all' ? t('filters.allGames') : displayGame(game);
      const selected = state.filters.game === game ? ' selected' : '';
      return `<option value="${escapeHtml(game)}"${selected}>${escapeHtml(label)}</option>`;
    })
    .join('');
}

export function renderTribeFilters() {
  const tribes = ['all', ...getMatrixTribes(state.allYokai)];
  elements.tribeFilters.innerHTML = tribes
    .map((tribe) => {
      const label = tribe === 'all' ? t('filters.allTribes') : displayTribe(tribe);
      const selected = state.filters.tribe === tribe ? ' selected' : '';
      return `<option value="${escapeHtml(tribe)}"${selected}>${escapeHtml(label)}</option>`;
    })
    .join('');
}

export function renderTribeLegend() {
  const counts = countBy(state.allYokai.filter((yokai) => TRIBE_ORDER.includes(yokai.tribe)), 'tribe');
  const tribes = orderedValues([...counts.keys()], TRIBE_ORDER);

  elements.tribeLegend.innerHTML = tribes
    .map((tribe) => {
      const active = state.filters.tribe === tribe ? ' is-active' : '';
      const label = displayTribe(tribe);
      return `
        <button class="tribe-row${active}" type="button" data-tribe="${escapeHtml(tribe)}">
          <span class="legend-dot" style="--tribe-color:${getTribeColor(tribe)}">
            ${renderIcon(TRIBE_ICONS[tribe], label)}
          </span>
          <span class="tribe-name">${escapeHtml(label)}</span>
          <span class="tribe-count">${counts.get(tribe)}</span>
        </button>
      `;
    })
    .join('');
}

export function renderGrid() {
  elements.resultCount.textContent = t('matrix.resultCount', { count: state.filtered.length });

  if (!state.filtered.length) {
    elements.grid.innerHTML = `<div class="empty-state">${escapeHtml(t('matrix.empty'))}</div>`;
    return;
  }

  const games = state.filters.game === 'all'
    ? orderedDistinct(state.allYokai, 'game', GAME_ORDER)
    : [state.filters.game];
  const tribes = state.filters.tribe === 'all'
    ? getMatrixTribes(state.allYokai)
    : [state.filters.tribe];
  const extraFavoriteTribes = getExtraFavoriteTribes();
  const byCell = groupByGameAndTribe(state.filtered);
  const columns = `var(--game-width) repeat(${tribes.length}, var(--tribe-width)) var(--favorite-width)`;

  const headerCells = [
    `<div class="corner-cell">${t('matrix.corner')}</div>`,
    ...tribes.map((tribe) => `
      <div class="tribe-header" style="--tribe-color:${getTribeColor(tribe)}" title="${escapeHtml(displayTribe(tribe))}">
        ${renderIcon(TRIBE_ICONS[tribe], displayTribe(tribe))}
        <span>${escapeHtml(displayTribe(tribe))}</span>
      </div>
    `),
    `<div class="favorite-header favorite-column-header">${escapeHtml(t('matrix.favorite'))}</div>`,
  ];

  const bodyCells = games.flatMap((game) => [
    `
      <div class="game-header" title="${escapeHtml(game)}">
        ${renderGameLogo(game)}
      </div>
    `,
    ...tribes.map((tribe) => renderMatrixCell(game, tribe, byCell)),
    renderGameFavoriteMatrixCell(`game-${slugify(game)}`, game),
  ]);

  elements.grid.innerHTML = `
    <div class="matrix" style="grid-template-columns:${columns}">
      ${headerCells.join('')}
      ${bodyCells.join('')}
      <div class="overall-row-header">${escapeHtml(t('matrix.favorite'))}</div>
      ${tribes.map((tribe) => renderOverallMatrixCell(`tribe-${slugify(tribe)}`, tribe)).join('')}
      ${renderOverallMatrixCell('overall', t('matrix.favorite'), true)}
    </div>
    <div class="extra-favorites">
      ${extraFavoriteTribes.map((entry) => renderExtraFavoriteCell(entry)).join('')}
    </div>
  `;
}

export function renderFavoriteSlots() {
  const filled = Object.keys(state.favorites).length;
  elements.filledCount.textContent = t('matrix.filled', { count: filled });
  elements.slots.innerHTML = '';
}

export function renderActiveSlotLabel() {
  elements.activeSlotLabel.textContent = '';
}

export function syncSearchInput() {
  elements.searchInput.value = state.filters.search;
}

export function setLoading(isLoading) {
  elements.loading.hidden = !isLoading;
}

export function showError(message) {
  elements.error.hidden = false;
  elements.error.textContent = message;
}

export function hideError() {
  elements.error.hidden = true;
  elements.error.textContent = '';
}

export function getTribeColor(tribe) {
  return TRIBE_COLORS[tribe] || '#8FA1C2';
}

export function getGameColor(game) {
  return GAME_COLORS[game] || '#8FA1C2';
}

export function orderedDistinct(rows, key, preferredOrder) {
  return orderedValues([...new Set(rows.map((row) => row[key]).filter(Boolean))], preferredOrder);
}

export function orderedValues(values, preferredOrder) {
  return values.sort((a, b) => {
    const ai = preferredOrder.indexOf(a);
    const bi = preferredOrder.indexOf(b);
    if (ai !== -1 || bi !== -1) {
      return (ai === -1 ? Number.MAX_SAFE_INTEGER : ai) - (bi === -1 ? Number.MAX_SAFE_INTEGER : bi);
    }
    return a.localeCompare(b);
  });
}

function renderMatrixCell(game, tribe, byCell) {
  const yokai = byCell.get(`${game}||${tribe}`) || [];
  const empty = yokai.length ? '' : ' is-empty';
  const color = getTribeColor(tribe);
  const slotId = `cell-${slugify(game)}-${slugify(tribe)}`;
  const selected = state.favorites[slotId];
  const active = state.activeSlotId === slotId ? ' is-active' : '';
  const filled = selected ? ' is-filled' : '';

  if (!yokai.length) {
    return `
      <div class="matrix-cell${empty}" style="--tribe-color:${color}" data-game="${escapeHtml(game)}" data-tribe="${escapeHtml(tribe)}"></div>
    `;
  }

  const content = selected
    ? `
      <img class="cell-favorite-image" src="${imageSrc(selected)}" alt="${escapeHtml(displayYokaiName(selected))}" referrerpolicy="no-referrer">
      <button class="clear-slot" type="button" data-clear-slot="${escapeHtml(slotId)}" aria-label="${escapeHtml(t('actions.clear', { label: `${displayGame(game)} ${displayTribe(tribe)}` }))}">x</button>
    `
    : '<span class="cell-placeholder">?</span>';

  return `
    <div class="matrix-cell is-selectable${active}${filled}" role="button" tabindex="0" style="--tribe-color:${color}" data-slot-id="${escapeHtml(slotId)}" data-game="${escapeHtml(game)}" data-tribe="${escapeHtml(tribe)}" title="${escapeHtml(`${displayGame(game)} ${displayTribe(tribe)}`)}">
      ${content}
    </div>
  `;
}

function renderGameFavoriteMatrixCell(slotId, game) {
  const yokai = state.favorites[slotId];
  const active = state.activeSlotId === slotId ? ' is-active' : '';
  const filled = yokai ? ' is-filled' : '';
  const image = yokai
    ? `<img class="cell-favorite-image" src="${imageSrc(yokai)}" alt="${escapeHtml(displayYokaiName(yokai))}" referrerpolicy="no-referrer">`
    : '<span class="cell-placeholder">?</span>';
  const clearButton = yokai
    ? `<button class="clear-slot" type="button" data-clear-slot="${escapeHtml(slotId)}" aria-label="${escapeHtml(t('actions.clear', { label: t('slots.gameFavorite', { game: displayGame(game) }) }))}">x</button>`
    : '';

  return `
    <div class="matrix-cell game-favorite-cell is-selectable${active}${filled}" role="button" tabindex="0" style="--game-color:${getGameColor(game)}" data-slot-id="${escapeHtml(slotId)}" title="${escapeHtml(t('slots.gameFavorite', { game: displayGame(game) }))}">
      ${image}
      ${clearButton}
    </div>
  `;
}

function renderOverallFavoriteCell(slotId, label) {
  return renderExtraFavoriteCell({ slotId, label });
}

function renderExtraFavoriteCell({ slotId, label, accentColor }) {
  const yokai = state.favorites[slotId];
  const active = state.activeSlotId === slotId ? ' is-active' : '';
  const filled = yokai ? ' is-filled' : '';
  const accent = accentColor ? ` style="--extra-accent:${accentColor}"` : '';
  const image = yokai
    ? `<img src="${imageSrc(yokai)}" alt="${escapeHtml(displayYokaiName(yokai))}" referrerpolicy="no-referrer">`
    : '<span class="slot-placeholder">?</span>';
  const clearButton = yokai
    ? `<button class="clear-slot" type="button" data-clear-slot="${escapeHtml(slotId)}" aria-label="${escapeHtml(t('actions.clear', { label }))}">x</button>`
    : '';

  return `
    <div class="overall-favorite-card${active}${filled}" role="button" tabindex="0" data-slot-id="${escapeHtml(slotId)}" title="${escapeHtml(label)}"${accent}>
      <span class="overall-favorite-label">${escapeHtml(label)}</span>
      <span class="overall-favorite-box">${image}${clearButton}</span>
    </div>
  `;
}

function renderOverallMatrixCell(slotId, tribe, isGlobal = false) {
  const yokai = state.favorites[slotId];
  const active = state.activeSlotId === slotId ? ' is-active' : '';
  const filled = yokai ? ' is-filled' : '';
  const color = isGlobal ? '' : ` style="--tribe-color:${getTribeColor(tribe)}"`;
  const image = yokai
    ? `<img class="cell-favorite-image" src="${imageSrc(yokai)}" alt="${escapeHtml(displayYokaiName(yokai))}" referrerpolicy="no-referrer">`
    : '<span class="cell-placeholder">?</span>';
  const clearButton = yokai
    ? `<button class="clear-slot" type="button" data-clear-slot="${escapeHtml(slotId)}" aria-label="${escapeHtml(t('actions.clear', { label: displayTribe(tribe) }))}">x</button>`
    : '';
  const rainbow = isGlobal ? ' is-rainbow' : '';

  return `
    <div class="matrix-cell overall-matrix-cell is-selectable${active}${filled}${rainbow}" role="button" tabindex="0"${color} data-slot-id="${escapeHtml(slotId)}" title="${escapeHtml(isGlobal ? tribe : displayTribe(tribe))}">
      ${image}
      ${clearButton}
    </div>
  `;
}

function renderGameLogo(game) {
  const src = GAME_LOGOS[game];
  if (src) {
    return `<img src="${escapeAttribute(src)}" alt="${escapeHtml(displayGame(game))}">`;
  }

  return `<span class="game-fallback">${escapeHtml(displayGame(game))}</span>`;
}

function renderIcon(src, alt) {
  return src ? `<img src="${escapeAttribute(src)}" alt="${escapeHtml(alt)}">` : '';
}

function imageSrc(yokai) {
  return escapeAttribute(getDisplayImageUrl(yokai?.imageurl));
}

function countBy(rows, key) {
  return rows.reduce((map, row) => {
    map.set(row[key], (map.get(row[key]) || 0) + 1);
    return map;
  }, new Map());
}

function getMatrixTribes(rows) {
  const present = new Set(rows.map((row) => row.tribe));
  return TRIBE_ORDER.filter((tribe) => present.has(tribe));
}

function getExtraFavoriteTribes() {
  return EXTRA_TRIBE_FAVORITES.map((tribe) => ({
    slotId: `tribe-${slugify(tribe)}`,
    label: t('slots.tribeFavorite', { tribe: displayTribe(tribe) }),
    accentColor: getTribeColor(tribe),
  })).concat(
    state.slotDefinitions
      .filter((slot) => slot.type === 'category')
      .map((slot) => ({
        slotId: slot.id,
        label: displaySlotLabel(slot),
        accentColor: slot.color || getCategoryColor(slot.category),
      })),
  );
}

function groupByGameAndTribe(rows) {
  return rows.reduce((map, yokai) => {
    const key = `${yokai.game}||${yokai.tribe}`;
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(yokai);
    return map;
  }, new Map());
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#096;');
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
