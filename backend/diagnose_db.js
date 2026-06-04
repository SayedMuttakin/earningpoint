const mongoose = require('mongoose');
const GlobalSetting = require('./models/GlobalSetting');
const CartProduct = require('./models/CartProduct');

const MONGO_URI = "mongodb+srv://muttakinrhaman626:muttakinrhaman626@cluster0.wj6adsw.mongodb.net/Zenvio?appName=Cluster0";

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");

    console.log("Querying GlobalSetting...");
    let settings = await GlobalSetting.findOne({ configKey: 'main_config' });
    if (!settings) {
      console.log("No main_config settings found, creating default settings...");
      settings = await GlobalSetting.create({ configKey: 'main_config' });
    }
    console.log("Global Settings retrieved:", JSON.stringify(settings, null, 2));

    console.log("Querying CartProduct...");
    const products = await CartProduct.find({ isActive: true }).sort({ createdAt: -1 });
    console.log(`Found ${products.length} active cart products.`);
    if (products.length > 0) {
      console.log("First product:", JSON.stringify(products[0], null, 2));
    }

  } catch (err) {
    console.error("DIAGNOSTIC CRITICAL ERROR:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

run();
