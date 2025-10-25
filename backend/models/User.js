const database = require('../mongodb');

class User {
  constructor(data) {
    this.id = data._id || data.id;
    this.username = data.username;
    this.password = data.password;
    this.createdAt = data.createdAt;
  }

  static async create(data) {
    try {
      const userData = {
        username: data.username,
        password: data.password,
        createdAt: new Date()
      };
      
      const user = new database.User(userData);
      const savedUser = await user.save();
      return new User(savedUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const user = await database.User.findOne({ username });
      return user ? new User(user) : null;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const user = await database.User.findById(id);
      return user ? new User(user) : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;
