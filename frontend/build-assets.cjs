const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgPath = path.join(__dirname, 'public', 'applogo.jpeg');
const assetsDir = path.join(__dirname, 'assets');
const logoPath = path.join(assetsDir, 'logo.png');
const logoDarkPath = path.join(assetsDir, 'logo-dark.png');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

// Convert image to high res PNG for capacitor assets
async function buildAssets() {
  try {
    const imgBuffer = fs.readFileSync(imgPath);
    // Resize to a square 1024x1024 to serve as a robust logo source
    await sharp(imgBuffer)
      .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(logoPath);
      
    await sharp(imgBuffer)
      .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(logoDarkPath);
      
    console.log('Successfully generated assets/logo.png from applogo.jpeg');
  } catch (err) {
    console.error('Error generating assets:', err);
  }
}

buildAssets();
