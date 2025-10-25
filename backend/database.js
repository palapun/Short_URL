const mysql = require('mysql2/promise');
const config = require('./config');

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection({
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password,
        database: config.database.name,
        charset: 'utf8mb4'
      });
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  async query(sql, params = []) {
    try {
      const [rows] = await this.connection.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query failed:', error);
      throw error;
    }
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
    }
  }
}

module.exports = new Database();
