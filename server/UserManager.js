class UserManager {
  constructor() {
    this.users = [];
  }

  registerUser(username, email, password) {
    // Check if user already exists
    const existingUser = this.users.find(user => user.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create new user with hashed password
    const user = {
      id: this.generateId(),
      username,
      email,
      password: this.hashPassword(password),
      createdAt: new Date()
    };

    this.users.push(user);
    return user;
  }

  loginUser(email, password) {
    const user = this.users.find(user => user.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.password !== this.hashPassword(password)) {
      throw new Error('Invalid password');
    }

    return user;
  }

  hashPassword(password) {
    // Add null/undefined check to prevent crash
    if (password === null || password === undefined) {
      throw new Error('Password is required and cannot be null');
    }
    return Buffer.from(password.toString()).toString('base64');
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  getAllUsers() {
    return this.users;
  }
}

module.exports = UserManager;
