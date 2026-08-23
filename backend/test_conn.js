const mongoose = require("./node_modules/mongoose");

async function test(name, uri) {
  try {
    const c = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 4000 }).asPromise();
    console.log("[OK] " + name);
    const list = await c.db.listCollections().toArray();
    for (let item of list) {
      const cnt = await c.db.collection(item.name).countDocuments();
      console.log("  " + item.name + ": " + cnt);
    }
    await c.close();
  } catch (err) {
    console.log("[FAIL] " + name + ": " + err.message);
  }
}

async function main() {
  await test("Atlas-vnlnlle-Zenvio", "mongodb+srv://muttakinrhaman626:muttakinrhaman626@cluster0.vnlnlle.mongodb.net/Zenvio?retryWrites=true&w=majority");
  await test("Atlas-vnlnlle-earningpoint", "mongodb+srv://muttakinrhaman626:muttakinrhaman626@cluster0.vnlnlle.mongodb.net/earningpoint?retryWrites=true&w=majority");
  await test("Local-zenivio", "mongodb://127.0.0.1:27017/zenivio");
  await test("Local-earningpoint", "mongodb://127.0.0.1:27017/earningpoint");
  process.exit(0);
}
main();
