const getApiBase = () => {
  if (import.meta.env.DEV) {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:5001`;
    }
    return "http://localhost:5001";
  }
  return typeof window !== 'undefined' ? window.location.origin : '';
};

export const API_BASE = getApiBase();

