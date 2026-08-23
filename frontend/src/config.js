const getApiBase = () => {
  if (import.meta.env.DEV) {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:5001`;
    }
    return "http://localhost:5001";
  }

  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1') && !origin.includes('capacitor')) {
      return origin;
    }
  }

  return 'https://zenivio.it.com';
};

export const API_BASE = getApiBase();

export const getImageUrl = (url, width) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const widthParam = width ? `&w=${width}` : '';
  if (url.startsWith('/')) {
    return `${API_BASE}${url}${widthParam}`;
  }
  return `${API_BASE}/api/image?file=${encodeURIComponent(url)}${widthParam}`;
};

