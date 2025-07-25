/**
 * User Manager Module
 * Handles user registration, authentication, and profile management
 */

const DatabaseManager = require('./DatabaseManager');
const Logger = require('./Logger');

class UserManager {
    constructor() {
        this.users = new Map();
        this.sessions = new Map();
        this.lastUserId = 0;
    }

    /**
     * Generate a new user ID
     */
    generateUserId() {
        return ++this.lastUserId;
    }

    /**
     * Generate a session token
     */
    generateSessionToken() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    /**
     * Hash password using Base64 encoding
     */
    hashPassword(password) {
        return Buffer.from(password.toString()).toString('base64');
    }

    /**
     * Validate email format
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Register a new user
     */
    async registerUser(userData) {
        try {
            Logger.info('User registration attempt', { email: userData.email });

            // Validate required fields
            if (!userData.email || !userData.password) {
                throw new Error('Email and password are required');
            }

            if (!this.validateEmail(userData.email)) {
                throw new Error('Invalid email format');
            }

            if (userData.password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            // Check if user already exists
            for (const user of this.users.values()) {
                if (user.email === userData.email) {
                    throw new Error('User with this email already exists');
                }
            }

            // Create new user
            const userId = this.generateUserId();
            const hashedPassword = this.hashPassword(userData.password);

            const newUser = {
                id: userId,
                email: userData.email,
                password: hashedPassword,
                name: userData.name || 'Anonymous User',
                role: userData.role || 'user',
                createdAt: new Date().toISOString(),
                isActive: true,
                lastLogin: null,
                profileData: {
                    preferences: {},
                    settings: {
                        notifications: true,
                        theme: 'light'
                    }
                }
            };

            this.users.set(userId, newUser);

            // Store in database
            DatabaseManager.create({
                type: 'user',
                userId: userId,
                ...newUser
            });

            Logger.info('User registered successfully', { userId, email: userData.email });

            // Return user without password
            const { password, ...userResponse } = newUser;
            return {
                success: true,
                user: userResponse,
                message: 'User registered successfully'
            };

        } catch (error) {
            Logger.error('User registration failed', { error: error.message, email: userData.email });
            return {
                success: false,
                error: error.message,
                message: 'Registration failed'
            };
        }
    }

    /**
     * Authenticate user login
     */
    async loginUser(email, password) {
        try {
            Logger.info('User login attempt', { email });

            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            // Find user by email
            let foundUser = null;
            for (const user of this.users.values()) {
                if (user.email === email) {
                    foundUser = user;
                    break;
                }
            }

            if (!foundUser) {
                throw new Error('Invalid email or password');
            }

            if (!foundUser.isActive) {
                throw new Error('Account is deactivated');
            }

            // Verify password
            const hashedPassword = this.hashPassword(password);
            if (foundUser.password !== hashedPassword) {
                throw new Error('Invalid email or password');
            }

            // Create session
            const sessionToken = this.generateSessionToken();
            const session = {
                userId: foundUser.id,
                token: sessionToken,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
                userAgent: 'API Client'
            };

            this.sessions.set(sessionToken, session);

            // Update last login
            foundUser.lastLogin = new Date().toISOString();

            Logger.info('User login successful', { userId: foundUser.id, email });

            // Return user without password
            const { password: pwd, ...userResponse } = foundUser;
            return {
                success: true,
                user: userResponse,
                sessionToken: sessionToken,
                message: 'Login successful'
            };

        } catch (error) {
            Logger.error('User login failed', { error: error.message, email });
            return {
                success: false,
                error: error.message,
                message: 'Login failed'
            };
        }
    }

    /**
     * Validate session token
     */
    validateSession(token) {
        const session = this.sessions.get(token);

        if (!session) {
            return { valid: false, error: 'Invalid session token' };
        }

        if (new Date() > new Date(session.expiresAt)) {
            this.sessions.delete(token);
            return { valid: false, error: 'Session expired' };
        }

        const user = this.users.get(session.userId);
        if (!user || !user.isActive) {
            return { valid: false, error: 'User account not found or inactive' };
        }

        return { valid: true, user, session };
    }

    /**
     * Logout user
     */
    logoutUser(token) {
        const session = this.sessions.get(token);
        if (session) {
            this.sessions.delete(token);
            Logger.info('User logged out', { userId: session.userId });
            return { success: true, message: 'Logged out successfully' };
        }
        return { success: false, error: 'Invalid session token' };
    }

    /**
     * Get user profile
     */
    getUserProfile(userId) {
        const user = this.users.get(userId);
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const { password, ...userProfile } = user;
        return {
            success: true,
            user: userProfile,
            message: 'Profile retrieved successfully'
        };
    }

    /**
     * Update user profile
     */
    updateUserProfile(userId, updateData) {
        try {
            const user = this.users.get(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Update allowed fields
            const allowedFields = ['name', 'profileData'];
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    if (field === 'profileData') {
                        user.profileData = { ...user.profileData, ...updateData.profileData };
                    } else {
                        user[field] = updateData[field];
                    }
                }
            }

            user.updatedAt = new Date().toISOString();

            Logger.info('User profile updated', { userId });

            const { password, ...userResponse } = user;
            return {
                success: true,
                user: userResponse,
                message: 'Profile updated successfully'
            };

        } catch (error) {
            Logger.error('User profile update failed', { error: error.message, userId });
            return {
                success: false,
                error: error.message,
                message: 'Profile update failed'
            };
        }
    }

    /**
     * Get all users (admin only)
     */
    getAllUsers() {
        const userList = Array.from(this.users.values()).map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        return {
            success: true,
            users: userList,
            total: userList.length,
            message: 'Users retrieved successfully'
        };
    }

    /**
     * Get user statistics
     */
    getUserStats() {
        const totalUsers = this.users.size;
        const activeUsers = Array.from(this.users.values()).filter(user => user.isActive).length;
        const activeSessions = this.sessions.size;

        return {
            totalUsers,
            activeUsers,
            inactiveUsers: totalUsers - activeUsers,
            activeSessions,
            lastUserId: this.lastUserId
        };
    }
}

// Create singleton instance
const userManager = new UserManager();

module.exports = userManager;
