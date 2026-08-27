const fs = require('fs');
const path = require('path');

let sharp = null;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Sharp image optimization module not loaded in imageOptimizer');
}

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (e) {}
}

/**
 * Converts a raw uploaded file on disk to an ultra-sharp, high-resolution WebP file.
 * Automatically rotates based on EXIF orientation and removes original temp file.
 */
const optimizeUploadedFileToWebp = async (filePath, maxWidth = 2048, maxHeight = 2048, quality = 92) => {
  if (!filePath || !fs.existsSync(filePath)) return null;

  const ext = path.extname(filePath).toLowerCase();
  const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.heic', '.tiff'].includes(ext);

  // If not an image (e.g. video/audio), keep as is
  if (!isImage || !sharp) {
    return path.basename(filePath);
  }

  const baseName = path.basename(filePath, ext);
  const webpFilename = `${baseName}.webp`;
  const webpPath = path.join(uploadsDir, webpFilename);

  try {
    await sharp(filePath)
      .rotate()
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({
        quality: quality,
        effort: 6,
        smartSubsample: true
      })
      .toFile(webpPath);

    // Remove old non-webp file if path differs
    if (path.resolve(filePath) !== path.resolve(webpPath) && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }

    return webpFilename;
  } catch (err) {
    console.error('[imageOptimizer] optimizeUploadedFileToWebp error:', err);
    return path.basename(filePath);
  }
};

/**
 * Saves a base64 image data URL as a pristine high-resolution WebP file on disk.
 * Returns the public image URL: `/api/image?file=...webp`
 */
const saveBase64AsWebp = async (base64Str, prefix = 'image', maxWidth = 1920, maxHeight = 1920, quality = 92) => {
  if (!base64Str || typeof base64Str !== 'string') return base64Str;
  
  // If it's already a URL, return as is
  if (!base64Str.startsWith('data:image/')) {
    return base64Str;
  }

  const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return base64Str;
  }

  try {
    const buffer = Buffer.from(matches[2], 'base64');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${prefix}-${uniqueSuffix}.webp`;
    const filePath = path.join(uploadsDir, filename);

    if (sharp) {
      await sharp(buffer)
        .rotate()
        .resize({
          width: maxWidth,
          height: maxHeight,
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({
          quality: quality,
          effort: 6,
          smartSubsample: true
        })
        .toFile(filePath);
    } else {
      fs.writeFileSync(filePath, buffer);
    }

    return `/api/image?file=${filename}`;
  } catch (err) {
    console.error('[imageOptimizer] saveBase64AsWebp error:', err);
    return base64Str;
  }
};

module.exports = {
  optimizeUploadedFileToWebp,
  saveBase64AsWebp,
  uploadsDir
};