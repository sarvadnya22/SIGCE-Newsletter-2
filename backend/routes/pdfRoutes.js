const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/generate/:newsletterId', pdfController.generatePdf);

module.exports = router;
