const https = require('https');
const dhoni = 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/c/c3/MS_Dhoni_%281%29.jpg';
const rohit = 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/1/1a/Rohit_Sharma_with_the_T20_World_Cup.jpg';

https.get(dhoni, (res) => console.log('Dhoni:', res.statusCode));
https.get(rohit, (res) => console.log('Rohit:', res.statusCode));
