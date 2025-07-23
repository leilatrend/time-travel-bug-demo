/**
 * Main Server Application
 * Express-like server implementation with routing and middleware
 */

const http = require('http');
const url = require('url');
const querystring = require('querystring');

const APIRouter = require('./APIRouter');
const Middleware = require('./Middleware');
const Logger = require('./Logger');
const ConfigManager = require('./ConfigManager');

class Server {
    constructor() {
        this.server = null;
        this.middleware = [];
        this.isRunning = false;

        this.setupMiddleware();
        this.setupErrorHandlers();
    }

    /**
     * Setup default middleware stack
     */
    setupMiddleware() {
        const defaultMiddleware = Middleware.getDefaultStack();
        this.middleware = [...defaultMiddleware];
    }

    /**
     * Setup error handlers
     */
    setupErrorHandlers() {
        process.on('uncaughtException', (error) => {
            Logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
            this.gracefulShutdown();
        });

        process.on('unhandledRejection', (reason, promise) => {
            Logger.error('Unhandled Promise Rejection', { reason, promise });
        });

        process.on('SIGTERM', () => {
            Logger.info('SIGTERM received, shutting down gracefully');
            this.gracefulShutdown();
        });

        process.on('SIGINT', () => {
            Logger.info('SIGINT received, shutting down gracefully');
            this.gracefulShutdown();
        });
    }

    /**
     * Parse request URL and extract parameters
     */
    parseRequest(req) {
        const parsed = url.parse(req.url, true);

        // Extract path parameters (simple implementation)
        const pathParts = parsed.pathname.split('/').filter(Boolean);
        const params = {};

        // Simple parameter extraction for routes like /api/forms/:id
        if (pathParts.length >= 3 && pathParts[0] === 'api' && pathParts[1] === 'forms') {
            if (pathParts[2] && !isNaN(pathParts[2])) {
                params.id = pathParts[2];
                parsed.pathname = '/api/forms/:id';
            }
        }

        return {
            method: req.method,
            path: parsed.pathname,
            query: parsed.query,
            params
        };
    }

    /**
     * Apply middleware to request
     */
    async applyMiddleware(req, res) {
        for (const middleware of this.middleware) {
            await new Promise((resolve, reject) => {
                try {
                    middleware(req, res, (error) => {
                        if (error) reject(error);
                        else resolve();
                    });
                } catch (error) {
                    reject(error);
                }
            });

            // If response was already sent, stop processing
            if (res.headersSent) {
                break;
            }
        }
    }

    /**
     * Handle incoming HTTP requests
     */
    async handleRequest(req, res) {
        try {
            // Parse request
            const parsedReq = this.parseRequest(req);
            req.path = parsedReq.path;
            req.query = parsedReq.query;
            req.params = parsedReq.params;

            // Apply middleware
            await this.applyMiddleware(req, res);

            // If response already sent by middleware, return
            if (res.headersSent) {
                return;
            }

            // Route request through API router
            const result = await APIRouter.handleRequest(
                parsedReq.method,
                parsedReq.path,
                req,
                res
            );

            // Send response
            res.statusCode = result.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));

        } catch (error) {
            Logger.error('Request handling error', {
                error: error.message,
                stack: error.stack,
                url: req.url,
                method: req.method
            });

            if (!res.headersSent) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    error: 'Internal Server Error',
                    message: 'An unexpected error occurred',
                    timestamp: new Date().toISOString()
                }));
            }
        }
    }

    /**
     * Start the server
     */
    start(port = null, host = null) {
        const config = ConfigManager.getSection('app');
        const serverPort = port || config.port;
        const serverHost = host || config.host;

        if (this.isRunning) {
            Logger.warn('Server is already running');
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            this.server = http.createServer((req, res) => {
                this.handleRequest(req, res);
            });

            this.server.listen(serverPort, serverHost, () => {
                this.isRunning = true;
                Logger.info('Server started', {
                    host: serverHost,
                    port: serverPort,
                    environment: ConfigManager.get('app.environment'),
                    pid: process.pid
                });
                resolve();
            });

            this.server.on('error', (error) => {
                Logger.error('Server error', { error: error.message });
                reject(error);
            });
        });
    }

    /**
     * Stop the server
     */
    stop() {
        return new Promise((resolve) => {
            if (!this.isRunning || !this.server) {
                resolve();
                return;
            }

            this.server.close(() => {
                this.isRunning = false;
                Logger.info('Server stopped');
                resolve();
            });
        });
    }

    /**
     * Graceful shutdown
     */
    async gracefulShutdown() {
        Logger.info('Starting graceful shutdown...');

        try {
            await this.stop();
            Logger.info('Graceful shutdown completed');
            process.exit(0);
        } catch (error) {
            Logger.error('Error during graceful shutdown', { error: error.message });
            process.exit(1);
        }
    }

    /**
     * Get server status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            pid: process.pid,
            config: ConfigManager.getSummary()
        };
    }

    /**
     * Add custom middleware
     */
    use(middleware) {
        this.middleware.push(middleware);
    }

    /**
     * Remove middleware
     */
    removeMiddleware(middleware) {
        const index = this.middleware.indexOf(middleware);
        if (index > -1) {
            this.middleware.splice(index, 1);
        }
    }
}

module.exports = Server;
