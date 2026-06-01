import { EXTRA_TRIBE_FAVORITES } from './config.js';
import { filterYokaiByCategory } from './yokai-categories.js';
import { applyFilters } from './filters.js';
import {
  getDirectImageUrl,
  getDisplayImageUrl,
  getImgurProxyUrl,
  getNextImgurFallback,
  PLACEHOLDER_IMAGE,
} from './image-url.js';
import {
  assignFavorite,
  clearFavorite,
  importFavoriteCode,
  setActiveSlot,
  setFilter,
  setFiltered,
  state,
} from './state.js';
import {
  renderActiveSlotLabel,
  renderAll,
  renderFavoriteSlots,
  renderGameTabs,
  renderGrid,
  renderTribeFilters,
  renderTribeLegend,
  syncSearchInput,
} from './render.js';

const elements = {
  gameTabs: document.querySelector('#game-tabs'),
  tribeFilters: document.querySelector('#tribe-filters'),
  tribeLegend: document.querySelector('#tribe-legend'),
  grid: document.querySelector('#yokai-grid'),
  slots: document.querySelector('#favorite-slots'),
  searchInput: document.querySelector('#search-input'),
  exportListButton: document.querySelector('#export-list-button'),
  exportCodeButton: document.querySelector('#export-code-button'),
  exportImageButton: document.querySelector('#export-image-button'),
  importCodeButton: document.querySelector('#import-code-button'),
  dialog: document.querySelector('#export-dialog'),
  dialogTitle: document.querySelector('#dialog-title'),
  dialogOutput: document.querySelector('#dialog-output'),
  dialogInput: document.querySelector('#dialog-input'),
  copyDialogButton: document.querySelector('#copy-dialog-button'),
  applyImportButton: document.querySelector('#apply-import-button'),
  yokaiMenuDialog: document.querySelector('#yokai-menu-dialog'),
  yokaiMenuTitle: document.querySelector('#yokai-menu-title'),
  yokaiMenuNote: document.querySelector('#yokai-menu-note'),
  yokaiMenuList: document.querySelector('#yokai-menu-list'),
};

let currentMenuSlotId = null;

export function wireEvents() {
  document.addEventListener('error', handleImageError, true);

  elements.gameTabs.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  elements.gameTabs.addEventListener('change', () => {
    setFilter('game', elements.gameTabs.value);
    refreshFilters();
    renderGrid();
  });

  elements.tribeFilters.addEventListener('change', () => {
    setFilter('tribe', elements.tribeFilters.value);
    refreshFilters();
    renderTribeLegend();
    renderGrid();
  });

  elements.tribeLegend.addEventListener('click', handleTribeClick);

  elements.searchInput.addEventListener(
    'input',
    debounce(() => {
      setFilter('search', elements.searchInput.value);
      refreshFilters();
      renderGrid();
    }, 150)
  );

  elements.grid.addEventListener('click', handleMatrixClick);
  elements.grid.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    handleMatrixClick(event);
  });

  elements.yokaiMenuList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-yokai-id]');
    if (!button || !currentMenuSlotId) {
      return;
    }

    const targetSlotId = button.dataset.targetSlotId || currentMenuSlotId;
    const yokai = state.allYokai.find((item) => String(item.id) === String(button.dataset.yokaiId));
    assignFavorite(targetSlotId, yokai);
    if (state.activeSlotId !== targetSlotId) {
      setActiveSlot(targetSlotId);
    }
    renderFavoriteSlots();
    renderGrid();
    renderActiveSlotLabel();
    elements.yokaiMenuDialog.close();
  });

  elements.slots.addEventListener('click', (event) => {
    handleSlotActivation(event);
  });

  elements.slots.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    handleSlotActivation(event);
  });

  elements.exportListButton?.addEventListener('click', () => {
    openOutputDialog('Favorite List', buildReadableExport(), false);
  });

  elements.exportCodeButton?.addEventListener('click', () => {
    openOutputDialog('Export Code', buildCodeExport(), false);
  });

  elements.exportImageButton.addEventListener('click', () => {
    exportImage().catch((error) => {
      console.error(error);
      openOutputDialog('Export Image', 'Could not export the image. Try again after the Yo-kai images finish loading.', false);
    });
  });

  elements.importCodeButton?.addEventListener('click', () => {
    openOutputDialog('Import Code', '', true);
  });

  elements.copyDialogButton.addEventListener('click', async () => {
    const value = elements.dialogInput.hidden ? elements.dialogOutput.value : elements.dialogInput.value;
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    elements.copyDialogButton.textContent = 'Copied';
    window.setTimeout(() => {
      elements.copyDialogButton.textContent = 'Copy';
    }, 900);
  });

  elements.applyImportButton.addEventListener('click', () => {
    importFavoriteCode(elements.dialogInput.value);
    renderAll();
    elements.dialog.close();
  });

  syncSearchInput();
}

