class UserManager {
    constructor() {
        this.users = new Map();
        this.sessions = new Map();
    }

    hashPassword(password) {
        // Add null/undefined validation before calling toString()
        if (password == null || password === undefined) {
            throw new Error('Password cannot be null or undefined');
        }
        
        // Ensure password is converted to string safely
        const passwordStr = String(password);
        
        if (passwordStr.trim() === '') {
            throw new Error('Password cannot be empty');
        }
        
        // Simple hash function (in production, use bcrypt or similar)
        let hash = 0;
        for (let i = 0; i < passwordStr.length; i++) {
            const char = passwordStr.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    registerUser(username, password, email) {
        try {
            // Validate inputs
            if (!username || !password || !email) {
                throw new Error('Username, password, and email are required');
            }

            if (this.users.has(username)) {
                throw new Error('User already exists');
            }

            const hashedPassword = this.hashPassword(password);
            
            const user = {
                username,
                passwordHash: hashedPassword,
                email,
                createdAt: new Date(),
                isActive: true
            };

            this.users.set(username, user);
            console.log(`User ${username} registered successfully`);
            return { success: true, message: 'User registered successfully' };
            
        } catch (error) {
            console.error(`Registration failed for user ${username}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    authenticateUser(username, password) {
        try {
            const user = this.users.get(username);
            
            if (!user) {
                throw new Error('User not found');
            }

            if (!user.isActive) {
                throw new Error('User account is deactivated');
            }

            const hashedPassword = this.hashPassword(password);
            
            if (user.passwordHash !== hashedPassword) {
                throw new Error('Invalid password');
            }

            // Generate session token
            const sessionToken = Math.random().toString(36).substring(2, 15);
            this.sessions.set(sessionToken, {
                username,
                loginTime: new Date(),
                lastActivity: new Date()
            });

            console.log(`User ${username} authenticated successfully`);
            return { success: true, sessionToken, message: 'Authentication successful' };
            
        } catch (error) {
            console.error(`Authentication failed for user ${username}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    validateSession(sessionToken) {
        const session = this.sessions.get(sessionToken);
        
        if (!session) {
            return { valid: false, error: 'Invalid session token' };
        }

        // Update last activity
        session.lastActivity = new Date();
        
        return { valid: true, username: session.username };
    }

    logoutUser(sessionToken) {
        const session = this.sessions.get(sessionToken);
        
        if (session) {
            console.log(`User ${session.username} logged out`);
            this.sessions.delete(sessionToken);
            return { success: true, message: 'Logged out successfully' };
        }
        
        return { success: false, error: 'Invalid session token' };
    }

    getUserInfo(username) {
        const user = this.users.get(username);
        
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // Return user info without password hash
        return {
            success: true,
            user: {
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                isActive: user.isActive
            }
        };
    }
}

module.exports = UserManager;
