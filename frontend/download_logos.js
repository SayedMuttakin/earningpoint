const fs = require('fs');
const path = require('path');

const download = async (url, filename) => {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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

fs.mkdirSync('public/logos', { recursive: true });
download('https://upload.wikimedia.org/wikipedia/commons/thumb/u/u/bKash_logo.svg/512px-bKash_logo.svg.png', 'bkash.png');
download('https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Rocket_Mobile_Banking_Logo.svg/512px-Rocket_Mobile_Banking_Logo.svg.png', 'rocket.png');
