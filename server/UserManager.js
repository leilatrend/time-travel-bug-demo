const fs = require('fs').promises;
const path = require('path');

class UserManager {
    constructor() {
        this.users = new Map();
        this.userDataFile = path.join(__dirname, 'users.json');
        this.loadUsers();
    }

    async loadUsers() {
        try {
            const data = await fs.readFile(this.userDataFile, 'utf8');
            const usersArray = JSON.parse(data);
            this.users = new Map(usersArray.map(user => [user.username, user]));
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('Error loading users:', error);
            }
        }
    }

    async saveUsers() {
        try {
            const usersArray = Array.from(this.users.values());
            await fs.writeFile(this.userDataFile, JSON.stringify(usersArray, null, 2));
        } catch (error) {
            console.error('Error saving users:', error);
        }
    }

    hashPassword(password) {
        // Fix: Add null/undefined check before calling toString()
        if (password === null || password === undefined) {
            throw new Error('Password cannot be null or undefined');
        }
        // Additional check for empty string
        if (password === '') {
            throw new Error('Password cannot be empty');
        }
        return Buffer.from(password.toString()).toString('base64');
    }

    async registerUser(username, email, password) {
        try {
            // Validate input parameters
            if (!username || !email || !password) {
                throw new Error('Username, email, and password are required');
            }

            if (this.users.has(username)) {
                throw new Error('User already exists');
            }

            const hashedPassword = this.hashPassword(password);
            const user = {
                username,
                email,
                password: hashedPassword,
                createdAt: new Date().toISOString()
            };

            this.users.set(username, user);
            await this.saveUsers();
            return { success: true, message: 'User registered successfully' };
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async loginUser(username, password) {
        try {
            // Validate input parameters
            if (!username || !password) {
                throw new Error('Username and password are required');
            }

            const user = this.users.get(username);
            if (!user) {
                throw new Error('User not found');
            }

            const hashedPassword = this.hashPassword(password);
            if (user.password !== hashedPassword) {
                throw new Error('Invalid password');
            }

            return { success: true, message: 'Login successful', user: { username, email: user.email } };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    getUserByUsername(username) {
        const user = this.users.get(username);
        if (user) {
            // Return user without password
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    }

    getAllUsers() {
        return Array.from(this.users.values()).map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }
}

module.exports = UserManager;
