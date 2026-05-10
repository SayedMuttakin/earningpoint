const https = require('https');

const gkQuizDB = [
  { id: 1, image: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg', answer: 'Lionel Messi' },
  { id: 2, image: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg', answer: 'Cristiano Ronaldo' },
  { id: 3, image: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Virat_Kohli.jpg', answer: 'Virat Kohli' },
  { id: 4, image: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/MS_Dhoni_%281%29.jpg', answer: 'MS Dhoni' },
  { id: 5, image: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Neymar_Jr._with_Al_Hilal%2C_3_October_2023_-_03_%28cropped%29.jpg', answer: 'Neymar Jr' },
  { id: 6, image: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Rohit_Sharma_with_the_T20_World_Cup.jpg', answer: 'Rohit Sharma' },
  { id: 7, image: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Shakib_Al_Hasan_2018.jpg', answer: 'Shakib Al Hasan' },
  { id: 8, image: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Sachin-Tendulkar_%28cropped%29.jpg', answer: 'Sachin Tendulkar' },
  { id: 9, image: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Luka_Modri%C4%87_2022_%28cropped%29.jpg', answer: 'Luka Modric' },
  { id: 10, image: 'https://upload.wikimedia.org/wikipedia/commons/5/57/2019-07-17_SG_Dynamo_Dresden_vs._Paris_Saint-Germain_by_Sandro_Halank%E2%80%93129_%28cropped%29.jpg', answer: 'Kylian Mbappe' },
  { id: 11, image: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Babar_Azam.jpg', answer: 'Babar Azam' },
  { id: 12, image: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Kevin_De_Bruyne_201807092.jpg', answer: 'Kevin De Bruyne' }
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve(res.statusCode);
    }).on('error', () => {
      resolve('ERROR');
    });
  });
}

async function run() {
  for (const item of gkQuizDB) {
    const status = await checkUrl(item.image);
    console.log(`${item.answer}: ${status}`);
  }
}

run();
