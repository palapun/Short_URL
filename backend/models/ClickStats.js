const database = require('../mongodb');

class ClickStats {
  constructor(data) {
    this.id = data._id || data.id;
    this.urlId = data.urlId;
    this.ipAddress = data.ipAddress;
    this.userAgent = data.userAgent;
    this.referer = data.referer;
    this.clickedAt = data.clickedAt;
  }

  static async create(data) {
    try {
      const clickData = {
        urlId: data.urlId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        referer: data.referer,
        clickedAt: new Date()
      };
      
      const clickStats = new database.ClickStats(clickData);
      const savedClickStats = await clickStats.save();
      return savedClickStats._id;
    } catch (error) {
      console.error('Error creating click stats:', error);
      throw error;
    }
  }

  static async findByUrlId(urlId) {
    try {
      const clickStats = await database.ClickStats.find({ urlId }).sort({ clickedAt: -1 });
      return clickStats.map(click => new ClickStats(click));
    } catch (error) {
      console.error('Error finding click stats by URL ID:', error);
      throw error;
    }
  }

  static async getClickCountByUrlId(urlId) {
    try {
      const count = await database.ClickStats.countDocuments({ urlId });
      return count;
    } catch (error) {
      console.error('Error getting click count by URL ID:', error);
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      urlId: this.urlId,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      referer: this.referer,
      clickedAt: this.clickedAt
    };
  }
}

module.exports = ClickStats;
