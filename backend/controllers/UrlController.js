const UrlService = require('../services/UrlService');
const QrCodeService = require('../services/QrCodeService');

class UrlController {
  static async createShortUrl(req, res) {
    try {
      const { originalUrl, customAlias, expiresAt } = req.body;
      const userId = req.user?.userId; // Get user ID from JWT token
      
      if (!originalUrl) {
        return res.status(400).json({ error: 'Original URL is required' });
      }

      if (!userId) {
        return res.status(401).json({ error: 'User authentication required' });
      }

      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(originalUrl)) {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      const urlData = {
        originalUrl,
        customAlias: customAlias || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        userId: userId
      };

      const result = await UrlService.createShortUrl(urlData);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating short URL:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async getAllUrls(req, res) {
    try {
      
      const userId = req.user?.userId; // Get user ID from JWT token
      
      
      if (!userId) {
        return res.status(401).json({ error: 'User authentication required' });
      }

      const urls = await UrlService.getAllUrlsByUserId(userId);
      
      res.json(urls);
    } catch (error) {
      console.error('Error getting URLs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getUrlById(req, res) {
    try {
      const { id } = req.params;
      const url = await UrlService.getUrlById(id);
      
      if (!url) {
        return res.status(404).json({ error: 'URL not found' });
      }
      
      res.json(url);
    } catch (error) {
      console.error('Error getting URL:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteUrl(req, res) {
    try {
      const { id } = req.params;
      await UrlService.deleteUrl(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting URL:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getClickStats(req, res) {
    try {
      const { id } = req.params;
      const stats = await UrlService.getClickStats(id);
      res.json(stats);
    } catch (error) {
      console.error('Error getting click stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async generateQrCode(req, res) {
    try {
      const { shortCode } = req.params;
      const qrCodeBuffer = await QrCodeService.generateQrCode(shortCode);
      
      res.set({
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="qr-code-${shortCode}.png"`
      });
      
      res.send(qrCodeBuffer);
    } catch (error) {
      console.error('Error generating QR code:', error);
      res.status(500).json({ error: 'Failed to generate QR code' });
    }
  }

  static async generateQrCodeDataUrl(req, res) {
    try {
      const { shortCode } = req.params;
      const dataUrl = await QrCodeService.generateQrCodeDataUrl(shortCode);
      res.json({ qrCodeDataUrl: dataUrl });
    } catch (error) {
      console.error('Error generating QR code data URL:', error);
      res.status(500).json({ error: 'Failed to generate QR code' });
    }
  }
}

module.exports = UrlController;
