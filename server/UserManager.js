const fs = require('fs');
const path = require('path');

/**
 * UserManager class handles user registration, authentication, and data persistence
 */
class UserManager {
    constructor() {
        this.usersFile = path.join(__dirname, 'users.json');
        this.users = this.loadUsers();
    }

    /**
     * Load users from JSON file
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
        return {};
    }

    /**
     * Save users to JSON file
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
        // Add null/undefined validation to prevent TypeError
        if (password === null || password === undefined) {
            throw new Error('Password cannot be null or undefined');
        }
        // Additional check for empty string
        if (password === '') {
            throw new Error('Password cannot be empty');
        }
        return Buffer.from(password.toString()).toString('base64');
    }

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Register a new user
     */
    registerUser(email, password, name) {
        // Input validation
        if (!email || !password || !name) {
            throw new Error('Email, password, and name are required');
        }

        if (!this.isValidEmail(email)) {
            throw new Error('Invalid email format');
        }

        if (this.users[email]) {
            throw new Error('User already exists');
        }

        try {
            const hashedPassword = this.hashPassword(password);
            this.users[email] = {
                name: name,
                password: hashedPassword,
                createdAt: new Date().toISOString()
            };
            this.saveUsers();
            return { success: true, message: 'User registered successfully' };
        } catch (error) {
            throw new Error(`Registration failed: ${error.message}`);
        }
    }

    /**
     * Authenticate user
     */
    authenticateUser(email, password) {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        const user = this.users[email];
        if (!user) {
            throw new Error('User not found');
        }

        try {
            const hashedPassword = this.hashPassword(password);
            if (user.password === hashedPassword) {
                return { success: true, user: { email, name: user.name } };
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            throw new Error(`Authentication failed: ${error.message}`);
        }
    }

    /**
     * Get user by email
     */
    getUser(email) {
        const user = this.users[email];
        if (user) {
            return { email, name: user.name, createdAt: user.createdAt };
        }
        return null;
    }

    /**
     * Get all users (without passwords)
     */
    getAllUsers() {
        return Object.keys(this.users).map(email => ({
            email,
            name: this.users[email].name,
            createdAt: this.users[email].createdAt
        }));
    }
}

module.exports = UserManager;
