const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const GlobalSetting = require('./models/GlobalSetting');
require('dotenv').config();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function optimize() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully.");

    const settings = await GlobalSetting.findOne({ configKey: 'main_config' });
    if (!settings) {
      console.log("Global settings document not found.");
      return;
    }

    let modified = false;

    // Helper to save base64 to file
    const saveBase64Image = (base64Str, prefix, index) => {
      if (!base64Str || !base64Str.startsWith('data:image/')) {
        return base64Str;
      }
      
      try {
        console.log(`Processing base64 image for ${prefix} index ${index}...`);
        const matches = base64Str.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          console.error("Invalid base64 format");
          return base64Str;
        }

        const ext = matches[1];
        const dataBuffer = Buffer.from(matches[2], 'base64');
        const filename = `${prefix}_${Date.now()}_${index}.${ext}`;
        const filepath = path.join(uploadsDir, filename);

        fs.writeFileSync(filepath, dataBuffer);
        console.log(`Successfully saved image to ${filepath} (${dataBuffer.length} bytes)`);
        
        modified = true;
        // Return relative file path/name
        return filename;
      } catch (err) {
        console.error("Failed to save base64 image:", err);
        return base64Str;
      }
    };

    // 1. Check legacy single promoBanner
    if (settings.promoBanner && settings.promoBanner.imageUrl && settings.promoBanner.imageUrl.startsWith('data:image/')) {
      settings.promoBanner.imageUrl = saveBase64Image(settings.promoBanner.imageUrl, 'promo_banner', 0);
    }

    // 2. Check multi-banners
    if (settings.promoBanners && settings.promoBanners.length > 0) {
      for (let i = 0; i < settings.promoBanners.length; i++) {
        const banner = settings.promoBanners[i];
        if (banner.imageUrl && banner.imageUrl.startsWith('data:image/')) {
          banner.imageUrl = saveBase64Image(banner.imageUrl, 'promo_banner', i + 1);
        }
      }
    }

    if (modified) {
      // Mark fields modified for mongoose mixed types if necessary, though these are subdocuments
      settings.markModified('promoBanner');
      settings.markModified('promoBanners');
      await settings.save();
      console.log("✅ Global settings updated and saved to DB successfully!");
    } else {
      console.log("No base64 images found in settings. No changes made.");
    }

  } catch (err) {
    console.error("Critical migration error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

optimize();
