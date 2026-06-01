import {
  getDirectImageUrl,
  getDisplayImageUrl,
  PLACEHOLDER_IMAGE,
} from './image-url.js';

const HTML2CANVAS_URL = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm';
const MAX_EXPORT_SCALE = 3;
const MIN_EXPORT_SCALE = 2;

let html2canvasLoader = null;
let placeholderDataUrl = null;

export async function exportGridAsPng(gridElement) {
  if (!gridElement) {
    throw new Error('Grid element not found.');
  }

  const scale = Math.min(MAX_EXPORT_SCALE, Math.max(MIN_EXPORT_SCALE, window.devicePixelRatio || 2));
  const width = Math.ceil(gridElement.scrollWidth);
  const height = Math.ceil(gridElement.scrollHeight);
  const frame = buildExportFrame(gridElement, width, height);

  const mount = document.createElement('div');
  mount.className = 'export-mount';
  mount.append(frame);
  document.body.append(mount);

  try {
    await document.fonts?.ready;
    await inlineImages(frame);
    await waitForImages(frame);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const html2canvas = await loadHtml2Canvas();
    const canvas = await html2canvas(frame, {
      backgroundColor: null,
      scale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      width: frame.offsetWidth,
      height: frame.offsetHeight,
      windowWidth: frame.scrollWidth,
      windowHeight: frame.scrollHeight,
      onclone: (documentClone) => {
        const clonedFrame = documentClone.querySelector('.export-frame');
        if (clonedFrame) {
          clonedFrame.style.opacity = '1';
        }
      },
    });

    const blob = await canvasToPngBlob(canvas);
    downloadBlob(blob, buildFilename());
    return blob;
  } finally {
    mount.remove();
  }
}

function buildExportFrame(gridElement, width, height) {
  const clone = gridElement.cloneNode(true);
  clone.classList.add('is-exporting');
  clone.style.width = `${width}px`;
  clone.style.maxHeight = 'none';
  clone.style.overflow = 'visible';

  const frame = document.createElement('div');
  frame.className = 'export-frame';

  const header = document.createElement('header');
  header.className = 'export-header';
  header.innerHTML = `
    <p class="export-eyebrow">Ultimate Yo-kai Watch</p>
    <h1 class="export-title">Mis favoritos Yo-kai</h1>
    <p class="export-date">${formatExportDate()}</p>
  `;

  const body = document.createElement('div');
  body.className = 'export-body';
  body.style.width = `${width}px`;
  body.append(clone);

  const footer = document.createElement('footer');
  footer.className = 'export-footer';
  footer.textContent = 'fav-yo-kai-picker';

  frame.append(header, body, footer);
  return frame;
}

function formatExportDate() {
  return new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function buildFilename() {
  const stamp = new Date().toISOString().slice(0, 10);
  return `yokai-favoritos-${stamp}.png`;
}

async function loadHtml2Canvas() {
  if (!html2canvasLoader) {
    html2canvasLoader = import(HTML2CANVAS_URL).then((module) => module.default);
  }

  return html2canvasLoader;
}

async function canvasToPngBlob(canvas) {
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((value) => {
      if (value) {
        resolve(value);
        return;
      }

      reject(new Error('Canvas did not create a PNG blob.'));
    }, 'image/png', 1);
  });

  return blob;
}

async function inlineImages(root) {
  await Promise.all([...root.querySelectorAll('img')].map(async (img) => {
    const source = img.getAttribute('src') || img.src;
    if (!source || source.startsWith('data:')) {
      return;
    }

    try {
      const displayUrl = getDisplayImageUrl(source);
      img.src = await fetchAsDataUrl(displayUrl);
    } catch {
      try {
        const directUrl = getDirectImageUrl(source);
        img.src = await fetchAsDataUrl(directUrl);
      } catch {
        img.src = await getPlaceholderDataUrl();
      }
    }
  }));
}

async function fetchAsDataUrl(url) {
  const response = await fetch(url, { mode: 'cors', referrerPolicy: 'no-referrer' });
  if (!response.ok) {
    throw new Error(`Image request failed: ${response.status}`);
  }

  const blob = await response.blob();
  return blobToDataUrl(blob);
}

async function getPlaceholderDataUrl() {
  if (placeholderDataUrl) {
    return placeholderDataUrl;
  }

  try {
    placeholderDataUrl = await fetchAsDataUrl(PLACEHOLDER_IMAGE);
  } catch {
    placeholderDataUrl = '';
  }

  return placeholderDataUrl;
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
      window.setTimeout(done, 5000);
    });
  }));
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
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
