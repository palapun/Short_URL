require('dotenv').config();

module.exports = {
  database: {
    type: 'mongodb',
    connectionString: process.env.MONGODB_URI || 'mongodb+srv://punyawat5114_db_ShortURL:1234567890@cluster0.0pnbuxm.mongodb.net/urlshortener?retryWrites=true&w=majority'
  },
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development'
  },
  app: {
    baseUrl: process.env.BASE_URL || 'http://localhost:5000',
    shortUrlLength: parseInt(process.env.SHORT_URL_LENGTH) || 6
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-here'
  }
};
