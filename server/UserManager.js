/**
 * User Manager for handling user authentication and management
 */
class UserManager {
    constructor() {
        this.users = new Map();
        this.sessions = new Map();
    }

    /**
     * Register a new user
     */
    registerUser(username, password, email) {
        if (this.users.has(username)) {
            throw new Error('Username already exists');
        }

        const hashedPassword = this.hashPassword(password);
        const user = {
            username,
            password: hashedPassword,
            email,
            createdAt: new Date(),
            isActive: true
        };

        this.users.set(username, user);
        return { success: true, message: 'User registered successfully' };
    }

    /**
     * Hash password using Base64 encoding
     */
    hashPassword(password) {
        // Add null check to prevent toString() error
        if (password === null || password === undefined) {
            throw new Error('Password cannot be null or undefined');
        }
        return Buffer.from(password.toString()).toString('base64');
    }

    /**
     * Authenticate user login
     */
    authenticateUser(username, password) {
        const user = this.users.get(username);
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        const hashedPassword = this.hashPassword(password);
        if (user.password === hashedPassword) {
            const sessionId = this.generateSessionId();
            this.sessions.set(sessionId, { username, createdAt: new Date() });
            return { success: true, sessionId, message: 'Login successful' };
        }

        return { success: false, message: 'Invalid credentials' };
    }

    /**
     * Generate session ID
     */
    generateSessionId() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    /**
     * Validate session
     */
    validateSession(sessionId) {
        return this.sessions.has(sessionId);
    }

    /**
     * Logout user
     */
    logout(sessionId) {
        this.sessions.delete(sessionId);
        return { success: true, message: 'Logged out successfully' };
    }

    /**
     * Get user profile
     */
    getUserProfile(username) {
        const user = this.users.get(username);
        if (!user) {
            return null;
        }

        return {
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            isActive: user.isActive
        };
    }
}

module.exports = UserManager;
