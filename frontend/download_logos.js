import fs from 'fs';
import path from 'path';

const download = async (url, filename) => {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(path.join('public', 'logos', filename), Buffer.from(buffer));
    console.log('Downloaded ' + filename);
  } catch (err) {
    console.error('Failed to download ' + filename, err);
  }
}

// Make sure target directory exists
fs.mkdirSync('public/logos', { recursive: true });

await download('https://download.logo.wine/logo/BKash/BKash-Logo.wine.png', 'bkash.png');
await download('https://upload.wikimedia.org/wikipedia/commons/e/e9/Rocket_ddbl.png', 'rocket.png');
await download('https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png', 'nagad.png');
await download('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Upay_logo.svg/512px-Upay_logo.svg.png', 'upay.png');
