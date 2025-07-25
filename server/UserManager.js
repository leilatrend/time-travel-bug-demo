const fs = require('fs');
const path = require('path');

class UserManager {
    constructor() {
        this.usersFile = path.join(__dirname, 'data', 'users.json');
        this.ensureUsersFile();
    }

    ensureUsersFile() {
        const dataDir = path.dirname(this.usersFile);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        if (!fs.existsSync(this.usersFile)) {
            fs.writeFileSync(this.usersFile, JSON.stringify([]));
        }
    }

    loadUsers() {
        try {
            const data = fs.readFileSync(this.usersFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    saveUsers(users) {
        fs.writeFileSync(this.usersFile, JSON.stringify(users, null, 2));
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
     * Verify password against hash
     */
    verifyPassword(password, hash) {
        if (password === null || password === undefined) {
            return false;
        }
        return this.hashPassword(password) === hash;
    }

    /**
     * Register a new user
     */
    registerUser(username, password, email) {
        const users = this.loadUsers();
        
        // Check if user already exists
        if (users.find(user => user.username === username)) {
            throw new Error('User already exists');
        }

        // Validate input
        if (!username || !password || !email) {
            throw new Error('Username, password, and email are required');
        }

        const hashedPassword = this.hashPassword(password);
        
        const newUser = {
            id: Date.now(),
            username,
            password: hashedPassword,
            email,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        this.saveUsers(users);
        
        return { id: newUser.id, username: newUser.username, email: newUser.email };
    }

    /**
     * Login user
     */
    loginUser(username, password) {
        const users = this.loadUsers();
        const user = users.find(u => u.username === username);
        
        if (!user) {
            throw new Error('User not found');
        }

        if (!this.verifyPassword(password, user.password)) {
            throw new Error('Invalid password');
        }

        return { id: user.id, username: user.username, email: user.email };
    }

    /**
     * Get user by username
     */
    getUser(username) {
        const users = this.loadUsers();
        const user = users.find(u => u.username === username);
        
        if (!user) {
            return null;
        }

        return { id: user.id, username: user.username, email: user.email };
    }
}

module.exports = UserManager;
