const fs = require('fs');

class UserManager {
    constructor() {
        this.usersFile = 'users.json';
        this.users = this.loadUsers();
    }

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

    saveUsers() {
        try {
            fs.writeFileSync(this.usersFile, JSON.stringify(this.users, null, 2));
        } catch (error) {
            console.error('Error saving users:', error);
        }
    }

    hashPassword(password) {
        // Fix: Add null/undefined check to prevent crash
        if (password == null) {
            throw new Error('Password cannot be null or undefined');
        }
        return Buffer.from(password.toString()).toString('base64');
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        // Additional validation to ensure password is not null/empty
        if (password == null || password === '') {
            return false;
        }
        return password.length >= 6;
    }

    registerUser(email, password, name) {
        try {
            // Validate inputs
            if (!email || !this.validateEmail(email)) {
                throw new Error('Invalid email format');
            }

            if (!this.validatePassword(password)) {
                throw new Error('Password must be at least 6 characters long and cannot be null');
            }

            if (!name || name.trim() === '') {
                throw new Error('Name is required');
            }

            // Check if user already exists
            if (this.users[email]) {
                throw new Error('User already exists');
            }

            // Hash password (now with null check)
            const hashedPassword = this.hashPassword(password);

            // Create user
            this.users[email] = {
                name: name.trim(),
                password: hashedPassword,
                createdAt: new Date().toISOString()
            };

            this.saveUsers();
            console.log(`User registered successfully: ${email}`);
            return { success: true, message: 'User registered successfully' };

        } catch (error) {
            console.error('Registration failed:', error.message);
            throw error;
        }
    }

    loginUser(email, password) {
        try {
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            const user = this.users[email];
            if (!user) {
                throw new Error('User not found');
            }

            const hashedPassword = this.hashPassword(password);
            if (user.password !== hashedPassword) {
                throw new Error('Invalid password');
            }

            console.log(`User logged in successfully: ${email}`);
            return { success: true, message: 'Login successful', user: { email, name: user.name } };

        } catch (error) {
            console.error('Login failed:', error.message);
            throw error;
        }
    }
}

module.exports = UserManager;