function handleImageError(event) {
  const image = event.target;
  if (!(image instanceof HTMLImageElement)) {
    return;
  }

  const originalSrc = image.getAttribute('data-original-src')
    || image.getAttribute('src')
    || image.src;
  if (!image.dataset.originalSrc) {
    image.dataset.originalSrc = originalSrc;
  }

  const failed = new Set((image.dataset.imgurFailed || '').split('|').filter(Boolean));
  const markFailed = (url) => {
    failed.add(url);
    image.dataset.imgurFailed = [...failed].join('|');
  };

  const normalized = getDisplayImageUrl(originalSrc);
  if (!failed.has(normalized) && normalized !== image.src) {
    markFailed(image.src);
    image.src = normalized;
    return;
  }

  const nextDirect = getNextImgurFallback(image.src);
  if (nextDirect && !failed.has(nextDirect)) {
    markFailed(image.src);
    image.src = nextDirect;
    return;
  }

  const proxyUrl = getImgurProxyUrl(originalSrc);
  if (proxyUrl && !failed.has(proxyUrl) && !/images\.weserv\.nl/i.test(image.src)) {
    markFailed(image.src);
    image.src = proxyUrl;
    return;
  }

  if (!/(?:i\.imgur\.com|images\.weserv\.nl|wikia\.nocookie)/i.test(image.src)) {
    image.src = PLACEHOLDER_IMAGE;
    return;
  }

  image.src = PLACEHOLDER_IMAGE;
}

function handleSlotActivation(event) {
  const clearButton = event.target.closest('[data-clear-slot]');
  if (clearButton) {
    event.stopPropagation();
    clearFavorite(clearButton.dataset.clearSlot);
    renderFavoriteSlots();
    renderGrid();
    return;
  }

  const slotButton = event.target.closest('[data-slot-id]');
  if (!slotButton) {
    return;
  }

  event.preventDefault();
  activateSlotAndOpenMenu(slotButton.dataset.slotId);
}

export function refreshFilters() {
  setFiltered(applyFilters(state.allYokai, state.filters));
}

function activateSlotAndOpenMenu(slotId) {
  if (state.activeSlotId !== slotId) {
    setActiveSlot(slotId);
  }
  renderFavoriteSlots();
  renderGrid();
  renderActiveSlotLabel();
  openSlotYokaiMenu(slotId);
}

function handleMatrixClick(event) {
  const clearButton = event.target.closest('[data-clear-slot]');
  if (clearButton) {
    event.stopPropagation();
    clearFavorite(clearButton.dataset.clearSlot);
    renderFavoriteSlots();
    renderGrid();
    renderActiveSlotLabel();
    return;
  }

  const favorite = event.target.closest('[data-slot-id]');
  if (favorite) {
    event.preventDefault();
    activateSlotAndOpenMenu(favorite.dataset.slotId);
    return;
  }
}

function openSlotYokaiMenu(slotId) {
  const slot = state.slotDefinitions.find((definition) => definition.id === slotId);
  if (!slot) {
    return;
  }

  openYokaiMenu(slot.label, getYokaiForSlot(slot), '', slot.id, false);
}

function openYokaiMenu(title, yokai, note, slotId, disabled) {
  currentMenuSlotId = slotId;
  elements.yokaiMenuTitle.textContent = title;
  elements.yokaiMenuNote.textContent = note;
  elements.yokaiMenuList.innerHTML = yokai.length
    ? yokai.map((item) => renderYokaiMenuButton(item, slotId, disabled)).join('')
    : '<div class="yokai-menu-empty">Choose row and column favorites first.</div>';
  elements.yokaiMenuDialog.showModal();
}

function getYokaiForSlot(slot) {
  if (slot.id === 'overall') {
    return getChosenRowAndColumnFavorites();
  }

  if (slot.type === 'cell' || slot.id.startsWith('cell-')) {
    return state.allYokai.filter((yokai) => yokai.game === slot.game && yokai.tribe === slot.tribe);
  }

  if (slot.id.startsWith('game-')) {
    return getChosenCellFavorites({ game: slot.game || slot.label.replace(/ Favorite$/, '') });
  }

  if (slot.id.startsWith('tribe-')) {
    const tribe = slot.tribe || slot.label.replace(/^Favorite /, '').replace(/ Favorite$/, '');
    if (EXTRA_TRIBE_FAVORITES.includes(tribe)) {
      return state.allYokai.filter((yokai) => yokai.tribe === tribe);
    }

    return getChosenCellFavorites({ tribe });
  }

  if (slot.type === 'category' || slot.id.startsWith('category-')) {
    return filterYokaiByCategory(state.allYokai, slot.category);
  }

  return state.allYokai;
}

