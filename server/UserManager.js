class UserManager {
    constructor() {
        this.users = new Map();
        this.sessions = new Map();
    }

    // Generate a simple session token
    generateSessionToken() {
        return Math.random().toString(36).substring(2, 15) +
               Math.random().toString(36).substring(2, 15);
    }

    // Simple password hashing (base64 encoding for demo purposes)
    hashPassword(password) {
        // Add null/undefined check to prevent TypeError
        if (password === null || password === undefined) {
            throw new Error('Password cannot be null or undefined');
        }
        // Additional check for empty string or non-string types
        if (typeof password !== 'string' || password.trim() === '') {
            throw new Error('Password must be a non-empty string');
        }
        return Buffer.from(password.toString()).toString('base64');
    }

    // Register a new user
    registerUser(username, password) {
        try {
            if (this.users.has(username)) {
                return { success: false, message: 'User already exists' };
            }

            const hashedPassword = this.hashPassword(password);
            
            this.users.set(username, {
                username: username,
                password: hashedPassword,
                registeredAt: new Date()
            });

            return { success: true, message: 'User registered successfully' };
        } catch (error) {
            console.error('Registration error:', error.message);
            return { success: false, message: 'Registration failed: ' + error.message };
        }
    }

    // Authenticate user login
    authenticateUser(username, password) {
        try {
            const user = this.users.get(username);
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            const hashedPassword = this.hashPassword(password);
            if (user.password !== hashedPassword) {
                return { success: false, message: 'Invalid password' };
            }

            const sessionToken = this.generateSessionToken();
            this.sessions.set(sessionToken, {
                username: username,
                loginTime: new Date()
            });

            return { 
                success: true, 
                message: 'Authentication successful',
                sessionToken: sessionToken
            };
        } catch (error) {
            console.error('Authentication error:', error.message);
            return { success: false, message: 'Authentication failed: ' + error.message };
        }
    }

    // Validate session token
    validateSession(sessionToken) {
        return this.sessions.has(sessionToken);
    }

    // Get user info by session
    getUserBySession(sessionToken) {
        const session = this.sessions.get(sessionToken);
        if (session) {
            return this.users.get(session.username);
        }
        return null;
    }

    // Logout user (remove session)
    logoutUser(sessionToken) {
        if (this.sessions.has(sessionToken)) {
            this.sessions.delete(sessionToken);
            return { success: true, message: 'Logged out successfully' };
        }
        return { success: false, message: 'Invalid session' };
    }

    // Get all users (for admin purposes)
    getAllUsers() {
        return Array.from(this.users.values()).map(user => ({
            username: user.username,
            registeredAt: user.registeredAt
        }));
    }

    // Clear all sessions (for maintenance)
    clearAllSessions() {
        this.sessions.clear();
        return { success: true, message: 'All sessions cleared' };
    }
}

module.exports = UserManager;
