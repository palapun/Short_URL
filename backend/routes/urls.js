const express = require('express');
const UrlController = require('../controllers/UrlController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/', authMiddleware, UrlController.createShortUrl);

router.get('/', authMiddleware, UrlController.getAllUrls);

router.get('/:id', authMiddleware, UrlController.getUrlById);

router.delete('/:id', authMiddleware, UrlController.deleteUrl);

router.get('/:id/stats', UrlController.getClickStats);

router.get('/:shortCode/qr', UrlController.generateQrCode);

router.get('/:shortCode/qr-data', UrlController.generateQrCodeDataUrl);

module.exports = router;
