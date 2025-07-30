/**
 * Middleware Module
 * Collection of middleware functions for request processing
 */

const Logger = require('./Logger');
const ConfigManager = require('./ConfigManager');

class Middleware {
    /**
     * Request logging middleware
     */
    static requestLogger() {
        return (req, res, next) => {
            const start = Date.now();

            // Log incoming request
            Logger.info('Incoming request', {
                method: req.method,
                path: req.path || req.url,
                userAgent: req.headers?.['user-agent'],
                ip: req.ip || req.connection?.remoteAddress
            });

            // Override res.end to log response
            const originalEnd = res.end;
            res.end = function (...args) {
                const duration = Date.now() - start;
                Logger.logRequest(
                    req.method,
                    req.path || req.url,
                    res.statusCode || 200,
                    duration,
                    { size: res.get('content-length') }
                );
                originalEnd.apply(this, args);
            };

            if (next) next();
        };
    }

    /**
     * CORS middleware
     */
    static cors() {
        return (req, res, next) => {
            if (ConfigManager.isFeatureEnabled('enableCORS')) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

                if (req.method === 'OPTIONS') {
                    res.statusCode = 200;
                    res.end();
                    return;
                }
            }

            if (next) next();
        };
    }

    /**
     * Rate limiting middleware with atomic operations
     */
    static rateLimit() {
        const requests = new Map();
        const locks = new Map(); // Add per-IP locks
        const securityConfig = ConfigManager.getSecurityConfig();

        return async (req, res, next) => {
            if (!securityConfig.rateLimitEnabled) {
                if (next) next();
                return;
            }

            const ip = req.ip || req.connection?.remoteAddress || 'unknown';
            const now = Date.now();
            const windowStart = now - securityConfig.rateLimitWindow;

            // Use per-IP lock to prevent race conditions
            const lockKey = `lock_${ip}`;
            while (locks.get(lockKey)) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
            locks.set(lockKey, true);

            try {
                // Clean old entries atomically
                for (const [key, timestamps] of requests.entries()) {
                    const filtered = timestamps.filter(time => time > windowStart);
                    if (filtered.length === 0) {
                        requests.delete(key);
                    } else {
                        requests.set(key, filtered);
                    }
                }

                // Atomic check and update
                const ipRequests = requests.get(ip) || [];
                
                if (ipRequests.length >= securityConfig.rateLimitRequests) {
                    Logger.warn('Rate limit exceeded', { ip, requests: ipRequests.length });

                    res.statusCode = 429;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                        error: 'Too Many Requests',
                        message: 'Rate limit exceeded. Please try again later.',
                        retryAfter: Math.ceil(securityConfig.rateLimitWindow / 1000)
                    }));
                    return;
                }

                // Atomically add new request
                ipRequests.push(now);
                requests.set(ip, ipRequests);

            } finally {
                locks.delete(lockKey);
            }

            if (next) next();
        };
    }

    /**
     * Body size limit middleware
     */
    static bodyLimit() {
        const maxSize = ConfigManager.get('security.maxRequestSize');

        return (req, res, next) => {
            const contentLength = parseInt(req.headers['content-length'] || '0');

            if (contentLength > maxSize) {
                Logger.warn('Request body too large', { contentLength, maxSize });

                res.statusCode = 413;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    error: 'Payload Too Large',
                    message: `Request body size exceeds ${maxSize} bytes`,
                    maxSize
                }));
                return;
            }

            if (next) next();
        };
    }

    /**
     * Security headers middleware
     */
    static securityHeaders() {
        return (req, res, next) => {
            // Basic security headers
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

            if (next) next();
        };
    }

    /**
     * JSON body parser middleware
     */
    static jsonParser() {
        return (req, res, next) => {
            if (req.method === 'GET' || req.method === 'DELETE') {
                if (next) next();
                return;
            }

            let body = '';

            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                try {
                    if (body) {
                        req.body = JSON.parse(body);
                    } else {
                        req.body = {};
                    }
                } catch (error) {
                    Logger.error('Invalid JSON in request body', { error: error.message });
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                        error: 'Invalid JSON',
                        message: 'Request body contains invalid JSON'
                    }));
                    return;
                }

                if (next) next();
            });

            req.on('error', error => {
                Logger.error('Request error', { error: error.message });
                res.statusCode = 400;
                res.end();
            });
        };
    }

    /**
     * Error handling middleware
     */
    static errorHandler() {
        return (error, req, res, next) => {
            Logger.error('Unhandled error', {
                error: error.message,
                stack: error.stack,
                method: req.method,
                path: req.path || req.url
            });

            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                error: 'Internal Server Error',
                message: 'An unexpected error occurred',
                timestamp: new Date().toISOString()
            }));
        };
    }

    /**
     * Request validation middleware
     */
    static validateRequest() {
        return (req, res, next) => {
            // Validate content type for POST/PUT requests
            if (['POST', 'PUT'].includes(req.method)) {
                const contentType = req.headers['content-type'];
                if (!contentType || !contentType.includes('application/json')) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                        error: 'Invalid Content-Type',
                        message: 'Content-Type must be application/json'
                    }));
                    return;
                }
            }

            if (next) next();
        };
    }

    /**
     * Performance monitoring middleware
     */
    static performanceMonitor() {
        return (req, res, next) => {
            const start = process.hrtime.bigint();

            res.on('finish', () => {
                const duration = Number(process.hrtime.bigint() - start) / 1000000; // Convert to ms
                Logger.logPerformance(`${req.method} ${req.path || req.url}`, duration);
            });

            if (next) next();
        };
    }

    /**
     * Health check bypass middleware
     */
    static healthCheckBypass() {
        return (req, res, next) => {
            if (req.path === '/api/health' || req.url === '/api/health') {
                // Skip other middleware for health checks
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime()
                }));
                return;
            }

            if (next) next();
        };
    }

    /**
     * Get all middleware in recommended order
     */
    static getDefaultStack() {
        return [
            this.healthCheckBypass(),
            this.requestLogger(),
            this.securityHeaders(),
            this.cors(),
            this.rateLimit(),
            this.bodyLimit(),
            this.validateRequest(),
            this.jsonParser(),
            this.performanceMonitor()
        ];
    }
}

module.exports = Middleware;
