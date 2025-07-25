class UserManager {
    constructor() {
        this.users = new Map();
        this.sessions = new Map();
    }

    hashPassword(password) {
        if (!password) {
            throw new Error('Password is required');
        }
        return Buffer.from(password.toString()).toString('base64');
    }

    generateSessionId() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    registerUser(username, password) {
        if (this.users.has(username)) {
            throw new Error('User already exists');
        }

        const hashedPassword = this.hashPassword(password);
        this.users.set(username, {
            username,
            password: hashedPassword,
            createdAt: new Date()
        });

        return { success: true, message: 'User registered successfully' };
    }

    loginUser(username, password) {
        const user = this.users.get(username);
        if (!user) {
            throw new Error('User not found');
        }

        const hashedPassword = this.hashPassword(password);
        if (user.password !== hashedPassword) {
            throw new Error('Invalid password');
        }

        const sessionId = this.generateSessionId();
        this.sessions.set(sessionId, {
            username,
            loginTime: new Date()
        });

        return { success: true, sessionId, message: 'Login successful' };
    }

    validateSession(sessionId) {
        return this.sessions.has(sessionId);
    }

    logoutUser(sessionId) {
        if (this.sessions.delete(sessionId)) {
            return { success: true, message: 'Logout successful' };
        }
        throw new Error('Invalid session');
    }
}

module.exports = UserManager;
