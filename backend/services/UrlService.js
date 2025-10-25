const Url = require('../models/Url');
const ClickStats = require('../models/ClickStats');
const config = require('../config');

class UrlService {
  static generateShortCode() {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < config.app.shortUrlLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  static async createShortUrl(data) {
    let shortCode;
    
    if (data.customAlias && data.customAlias.trim()) {
      const existingUrl = await Url.findByCustomAlias(data.customAlias);
      if (existingUrl && existingUrl.userId !== data.userId) {
        throw new Error('Custom alias already exists');
      }
      if (existingUrl && existingUrl.userId === data.userId) {
      }
      shortCode = data.customAlias;
    } else {
      do {
        shortCode = this.generateShortCode();
        const existingUrl = await Url.findByShortCode(shortCode);
        if (!existingUrl) break;
      } while (true);
    }

    const urlData = {
      originalUrl: data.originalUrl,
      shortCode: shortCode,
      customAlias: data.customAlias,
      expiresAt: data.expiresAt,
      userId: data.userId
    };

    const urlId = await Url.create(urlData);
    const url = await Url.findById(urlId);
    
    return {
      ...url.toJSON(),
      shortUrl: `${config.app.baseUrl}/${url.shortCode}`
    };
  }

  static async getOriginalUrl(shortCode) {
    const url = await Url.findByShortCode(shortCode);
    if (!url) return null;
    
    if (url.isExpired()) {
      return null;
    }
    
    return url;
  }

  static async recordClick(url, ipAddress, userAgent, referer) {
    await ClickStats.create({
      urlId: url.id,
      ipAddress: ipAddress,
      userAgent: userAgent,
      referer: referer
    });
    
    await url.incrementClickCount();
  }

  static async getAllUrls() {
    const urls = await Url.findAll();
    return urls.map(url => ({
      ...url.toJSON(),
      shortUrl: `${config.app.baseUrl}/${url.shortCode}`
    }));
  }

  static async getAllUrlsByUserId(userId) {
    const urls = await Url.findByUserId(userId);
    
    const result = urls.map(url => ({
      ...url.toJSON(),
      shortUrl: `${config.app.baseUrl}/${url.shortCode}`
    }));
    
    return result;
  }

  static async getUrlById(id) {
    const url = await Url.findById(id);
    if (!url) return null;
    
    return {
      ...url.toJSON(),
      shortUrl: `${config.app.baseUrl}/${url.shortCode}`
    };
  }

  static async deleteUrl(id) {
    await Url.delete(id);
  }

  static async getClickStats(urlId) {
    return await ClickStats.findByUrlId(urlId);
  }
}

module.exports = UrlService;
