const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Logger = require('./Logger');

class UserManager {
    constructor() {
        this.users = new Map();
        this.sessions = new Map();
        this.saltRounds = 10;
        
        Logger.info('UserManager initialized');
    }

    generateUserId() {
        return crypto.randomBytes(16).toString('hex');
    }

    generateSessionToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        // Password must be at least 8 characters long
        return password && password.length >= 8;
    }

    hashPassword(password) {
        // Add null/undefined check before calling toString()
        if (password === null || password === undefined) {
            throw new Error('Password cannot be null or undefined');
        }
        return Buffer.from(password.toString()).toString('base64');
    }

    async hashPasswordSecure(password) {
        // Add null/undefined check for secure hashing too
        if (password === null || password === undefined) {
            throw new Error('Password cannot be null or undefined');
        }
        return await bcrypt.hash(password.toString(), this.saltRounds);
    }

    async verifyPassword(password, hashedPassword) {
        if (password === null || password === undefined) {
            return false;
        }
        return await bcrypt.compare(password.toString(), hashedPassword);
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

            // Validate email format
            if (!this.validateEmail(userData.email)) {
                throw new Error('Invalid email format');
            }

            // Validate password strength
            if (!this.validatePassword(userData.password)) {
                throw new Error('Password must be at least 8 characters long');
            }

            // Check if user already exists
            if (this.users.has(userData.email)) {
                throw new Error('User already exists');
            }

            // Generate user ID
            const userId = this.generateUserId();
            
            // Hash password securely
            const hashedPassword = await this.hashPasswordSecure(userData.password);

            // Create user object
            const user = {
                id: userId,
                email: userData.email,
                hashedPassword: hashedPassword,
                createdAt: new Date(),
                isActive: true
            };

            // Store user
            this.users.set(userData.email, user);

            Logger.info('User registered successfully', { 
                userId: userId, 
                email: userData.email 
            });

            return {
                success: true,
                userId: userId,
                message: 'User registered successfully'
            };

        } catch (error) {
            Logger.error('User registration failed', { 
                email: userData.email, 
                error: error.message 
            });
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    async loginUser(email, password) {
        try {
            Logger.info('User login attempt', { email: email });

            // Validate input
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            // Add null check for password
            if (password === null || password === undefined) {
                throw new Error('Password cannot be null or undefined');
            }

            // Find user
            const user = this.users.get(email);
            if (!user) {
                throw new Error('User not found');
            }

            // Check if user is active
            if (!user.isActive) {
                throw new Error('User account is deactivated');
            }

            // Verify password
            const isPasswordValid = await this.verifyPassword(password, user.hashedPassword);
            if (!isPasswordValid) {
                throw new Error('Invalid password');
            }

            // Generate session token
            const sessionToken = this.generateSessionToken();
            const sessionData = {
                userId: user.id,
                email: user.email,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            };

            // Store session
            this.sessions.set(sessionToken, sessionData);

            Logger.info('User logged in successfully', { 
                userId: user.id, 
                email: email 
            });

            return {
                success: true,
                sessionToken: sessionToken,
                user: {
                    id: user.id,
                    email: user.email,
                    createdAt: user.createdAt
                },
                message: 'Login successful'
            };

        } catch (error) {
            Logger.error('User login failed', { 
                email: email, 
                error: error.message 
            });
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    validateSession(sessionToken) {
        try {
            if (!sessionToken) {
                return { valid: false, error: 'Session token required' };
            }

            const session = this.sessions.get(sessionToken);
            if (!session) {
                return { valid: false, error: 'Invalid session token' };
            }

            // Check if session has expired
            if (new Date() > session.expiresAt) {
                this.sessions.delete(sessionToken);
                return { valid: false, error: 'Session expired' };
            }

            return {
                valid: true,
                userId: session.userId,
                email: session.email
            };

        } catch (error) {
            Logger.error('Session validation failed', { error: error.message });
            return { valid: false, error: 'Session validation failed' };
        }
    }

    logoutUser(sessionToken) {
        try {
            if (!sessionToken) {
                return { success: false, error: 'Session token required' };
            }

            const session = this.sessions.get(sessionToken);
            if (!session) {
                return { success: false, error: 'Invalid session token' };
            }

            // Remove session
            this.sessions.delete(sessionToken);

            Logger.info('User logged out successfully', { 
                userId: session.userId, 
                email: session.email 
            });

            return {
                success: true,
                message: 'Logout successful'
            };

        } catch (error) {
            Logger.error('User logout failed', { error: error.message });
            return { success: false, error: 'Logout failed' };
        }
    }

    getAllUsers() {
        try {
            const userList = Array.from(this.users.values()).map(user => ({
                id: user.id,
                email: user.email,
                createdAt: user.createdAt,
                isActive: user.isActive
            }));

            return {
                success: true,
                users: userList,
                count: userList.length
            };

        } catch (error) {
            Logger.error('Failed to get user list', { error: error.message });
            return { success: false, error: 'Failed to get user list' };
        }
    }

    getUserById(userId) {
        try {
            const user = Array.from(this.users.values()).find(u => u.id === userId);
            
            if (!user) {
                return { success: false, error: 'User not found' };
            }

            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    createdAt: user.createdAt,
                    isActive: user.isActive
                }
            };

        } catch (error) {
            Logger.error('Failed to get user by ID', { userId, error: error.message });
            return { success: false, error: 'Failed to get user' };
        }
    }
}

module.exports = UserManager;
