const multer = require('multer');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/bmp',
  'image/tiff',
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    cb(null, `dsa-${uuidv4()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    const err = new Error(
      `Unsupported file type "${file.mimetype}". Upload a PDF or an image (PNG, JPG, WEBP, BMP, TIFF).`
    );
    err.status = 400;
    return cb(err);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSizeMb * 1024 * 1024,
    files: 10, 
  },
});

module.exports = upload;
