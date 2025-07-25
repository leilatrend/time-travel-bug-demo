const fs = require('fs').promises;
const path = require('path');
const Logger = require('./Logger');

class UserManager {
    constructor() {
        this.usersFile = path.join(__dirname, 'data', 'users.json');
        this.initializeUsersFile();
    }

    async initializeUsersFile() {
        try {
            const dataDir = path.dirname(this.usersFile);
            await fs.mkdir(dataDir, { recursive: true });
            
            // Check if file exists, if not create it with empty array
            try {
                await fs.access(this.usersFile);
            } catch (error) {
                await fs.writeFile(this.usersFile, JSON.stringify([], null, 2));
            }
        } catch (error) {
            Logger.error('Failed to initialize users file', error);
        }
    }

    async getUsers() {
        try {
            const data = await fs.readFile(this.usersFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            Logger.error('Failed to read users file', error);
            return [];
        }
    }

    hashPassword(password) {
        // Add null/undefined checks before calling toString()
        if (password === null || password === undefined) {
            throw new Error('Password cannot be null or undefined');
        }
        return Buffer.from(password.toString()).toString('base64');
    }

    async saveUsers(users) {
        try {
            await fs.writeFile(this.usersFile, JSON.stringify(users, null, 2));
        } catch (error) {
            Logger.error('Failed to save users file', error);
            throw error;
        }
    }

    async findUserByEmail(email) {
        const users = await this.getUsers();
        return users.find(user => user.email === email);
    }

    async validateUser(email, password) {
        try {
            const user = await this.findUserByEmail(email);
            if (!user) {
                return false;
            }

            const hashedPassword = this.hashPassword(password);
            return user.password === hashedPassword;
        } catch (error) {
            Logger.error('User validation failed', error);
            return false;
        }
    }

    async registerUser(userData) {
        try {
            Logger.info('User registration attempt', { email: userData.email });

            // Validate required fields
            if (!userData.email || !userData.password) {
                throw new Error('Email and password are required');
            }

            // Add null check for password
            if (userData.password === null || userData.password === undefined) {
                throw new Error('Password cannot be null or undefined');
            }

            // Check if user already exists
            const existingUser = await this.findUserByEmail(userData.email);
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // Hash the password
            const hashedPassword = this.hashPassword(userData.password);

            // Create new user
            const newUser = {
                id: Date.now(),
                email: userData.email,
                password: hashedPassword,
                createdAt: new Date().toISOString()
            };

            // Add user to the list
            const users = await this.getUsers();
            users.push(newUser);
            await this.saveUsers(users);

            Logger.info('User registered successfully', { email: userData.email });
            return { success: true, user: { id: newUser.id, email: newUser.email } };

        } catch (error) {
            Logger.error('User registration failed', error);
            throw error;
        }
    }
}

module.exports = UserManager;
