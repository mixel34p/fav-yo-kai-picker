export const PLACEHOLDER_IMAGE = 'assets/images/yokai/placeholder.png';

const IMGUR_EXTENSION_ORDER = ['', 'jpg', 'jpeg', 'png', 'webp', 'gif'];

export function normalizeImageUrl(value) {
  if (!value) {
    return PLACEHOLDER_IMAGE;
  }

  const rawUrl = String(value)
    .trim()
    .replace(/imgurr\.com/gi, 'imgur.com')
    .replace(/www\.i\.imgur\.com/gi, 'i.imgur.com');
  const cleanUrl = withHttpsProtocol(rawUrl);

  if (/static\.wikia\.nocookie\.net/i.test(cleanUrl)) {
    return cleanUrl.replace(/\/revision\/latest.*$/i, '');
  }

  const imgurUrl = normalizeImgurUrl(cleanUrl);
  if (imgurUrl) {
    return imgurUrl;
  }

  return cleanUrl;
}

/** URL shown in <img src>: direct Imgur/Wikia links (no broken proxy by default). */
export function getDisplayImageUrl(value) {
  return normalizeImageUrl(value);
}

export function getNextImgurFallback(url) {
  const directUrl = getDirectImageUrl(url).split(/[?#]/)[0];
  const match = directUrl.match(/^https:\/\/i\.imgur\.com\/([a-zA-Z0-9]+)(?:\.(png|jpe?g|webp|gif))?$/i);
  if (!match) {
    return null;
  }

  const id = match[1];
  const current = (match[2] || '').toLowerCase();
  const index = IMGUR_EXTENSION_ORDER.indexOf(current);
  const nextExt = IMGUR_EXTENSION_ORDER[index + 1];
  if (nextExt === undefined) {
    return null;
  }

  return nextExt ? `https://i.imgur.com/${id}.${nextExt}` : `https://i.imgur.com/${id}`;
}

/** Optional proxy when direct Imgur is blocked (e.g. hotlink protection). */
export function getImgurProxyUrl(url) {
  const directUrl = getDirectImageUrl(url);
  if (!/^https:\/\/i\.imgur\.com\//i.test(directUrl)) {
    return null;
  }

  const encoded = encodeURIComponent(directUrl.replace(/^https:\/\//i, ''));
  return `https://images.weserv.nl/?url=${encoded}`;
}

export function getDirectImageUrl(value) {
  const rawUrl = String(value || '').trim();
  const proxiedImgurUrl = getProxiedImgurUrl(rawUrl);

  return normalizeImageUrl(proxiedImgurUrl || rawUrl);
}

function withHttpsProtocol(url) {
  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  if (/^(?:www\.)?(?:i\.)?imgur\.com\//i.test(url)) {
    return `https://${url.replace(/^www\./i, '')}`;
  }

  if (/^http:\/\/(?:www\.)?(?:i\.)?imgur\.com\//i.test(url)) {
    return url.replace(/^http:\/\//i, 'https://');
  }

  return url;
}

function normalizeImgurUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
  if (host === 'i.imgur.com') {
    return buildImgurDirectUrl(parsed.pathname);
  }

  if (host !== 'imgur.com') {
    return null;
  }

  const path = parsed.pathname
    .replace(/^\/+/, '')
    .replace(/^(?:gallery|a|t)\//i, '');
  const match = path.match(/^([a-zA-Z0-9]+)(?:\.(png|jpe?g|webp|gif))?/i);

  return match ? buildImgurDirectUrl(`/${match[1]}${match[2] ? `.${match[2]}` : ''}`) : null;
}

function buildImgurDirectUrl(pathname) {
  const path = pathname.replace(/^\/+/, '');
  const match = path.match(/^([a-zA-Z0-9]+)(?:\.(png|jpe?g|webp|gif))?$/i);
  if (!match) {
    return null;
  }

  const ext = match[2]?.toLowerCase();
  return ext ? `https://i.imgur.com/${match[1]}.${ext}` : `https://i.imgur.com/${match[1]}`;
}

function getProxiedImgurUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.hostname.toLowerCase() !== 'images.weserv.nl') {
    return null;
  }

  const proxiedUrl = parsed.searchParams.get('url');
  if (!proxiedUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(proxiedUrl)) {
    return proxiedUrl;
  }

  if (/^i\.imgur\.com\//i.test(proxiedUrl)) {
    return `https://${proxiedUrl}`;
  }

  return `https://${proxiedUrl}`;
}
