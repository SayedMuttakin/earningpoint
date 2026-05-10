const https = require('https');
const urls = [
  'https://upload.wikimedia.org/wikipedia/commons/b/b9/Luka_Modri%C4%87_2022_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/5/57/2019-07-17_SG_Dynamo_Dresden_vs._Paris_Saint-Germain_by_Sandro_Halank%E2%80%93129_%28cropped%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/2/22/Babar_Azam.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/9/90/Kevin_De_Bruyne_201807092.jpg'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(`https://wsrv.nl/?url=${encodeURIComponent(url)}`, (res) => {
      resolve(res.statusCode);
    }).on('error', () => {
      resolve('ERROR');
    });
  });
}

async function run() {
  for (const url of urls) {
    const status = await checkUrl(url);
    console.log(`${url}: ${status}`);
    await new Promise(r => setTimeout(r, 1000));
  }
}
run();
