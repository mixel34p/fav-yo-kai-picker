import {
  getDirectImageUrl,
  getDisplayImageUrl,
  PLACEHOLDER_IMAGE,
} from './image-url.js';

const HTML2CANVAS_SRC = new URL('../vendor/html2canvas.min.js', import.meta.url).href;
const EXPORT_SCALE = 2;
const DESKTOP_GAME_WIDTH = 96;
const DESKTOP_TRIBE_WIDTH = 96;
const DESKTOP_FAVORITE_WIDTH = 132;

let html2canvasLoader = null;
let placeholderDataUrl = null;

export async function exportGridAsPng(gridElement) {
  if (!gridElement) {
    throw new Error('Grid element not found.');
  }

  const width = getDesktopExportWidth(gridElement);
  const frame = buildExportFrame(gridElement, width);

  const mount = document.createElement('div');
  mount.className = 'export-mount export-mount--capture';
  mount.append(frame);
  document.body.append(mount);

  try {
    await document.fonts?.ready;
    await inlineImages(frame);
    await waitForImages(frame);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const html2canvas = await loadHtml2Canvas();
    const captureWidth = frame.offsetWidth || frame.scrollWidth;
    const captureHeight = frame.offsetHeight || frame.scrollHeight;

    const canvas = await html2canvas(frame, {
      backgroundColor: '#0b0b10',
      scale: EXPORT_SCALE,
      useCORS: true,
      allowTaint: false,
      logging: false,
      width: captureWidth,
      height: captureHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: captureWidth,
      windowHeight: captureHeight,
      foreignObjectRendering: false,
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Empty canvas from html2canvas.');
    }

    const pngBlob = await canvasToPngBlob(canvas);
    downloadPng(pngBlob, buildFilename());
    return pngBlob;
  } finally {
    mount.remove();
  }
}

function buildExportFrame(gridElement, width) {
  const clone = gridElement.cloneNode(true);
  clone.classList.add('is-exporting');
  clone.style.width = `${width}px`;
  clone.style.maxHeight = 'none';
  clone.style.overflow = 'visible';
  clone.style.setProperty('--game-width', `${DESKTOP_GAME_WIDTH}px`);
  clone.style.setProperty('--tribe-width', `${DESKTOP_TRIBE_WIDTH}px`);
  clone.style.setProperty('--favorite-width', `${DESKTOP_FAVORITE_WIDTH}px`);

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

function getDesktopExportWidth(gridElement) {
  const tribeCount = gridElement.querySelectorAll('.matrix .tribe-header').length;
  const matrixWidth = DESKTOP_GAME_WIDTH + (tribeCount * DESKTOP_TRIBE_WIDTH) + DESKTOP_FAVORITE_WIDTH;
  return Math.max(matrixWidth, DESKTOP_GAME_WIDTH + DESKTOP_FAVORITE_WIDTH);
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

function loadHtml2Canvas() {
  if (window.html2canvas) {
    return Promise.resolve(window.html2canvas);
  }

  if (!html2canvasLoader) {
    html2canvasLoader = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-html2canvas]');
      if (existing) {
        existing.addEventListener('load', () => {
          if (window.html2canvas) {
            resolve(window.html2canvas);
          } else {
            reject(new Error('html2canvas loaded but is unavailable.'));
          }
        }, { once: true });
        existing.addEventListener('error', () => reject(new Error('html2canvas script failed.')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = HTML2CANVAS_SRC;
      script.async = true;
      script.dataset.html2canvas = 'true';
      script.onload = () => {
        if (window.html2canvas) {
          resolve(window.html2canvas);
          return;
        }

        reject(new Error('html2canvas loaded but is unavailable.'));
      };
      script.onerror = () => reject(new Error(`Could not load html2canvas from ${HTML2CANVAS_SRC}`));
      document.head.append(script);
    });
  }

  return html2canvasLoader;
}

async function canvasToPngBlob(canvas) {
  const fromBlob = await new Promise((resolve) => {
    if (!canvas.toBlob) {
      resolve(null);
      return;
    }

    canvas.toBlob((value) => resolve(value), 'image/png', 1);
  });

  if (fromBlob && fromBlob.type === 'image/png') {
    return fromBlob;
  }

  const dataUrl = canvas.toDataURL('image/png');
  if (!dataUrl.startsWith('data:image/png')) {
    throw new Error('Canvas did not produce PNG data.');
  }

  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new Blob([blob], { type: 'image/png' });
}

function downloadPng(blob, filename) {
  const pngBlob = blob.type === 'image/png'
    ? blob
    : new Blob([blob], { type: 'image/png' });

  const url = URL.createObjectURL(pngBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  link.type = 'image/png';
  link.rel = 'noopener';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function inlineImages(root) {
  await Promise.all([...root.querySelectorAll('img')].map(async (img) => {
    const source = img.getAttribute('src') || img.src;
    if (!source || source.startsWith('data:')) {
      return;
    }

    try {
      const displayUrl = getDisplayImageUrl(source);
      img.src = await fetchAsPngDataUrl(displayUrl);
    } catch {
      try {
        const directUrl = getDirectImageUrl(source);
        img.src = await fetchAsPngDataUrl(directUrl);
      } catch {
        img.src = await getPlaceholderDataUrl();
      }
    }
  }));
}

async function fetchAsPngDataUrl(url) {
  const response = await fetch(url, { mode: 'cors', referrerPolicy: 'no-referrer' });
  if (!response.ok) {
    throw new Error(`Image request failed: ${response.status}`);
  }

  const blob = await response.blob();
  return rasterizeBlobAsPngDataUrl(blob);
}

async function getPlaceholderDataUrl() {
  if (placeholderDataUrl) {
    return placeholderDataUrl;
  }

  try {
    placeholderDataUrl = await fetchAsPngDataUrl(PLACEHOLDER_IMAGE);
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

async function rasterizeBlobAsPngDataUrl(blob) {
  const objectUrl = URL.createObjectURL(blob);

  try {
    return await rasterizeImageAsPngDataUrl(objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function rasterizeImageAsPngDataUrl(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;

      if (!width || !height) {
        reject(new Error('Image has no drawable size.'));
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Could not create PNG canvas.'));
        return;
      }

      try {
        context.drawImage(image, 0, 0, width, height);
      } catch (error) {
        reject(error);
        return;
      }

      if (!canvas.toBlob) {
        const dataUrl = canvas.toDataURL('image/png');
        if (!dataUrl.startsWith('data:image/png')) {
          reject(new Error('Image did not rasterize as PNG.'));
          return;
        }

        resolve(dataUrl);
        return;
      }

      try {
        canvas.toBlob((pngBlob) => {
          if (!pngBlob || pngBlob.type !== 'image/png') {
            reject(new Error('Image did not rasterize as PNG.'));
            return;
          }

          blobToDataUrl(pngBlob).then(resolve, reject);
        }, 'image/png');
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = () => reject(new Error('Image could not be loaded for PNG export.'));
    image.src = src;
  });
}
