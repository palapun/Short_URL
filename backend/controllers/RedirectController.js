const UrlService = require('../services/UrlService');

class RedirectController {
  static async redirectToOriginalUrl(req, res) {
    try {
      const { shortCode } = req.params;
      const url = await UrlService.getOriginalUrl(shortCode);
      
      if (!url) {
        return res.status(404).json({ error: 'Short URL not found' });
      }

      if (url.isExpired()) {
        return res.status(410).json({ error: 'URL has expired' });
      }

      if (!url.isActive) {
        return res.status(410).json({ error: 'URL is no longer active' });
      }

      const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
      const userAgent = req.get('User-Agent');
      const referer = req.get('Referer');

      await UrlService.recordClick(url, ipAddress, userAgent, referer);

      res.redirect(302, url.originalUrl);
    } catch (error) {
      console.error('Error redirecting:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = RedirectController;
