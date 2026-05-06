const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'public', 'favicon.svg');
const assetsDir = path.join(__dirname, 'assets');
const logoPath = path.join(assetsDir, 'logo.png');
const logoDarkPath = path.join(assetsDir, 'logo-dark.png');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

// Convert SVG to high res PNG for capacitor assets
async function buildAssets() {
  try {
    const svgBuffer = fs.readFileSync(svgPath);
    // Resize to a square 1024x1024 to serve as a robust logo source
    await sharp(svgBuffer)
      .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(logoPath);
      
    await sharp(svgBuffer)
      .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(logoDarkPath);
      
    console.log('Successfully generated assets/logo.png from favicon.svg');
  } catch (err) {
    console.error('Error generating assets:', err);
  }
}

buildAssets();
