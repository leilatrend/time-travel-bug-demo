class UserManager {
    constructor() {
        this.users = new Map();
        this.sessions = new Map();
    }

    registerUser(username, password, email) {
        if (this.users.has(username)) {
            throw new Error('Username already exists');
        }

        const hashedPassword = this.hashPassword(password);
        this.users.set(username, {
            username,
            password: hashedPassword,
            email,
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
            throw new Error('Invalid credentials');
        }

        const sessionId = this.generateSessionId();
        this.sessions.set(sessionId, { username, loginTime: new Date() });
        
        return { sessionId, user: { username: user.username, email: user.email } };
    }

    hashPassword(password) {
        if (password === null || password === undefined) {
            throw new Error('Password cannot be null or undefined');
        }
        return Buffer.from(password.toString()).toString('base64');
    }

    generateSessionId() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    validateSession(sessionId) {
        return this.sessions.has(sessionId);
    }

    logoutUser(sessionId) {
        this.sessions.delete(sessionId);
        return { success: true, message: 'Logged out successfully' };
    }
}

module.exports = UserManager;
