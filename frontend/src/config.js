// Set to true to use your local development server (http://localhost:5001)
// Set to false to use the production server (https://zenivio.it.com)
const USE_LOCAL = false; 

export const API_BASE = USE_LOCAL 
  ? "http://localhost:5001" 
  : "https://zenivio.it.com";
