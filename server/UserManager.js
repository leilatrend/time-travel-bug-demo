const fs = require('fs');
const path = require('path');

class UserManager {
  constructor() {
    this.usersFile = path.join(__dirname, '../data/users.json');
    this.ensureDataDirectory();
  }

  ensureDataDirectory() {
    const dataDir = path.dirname(this.usersFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.usersFile)) {
      fs.writeFileSync(this.usersFile, JSON.stringify([], null, 2));
    }
  }

  loadUsers() {
    try {
      const data = fs.readFileSync(this.usersFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }

  saveUsers(users) {
    try {
      fs.writeFileSync(this.usersFile, JSON.stringify(users, null, 2));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  hashPassword(password) {
    // Fix: Add null/undefined check
    if (password == null) {
      throw new Error('Password cannot be null or undefined');
    }
    return Buffer.from(password.toString()).toString('base64');
  }

  findUserByEmail(email) {
    const users = this.loadUsers();
    return users.find(user => user.email === email);
  }

  validatePassword(plainPassword, hashedPassword) {
    return this.hashPassword(plainPassword) === hashedPassword;
  }

  registerUser(email, password, name) {
    try {
      // Validate input parameters
      if (!email || !password || !name) {
        throw new Error('Email, password, and name are required');
      }

      const users = this.loadUsers();
      
      // Check if user already exists
      if (this.findUserByEmail(email)) {
        throw new Error('User already exists');
      }

      const hashedPassword = this.hashPassword(password);
      
      const newUser = {
        id: Date.now(),
        email,
        password: hashedPassword,
        name,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      this.saveUsers(users);

      return { success: true, message: 'User registered successfully' };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  loginUser(email, password) {
    try {
      const user = this.findUserByEmail(email);
      
      if (!user) {
        throw new Error('User not found');
      }

      if (!this.validatePassword(password, user.password)) {
        throw new Error('Invalid password');
      }

      return { 
        success: true, 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name 
        } 
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
}

module.exports = UserManager;
