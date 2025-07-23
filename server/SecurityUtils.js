/**
 * Security Utilities
 * Comprehensive security tools for input validation, rate limiting, and attack prevention
 */

const crypto = require('crypto');
const Logger = require('./Logger');

class SecurityUtils {
    constructor() {
        this.rateLimitStore = new Map(); // IP -> {count, resetTime}
        this.blockedIPs = new Set();
        this.suspiciousPatterns = [
            /(<script[\s\S]*?>[\s\S]*?<\/script>)/gi, // XSS scripts
            /(javascript:)/gi, // JavaScript protocol
            /(on\w+\s*=)/gi, // Event handlers
            /(\.\.\/.*)|(\.\.\\.*)/gi, // Path traversal
            /(union[\s\S]*select)/gi, // SQL injection
            /(select[\s\S]*from)/gi, // SQL injection
            /(insert[\s\S]*into)/gi, // SQL injection
            /(delete[\s\S]*from)/gi, // SQL injection
            /(drop[\s\S]*table)/gi, // SQL injection
            /(\bor\b[\s\S]*=[\s\S]*\bor\b)/gi, // SQL injection OR clauses
            /(\/\*[\s\S]*?\*\/)/gi, // SQL comments
            /(\|\||&&)/gi, // Command injection
            /(;\s*(rm|del|format|shutdown))/gi, // Dangerous commands
        ];

        this.config = {
            maxLoginAttempts: 5,
            loginWindowMs: 15 * 60 * 1000, // 15 minutes
            rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
            maxRequestsPerWindow: 100,
            minPasswordLength: 8,
            maxInputLength: 10000,
            sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
            csrfTokenLength: 32
        };

        Logger.info('Security Utils initialized', this.config);
    }

