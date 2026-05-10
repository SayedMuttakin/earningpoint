const https = require('https');

const testUrl = 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg';

https.get(testUrl, (res) => {
  console.log('wsrv.nl status:', res.statusCode);
}).on('error', (e) => {
  console.log('wsrv.nl error:', e);
});
