const fs = require('fs');
const path = require('path');

/**
 * UserManager handles user registration, authentication, and management
 * Created as part of the user management system feature
 */
class UserManager {
  constructor() {
    this.usersFile = path.join(__dirname, 'users.json');
    this.users = this.loadUsers();
  }

  /**
   * Load users from file
   */
  loadUsers() {
    try {
      if (fs.existsSync(this.usersFile)) {
        const data = fs.readFileSync(this.usersFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
    return [];
  }

  /**
   * Save users to file
   */
  saveUsers() {
    try {
      fs.writeFileSync(this.usersFile, JSON.stringify(this.users, null, 2));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  /**
   * Hash password (simple implementation for demo)
   */
  hashPassword(password) {
    // Fix: Add null/undefined check before calling toString()
    if (password == null) {
      throw new Error('Password cannot be null or undefined');
    }
    return Buffer.from(password.toString()).toString('base64');
  }

  /**
   * Verify password
   */
  verifyPassword(password, hashedPassword) {
    return this.hashPassword(password) === hashedPassword;
  }

  /**
   * Register a new user
   */
  registerUser(userData) {
    try {
      // Validate required fields
      if (!userData.username || !userData.email) {
        throw new Error('Username and email are required');
      }

      // Check if user already exists
      const existingUser = this.users.find(
        user => user.username === userData.username || user.email === userData.email
      );

      if (existingUser) {
        throw new Error('User with this username or email already exists');
      }

      // Create new user
      const newUser = {
        id: this.generateUserId(),
        username: userData.username,
        email: userData.email,
        createdAt: new Date().toISOString(),
        isActive: true
      };

      // Hash password and add to user object
      const hashedPassword = this.hashPassword(userData.password);
      newUser.password = hashedPassword;

      // Add user to collection
      this.users.push(newUser);
      this.saveUsers();

      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;

    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Authenticate user
   */
  authenticateUser(username, password) {
    try {
      const user = this.users.find(u => u.username === username);
      
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.isActive) {
        throw new Error('User account is inactive');
      }

      if (!this.verifyPassword(password, user.password)) {
        throw new Error('Invalid password');
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;

    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  getUserById(userId) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  /**
   * Generate unique user ID
   */
  generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get all users (without passwords)
   */
  getAllUsers() {
    return this.users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  /**
   * Delete user
   */
  deleteUser(userId) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    this.users.splice(userIndex, 1);
    this.saveUsers();
    return true;
  }

  /**
   * Update user
   */
  updateUser(userId, updateData) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Don't allow updating certain fields
    const allowedFields = ['email', 'isActive'];
    const filteredData = {};
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    // Update user
    this.users[userIndex] = { ...this.users[userIndex], ...filteredData };
    this.saveUsers();

    // Return updated user without password
    const { password, ...userWithoutPassword } = this.users[userIndex];
    return userWithoutPassword;
  }
}

module.exports = UserManager;
