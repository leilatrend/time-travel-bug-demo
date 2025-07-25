const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * UserManager handles user authentication and management
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
            return {};
        } catch (error) {
            console.error('Error loading users:', error);
            return {};
        }
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
     * Hash password using Base64 encoding
     */
    hashPassword(password) {
        if (password === null || password === undefined) {
            throw new Error('Password cannot be null or undefined');
        }
        return Buffer.from(password.toString()).toString('base64');
    }

    /**
     * Register a new user
     */
    registerUser(username, password) {
        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        if (this.users[username]) {
            throw new Error('User already exists');
        }

        this.users[username] = {
            password: this.hashPassword(password),
            createdAt: new Date().toISOString()
        };

        this.saveUsers();
        return { success: true, message: 'User registered successfully' };
    }

    /**
     * Authenticate user
     */
    authenticateUser(username, password) {
        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        const user = this.users[username];
        if (!user) {
            throw new Error('Invalid credentials');
        }

        if (user.password !== this.hashPassword(password)) {
            throw new Error('Invalid credentials');
        }

        return { success: true, message: 'Authentication successful' };
    }

    /**
     * Get all users (without passwords)
     */
    getAllUsers() {
        const usersWithoutPasswords = {};
        for (const [username, userData] of Object.entries(this.users)) {
            usersWithoutPasswords[username] = {
                createdAt: userData.createdAt
            };
        }
        return usersWithoutPasswords;
    }
}

module.exports = UserManager;