    /**
     * Validate and sanitize input to prevent XSS and injection attacks
     */
    sanitizeInput(input, options = {}) {
        if (typeof input !== 'string') {
            return input;
        }

        const maxLength = options.maxLength || this.config.maxInputLength;

        // Check length
        if (input.length > maxLength) {
            Logger.warn('Input length exceeded limit', {
                length: input.length,
                limit: maxLength
            });
            throw new Error(`Input too long. Maximum ${maxLength} characters allowed.`);
        }

        // Check for suspicious patterns
        for (const pattern of this.suspiciousPatterns) {
            if (pattern.test(input)) {
                Logger.warn('Suspicious pattern detected in input', {
                    pattern: pattern.toString(),
                    input: input.substring(0, 100) + '...'
                });
                throw new Error('Invalid input detected');
            }
        }

        // Basic HTML encoding
        let sanitized = input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');

        // Additional SQL injection prevention
        sanitized = sanitized.replace(/['";\\]/g, '');

        return sanitized;
    }

    /**
     * Check if IP address should be rate limited
     */
    checkRateLimit(ip, endpoint = 'default') {
        const key = `${ip}:${endpoint}`;
        const now = Date.now();
        const record = this.rateLimitStore.get(key);

        // Clean up expired records
        if (record && now > record.resetTime) {
            this.rateLimitStore.delete(key);
        }

        const currentRecord = this.rateLimitStore.get(key);

        if (!currentRecord) {
            // First request from this IP for this endpoint
            this.rateLimitStore.set(key, {
                count: 1,
                resetTime: now + this.config.rateLimitWindowMs
            });
            return { allowed: true, remaining: this.config.maxRequestsPerWindow - 1 };
        }

        if (currentRecord.count >= this.config.maxRequestsPerWindow) {
            Logger.warn('Rate limit exceeded', {
                ip,
                endpoint,
                count: currentRecord.count,
                limit: this.config.maxRequestsPerWindow
            });

            // Block IP if they consistently exceed limits
            if (currentRecord.count > this.config.maxRequestsPerWindow * 2) {
                this.blockedIPs.add(ip);
                Logger.error('IP blocked for excessive requests', { ip });
            }

            return {
                allowed: false,
                remaining: 0,
                resetTime: currentRecord.resetTime
            };
        }

        // Increment counter
        currentRecord.count++;
        return {
            allowed: true,
            remaining: this.config.maxRequestsPerWindow - currentRecord.count
        };
    }

    /**
     * Check if IP is blocked
     */
    isBlocked(ip) {
        return this.blockedIPs.has(ip);
    }

    /**
     * Block an IP address
     */
    blockIP(ip, reason = 'Manual block') {
        this.blockedIPs.add(ip);
        Logger.warn('IP blocked', { ip, reason });
    }

    /**
     * Unblock an IP address
     */
    unblockIP(ip) {
        const wasBlocked = this.blockedIPs.delete(ip);
        if (wasBlocked) {
            Logger.info('IP unblocked', { ip });
        }
        return wasBlocked;
    }

    /**
     * Validate password strength
     */
    validatePassword(password) {
        const errors = [];

        if (!password || password.length < this.config.minPasswordLength) {
            errors.push(`Password must be at least ${this.config.minPasswordLength} characters long`);
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        // Check for common weak passwords
        const commonPasswords = [
            'password', '123456', 'qwerty', 'abc123', 'password123',
            'admin', 'letmein', 'welcome', 'monkey', '1234567890'
        ];

        if (commonPasswords.includes(password.toLowerCase())) {
            errors.push('Password is too common. Please choose a more secure password');
        }

        return {
            isValid: errors.length === 0,
            errors,
            strength: this.calculatePasswordStrength(password)
        };
    }

    /**
     * Calculate password strength score
     */
    calculatePasswordStrength(password) {
        let score = 0;

        // Length bonus
        score += Math.min(password.length * 2, 20);

        // Character variety bonus
        if (/[a-z]/.test(password)) score += 5;
        if (/[A-Z]/.test(password)) score += 5;
        if (/\d/.test(password)) score += 5;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;

        // Complexity bonus
        const uniqueChars = new Set(password).size;
        score += uniqueChars * 2;

        // Pattern penalties
        if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
        if (/123|abc|qwe/i.test(password)) score -= 10; // Sequential patterns

        score = Math.max(0, Math.min(100, score));

        if (score < 30) return 'weak';
        if (score < 60) return 'medium';
        if (score < 80) return 'strong';
        return 'very strong';
    }

    /**
     * Generate secure random token
     */
    generateSecureToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Generate CSRF token
     */
    generateCSRFToken() {
        return this.generateSecureToken(this.config.csrfTokenLength);
    }

    /**
     * Hash password securely
     */
    hashPassword(password, salt = null) {
        const actualSalt = salt || crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, actualSalt, 10000, 64, 'sha512').toString('hex');
        return {
            hash,
            salt: actualSalt
        };
    }

    /**
     * Verify password against hash
     */
    verifyPassword(password, hash, salt) {
        const newHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        return newHash === hash;
    }

    /**
     * Create secure session data
     */
    createSession(userId, userRole = 'user') {
        const sessionId = this.generateSecureToken();
        const csrfToken = this.generateCSRFToken();
        const expiresAt = Date.now() + this.config.sessionTimeout;

        return {
            sessionId,
            userId,
            userRole,
            csrfToken,
            createdAt: Date.now(),
            expiresAt,
            lastActivity: Date.now()
        };
    }

    /**
     * Validate session
     */
    validateSession(session) {
        if (!session || !session.sessionId || !session.userId) {
            return { valid: false, reason: 'Invalid session data' };
        }

        if (Date.now() > session.expiresAt) {
            return { valid: false, reason: 'Session expired' };
        }

        // Check for session timeout due to inactivity (30 minutes)
        const inactivityTimeout = 30 * 60 * 1000;
        if (Date.now() - session.lastActivity > inactivityTimeout) {
            return { valid: false, reason: 'Session timeout due to inactivity' };
        }

        return { valid: true };
    }

    /**
     * Check for suspicious activity patterns
     */
    detectSuspiciousActivity(request) {
        const suspiciousIndicators = [];

        // Check user agent
        if (!request.userAgent || request.userAgent.length < 10) {
            suspiciousIndicators.push('Missing or suspicious user agent');
        }

        // Check for bot patterns
        const botPatterns = [
            /bot|crawler|spider|scraper/i,
            /curl|wget|python|java|go-http/i
        ];

        if (request.userAgent && botPatterns.some(pattern => pattern.test(request.userAgent))) {
            suspiciousIndicators.push('Bot-like user agent detected');
        }

        // Check request timing patterns
        if (request.requestCount && request.timeWindow) {
            const requestRate = request.requestCount / (request.timeWindow / 1000);
            if (requestRate > 10) { // More than 10 requests per second
                suspiciousIndicators.push('Unusually high request rate');
            }
        }

        // Check for suspicious headers
        const suspiciousHeaders = [
            'x-forwarded-for-original',
            'x-real-ip-original',
            'x-remote-addr'
        ];

        if (request.headers) {
            for (const header of suspiciousHeaders) {
                if (request.headers[header]) {
                    suspiciousIndicators.push(`Suspicious header: ${header}`);
                }
            }
        }

        return {
            isSuspicious: suspiciousIndicators.length > 0,
            indicators: suspiciousIndicators,
            riskLevel: this.calculateRiskLevel(suspiciousIndicators.length)
        };
    }

    /**
     * Calculate risk level based on suspicious indicators
     */
    calculateRiskLevel(indicatorCount) {
        if (indicatorCount === 0) return 'low';
        if (indicatorCount <= 2) return 'medium';
        if (indicatorCount <= 4) return 'high';
        return 'critical';
    }

    /**
     * Log security event
     */
    logSecurityEvent(event, details = {}) {
        const securityEvent = {
            timestamp: new Date().toISOString(),
            event,
            ...details
        };

        Logger.warn('Security Event', securityEvent);

        // In production, you might want to send this to a SIEM or security monitoring system
        return securityEvent;
    }

    /**
     * Get security statistics
     */
    getSecurityStats() {
        const now = Date.now();
        const activeRateLimits = Array.from(this.rateLimitStore.entries())
            .filter(([_, record]) => now <= record.resetTime);

        return {
            blockedIPs: Array.from(this.blockedIPs),
            activeRateLimits: activeRateLimits.length,
            totalRateLimitRecords: this.rateLimitStore.size,
            securityConfig: this.config,
            suspiciousPatternsCount: this.suspiciousPatterns.length
        };
    }

    /**
     * Clean up expired rate limit records
     */
    cleanupRateLimits() {
        const now = Date.now();
        let cleanedCount = 0;

        for (const [key, record] of this.rateLimitStore.entries()) {
            if (now > record.resetTime) {
                this.rateLimitStore.delete(key);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            Logger.debug('Rate limit cleanup completed', {
                cleanedRecords: cleanedCount,
                remainingRecords: this.rateLimitStore.size
            });
        }
    }

    /**
     * Start background cleanup tasks
     */
    startCleanupTasks() {
        // Clean up rate limits every 5 minutes
        setInterval(() => {
            this.cleanupRateLimits();
        }, 5 * 60 * 1000);

        Logger.info('Security cleanup tasks started');
    }
}

// Create singleton instance
const securityUtils = new SecurityUtils();
securityUtils.startCleanupTasks();

module.exports = securityUtils;
