const mongoose = require('mongoose');

class MongoDB {
  constructor() {
    this.connected = false;
    this.Url = null;
    this.ClickStats = null;
    this.User = null;
  }

  async connect() {
    try {
      const connectionString = 'mongodb+srv://punyawat5114_db_ShortURL:1234567890@cluster0.0pnbuxm.mongodb.net/urlshortener?retryWrites=true&w=majority';
      await mongoose.connect(connectionString);
      this.connected = true;
      this.initializeSchemas();
    } catch (error) {
      console.error('MongoDB connection failed:', error);
      throw error;
    }
  }

  initializeSchemas() {
    const urlSchema = new mongoose.Schema({
      originalUrl: { type: String, required: true },
      shortCode: { type: String, required: true, unique: true },
      customAlias: { type: String, default: null },
      clickCount: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now },
      expiresAt: { type: Date, default: null },
      isActive: { type: Boolean, default: true },
      userId: { type: String, required: true }
    });

    const clickStatsSchema = new mongoose.Schema({
      urlId: { type: mongoose.Schema.Types.ObjectId, ref: 'Url', required: true },
      ipAddress: { type: String },
      userAgent: { type: String },
      referer: { type: String },
      clickedAt: { type: Date, default: Date.now }
    });

    const userSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    });

    if (!mongoose.models.Url) {
      this.Url = mongoose.model('Url', urlSchema);
    } else {
      this.Url = mongoose.models.Url;
    }
    
    if (!mongoose.models.ClickStats) {
      this.ClickStats = mongoose.model('ClickStats', clickStatsSchema);
    } else {
      this.ClickStats = mongoose.models.ClickStats;
    }
    
    if (!mongoose.models.User) {
      this.User = mongoose.model('User', userSchema);
    } else {
      this.User = mongoose.models.User;
    }
  }

  async close() {
    if (this.connected) {
      await mongoose.disconnect();
      this.connected = false;
    }
  }
}

module.exports = new MongoDB();