function getChosenRowAndColumnFavorites() {
  const selected = state.slotDefinitions
    .filter((slot) => slot.id.startsWith('game-') || slot.id.startsWith('tribe-'))
    .map((slot) => state.favorites[slot.id])
    .filter(Boolean);
  const unique = new Map(selected.map((yokai) => [String(yokai.id), yokai]));

  return [...unique.values()];
}

function getChosenCellFavorites({ game, tribe }) {
  const selected = state.slotDefinitions
    .filter((slot) => slot.type === 'cell')
    .filter((slot) => !game || slot.game === game)
    .filter((slot) => !tribe || slot.tribe === tribe)
    .map((slot) => state.favorites[slot.id])
    .filter(Boolean);
  const unique = new Map(selected.map((yokai) => [String(yokai.id), yokai]));

  return [...unique.values()];
}

function renderYokaiMenuButton(yokai, slotId, disabled) {
  const assigned = Object.values(state.favorites).some((favorite) => String(favorite.id) === String(yokai.id))
    ? ' is-assigned'
    : '';
  const disabledAttribute = disabled ? ' disabled' : '';

  return `
    <button class="yokai-menu-option${assigned}" type="button" data-target-slot-id="${escapeHtml(slotId || '')}" data-yokai-id="${escapeHtml(yokai.id)}"${disabledAttribute}>
      <img src="${escapeAttribute(getDisplayImageUrl(yokai.imageurl))}" alt="${escapeHtml(yokai.name)}" loading="lazy" referrerpolicy="no-referrer">
      <span>${escapeHtml(yokai.name)}</span>
    </button>
  `;
}

function handleTribeClick(event) {
  const button = event.target.closest('[data-tribe]');
  if (!button) {
    return;
  }

  setFilter('tribe', button.dataset.tribe);
  refreshFilters();
  renderTribeFilters();
  renderTribeLegend();
  renderGrid();
}

function buildReadableExport() {
  return state.slotDefinitions
    .map((slot) => {
      const yokai = state.favorites[slot.id];
      return `${slot.label}: ${yokai ? `${yokai.name} (${yokai.tribe}, ${yokai.game})` : 'Empty'}`;
    })
    .join('\n');
}

function buildCodeExport() {
  return state.slotDefinitions
    .filter((slot) => state.favorites[slot.id])
    .map((slot) => `${slot.id}:${state.favorites[slot.id].id}`)
    .join(',');
}

async function exportImage() {
  const target = document.querySelector('#yokai-grid');
  const scale = Math.min(3, Math.max(2, window.devicePixelRatio || 2));
  const padding = 24;
  const titleHeight = 52;
  const width = Math.ceil(target.scrollWidth);
  const height = Math.ceil(target.scrollHeight);
  const exportWidth = width + padding * 2;
  const exportHeight = height + padding * 2 + titleHeight;

  const clone = target.cloneNode(true);
  clone.classList.add('is-exporting');
  clone.style.width = `${width}px`;
  clone.style.maxHeight = 'none';
  clone.style.overflow = 'visible';

  const frame = document.createElement('div');
  frame.className = 'export-frame';
  frame.style.width = `${exportWidth}px`;

  const title = document.createElement('div');
  title.className = 'export-title';
  title.textContent = 'My Yo-kai Favorites';

  const body = document.createElement('div');
  body.className = 'export-body';
  body.style.width = `${width}px`;
  body.append(clone);

  frame.append(title, body);

  const mount = document.createElement('div');
  mount.className = 'export-mount';
  mount.append(frame);
  document.body.append(mount);

  try {
    await document.fonts?.ready;
    await inlineImages(frame);
    await waitForImages(frame);

    const css = getExportStylesheets();
    const markup = buildSvgMarkup(frame, css, exportWidth, exportHeight);
    const svgBlob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
    const pngBlob = await svgToPngBlob(svgBlob, exportWidth, exportHeight, scale);
    downloadBlob(pngBlob, 'yokai-favorites.png');
  } catch (error) {
    console.warn('PNG export failed, downloading SVG fallback.', error);
    const css = getExportStylesheets();
    const markup = buildSvgMarkup(frame, css, exportWidth, exportHeight);
    downloadBlob(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }), 'yokai-favorites.svg');
  } finally {
    mount.remove();
  }
}

