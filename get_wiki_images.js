const https = require('https');

const athletes = [
  'Lionel Messi',
  'Cristiano Ronaldo',
  'Virat Kohli',
  'MS Dhoni',
  'Neymar',
  'Rohit Sharma',
  'Shakib Al Hasan',
  'Sachin Tendulkar',
  'Luka Modrić',
  'Kylian Mbappé',
  'Babar Azam',
  'Kevin De Bruyne'
];

async function getWikiImage(title) {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=500`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pages[pageId].thumbnail) {
            resolve(pages[pageId].thumbnail.source);
          } else {
            resolve('NO IMAGE');
          }
        } catch (e) {
          resolve('ERROR parsing');
        }
      });
    }).on('error', () => {
      resolve('ERROR');
    });
  });
}

async function run() {
  for (const name of athletes) {
    const img = await getWikiImage(name);
    console.log(`{ id: ${athletes.indexOf(name) + 1}, answer: '${name}', image: '${img}' },`);
    await new Promise(r => setTimeout(r, 1000));
  }
}

run();
