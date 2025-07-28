const fs = require('fs');

class UserManager {
    constructor() {
        this.usersFile = 'users.json';
        this.loadUsers();
    }

    loadUsers() {
        try {
            if (fs.existsSync(this.usersFile)) {
                const data = fs.readFileSync(this.usersFile, 'utf8');
                this.users = JSON.parse(data);
            } else {
                this.users = [];
            }
        } catch (error) {
            console.error('Error loading users:', error);
            this.users = [];
        }
    }

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
        // Add null check to prevent the error
        if (password === null || password === undefined) {
            throw new Error('Password cannot be null or undefined');
        }
        return Buffer.from(password.toString()).toString('base64');
    }

    registerUser(username, password) {
        // Check if user already exists
        if (this.users.find(user => user.username === username)) {
            throw new Error('User already exists');
        }

        // Create new user with hashed password
        const newUser = {
            id: this.users.length + 1,
            username: username,
            password: this.hashPassword(password)
        };

        this.users.push(newUser);
        this.saveUsers();

        return { id: newUser.id, username: newUser.username };
    }

    loginUser(username, password) {
        const user = this.users.find(user => 
            user.username === username && 
            user.password === this.hashPassword(password)
        );

        if (!user) {
            throw new Error('Invalid username or password');
        }

        return { id: user.id, username: user.username };
    }

    getAllUsers() {
        return this.users.map(user => ({
            id: user.id,
            username: user.username
        }));
    }
}

module.exports = UserManager;