function getExportStylesheets() {
  const inlineExportCss = `
    .export-mount { font-family: "Nunito", Arial, sans-serif; }
    .export-frame {
      box-sizing: border-box;
      padding: 24px;
      background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
      border: 4px solid #f5c542;
      box-shadow: inset 0 0 0 2px #42230d;
    }
    .export-title {
      margin: 0 0 16px;
      color: #fff;
      font-family: "Fredoka One", Arial, sans-serif;
      font-size: 28px;
      font-weight: 400;
      letter-spacing: 0.02em;
      text-align: center;
      text-shadow: 0 2px 0 #000, 0 0 12px rgba(245, 197, 66, 0.35);
    }
    .export-body { margin: 0 auto; }
    .is-exporting { max-height: none !important; overflow: visible !important; }
    .is-exporting .matrix { border-color: rgba(0, 0, 0, 0.55); }
    .overall-favorite-card.is-filled .overall-favorite-box {
      box-shadow: inset 0 0 0 3px var(--extra-accent, #f5c542);
    }
  `;

  const sheetCss = [...document.styleSheets]
    .map((sheet) => {
      try {
        return [...sheet.cssRules].map((rule) => rule.cssText).join('\n');
      } catch {
        return '';
      }
    })
    .join('\n');

  return `${sheetCss}\n${inlineExportCss}`;
}

function buildSvgMarkup(clone, css, width, height) {
  const namespace = 'http://www.w3.org/1999/xhtml';
  const wrapper = document.createElementNS(namespace, 'div');
  wrapper.setAttribute('xmlns', namespace);
  wrapper.setAttribute('style', `width:${width}px;height:${height}px;`);

  const style = document.createElementNS(namespace, 'style');
  style.textContent = css;
  wrapper.append(style, clone);

  const serialized = new XMLSerializer().serializeToString(wrapper);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <foreignObject width="100%" height="100%">
    ${serialized}
  </foreignObject>
</svg>`;
}

async function inlineImages(root) {
  await Promise.all([...root.querySelectorAll('img')].map(async (img) => {
    try {
      img.src = getDisplayImageUrl(img.getAttribute('src') || img.src);
      const response = await fetch(img.src, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`Image request failed: ${response.status}`);
      }
      const blob = await response.blob();
      img.src = await blobToDataUrl(blob);
    } catch {
      try {
        const directUrl = getDirectImageUrl(img.getAttribute('src') || img.src);
        const response = await fetch(directUrl, { mode: 'cors', referrerPolicy: 'no-referrer' });
        if (!response.ok) {
          throw new Error(`Image request failed: ${response.status}`);
        }
        const blob = await response.blob();
        img.src = await blobToDataUrl(blob);
      } catch {
        img.src = await getPlaceholderDataUrl();
      }
    }
  }));
}

let placeholderDataUrl = null;

async function getPlaceholderDataUrl() {
  if (placeholderDataUrl) {
    return placeholderDataUrl;
  }

  try {
    const response = await fetch(PLACEHOLDER_IMAGE);
    const blob = await response.blob();
    placeholderDataUrl = await blobToDataUrl(blob);
  } catch {
    placeholderDataUrl = '';
  }

  return placeholderDataUrl;
}

async function svgToPngBlob(svgBlob, width, height, scale = 2) {
  const svgUrl = URL.createObjectURL(svgBlob);
  try {
    const image = await loadImage(svgUrl);
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(width * scale);
    canvas.height = Math.ceil(height * scale);
    const context = canvas.getContext('2d');
    context.fillStyle = '#0a0a0a';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.scale(scale, scale);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
    if (!blob) {
      throw new Error('Canvas did not create a PNG blob.');
    }

    return blob;
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

function waitForImages(root) {
  const images = [...root.querySelectorAll('img')];
  return Promise.all(images.map((img) => {
    if (img.complete && img.naturalWidth > 0) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const done = () => resolve();
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
      window.setTimeout(done, 4000);
    });
  }));
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function openOutputDialog(title, value, importMode) {
  elements.dialogTitle.textContent = title;
  elements.dialogOutput.hidden = importMode;
  elements.dialogInput.hidden = !importMode;
  elements.applyImportButton.hidden = !importMode;
  elements.dialogOutput.value = value;
  elements.dialogInput.value = '';
  elements.dialog.showModal();

  if (importMode) {
    elements.dialogInput.focus();
  } else {
    elements.dialogOutput.focus();
    elements.dialogOutput.select();
  }
}

function debounce(callback, delay) {
  let timeoutId;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), delay);
  };
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
