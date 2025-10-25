const database = require('../mongodb');

class Url {
  constructor(data) {
    this.id = data._id || data.id;
    this.originalUrl = data.originalUrl;
    this.shortCode = data.shortCode;
    this.customAlias = data.customAlias;
    this.clickCount = data.clickCount || 0;
    this.createdAt = data.createdAt;
    this.expiresAt = data.expiresAt;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.userId = data.userId;
  }

  static async create(data) {
    try {
      const urlData = {
        originalUrl: data.originalUrl,
        shortCode: data.shortCode,
        customAlias: data.customAlias,
        clickCount: 0,
        createdAt: new Date(),
        expiresAt: data.expiresAt,
        isActive: true,
        userId: data.userId
      };
      
      const url = new database.Url(urlData);
      const savedUrl = await url.save();
      return savedUrl._id;
    } catch (error) {
      console.error('❌ Error creating URL:', error);
      throw error;
    }
  }

  static async findByShortCode(shortCode) {
    try {
      const url = await database.Url.findOne({ shortCode, isActive: true });
      return url ? new Url(url) : null;
    } catch (error) {
      console.error('Error finding URL by short code:', error);
      throw error;
    }
  }

  static async findByCustomAlias(customAlias) {
    try {
      const url = await database.Url.findOne({ customAlias, isActive: true });
      return url ? new Url(url) : null;
    } catch (error) {
      console.error('Error finding URL by custom alias:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const url = await database.Url.findById(id);
      return url ? new Url(url) : null;
    } catch (error) {
      console.error('Error finding URL by ID:', error);
      throw error;
    }
  }

  static async findAll() {
    try {
      const urls = await database.Url.find({ isActive: true }).sort({ createdAt: -1 });
      return urls.map(url => new Url(url));
    } catch (error) {
      console.error('Error finding all URLs:', error);
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      
      const urls = await database.Url.find({ userId: userId, isActive: true }).sort({ createdAt: -1 });
      
      const result = urls.map(url => new Url(url));
      
      return result;
    } catch (error) {
      console.error('Error finding URLs by user ID:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await database.Url.findByIdAndDelete(id);
    } catch (error) {
      console.error('Error deleting URL:', error);
      throw error;
    }
  }

  async incrementClickCount() {
    try {
      await database.Url.updateOne({ _id: this.id }, { $inc: { clickCount: 1 } });
      this.clickCount++;
    } catch (error) {
      console.error('Error incrementing click count:', error);
      throw error;
    }
  }

  isExpired() {
    if (!this.expiresAt) return false;
    return new Date(this.expiresAt) < new Date();
  }

  toJSON() {
    return {
      id: this.id,
      originalUrl: this.originalUrl,
      shortCode: this.shortCode,
      customAlias: this.customAlias,
      clickCount: this.clickCount,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      isActive: this.isActive
    };
  }
}

module.exports = Url;
