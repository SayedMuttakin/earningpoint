const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Setup storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save files to the uploads directory
    const uploadPath = path.join(__dirname, '../uploads');
    // Ensure the directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename: prefix + hash + original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to allow images, videos, and audio (voice messages)
const fileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png|gif|webp|mp4|webm|ogg|mov|wav|mp3|m4a|aac|opus|3gp|oga/;
  const extname = allowedExts.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('image/') || 
                   file.mimetype.startsWith('video/') || 
                   file.mimetype.startsWith('audio/');

  if (mimetype || extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images, Videos, or Audio Only!'));
  }
};

// Initialize upload variable
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter
});

module.exports = upload;
