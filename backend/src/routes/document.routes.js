const express = require('express');
const upload = require('../middleware/upload.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const {
  summarizeDocument,
  summarizeBatch,
  getCapabilities,
} = require('../controllers/document.controller');

const router = express.Router();

router.get('/capabilities', getCapabilities);
router.post('/summarize', upload.single('document'), asyncHandler(summarizeDocument));
router.post('/summarize-batch', upload.array('documents', 10), asyncHandler(summarizeBatch));

module.exports = router;
