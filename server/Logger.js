/**
 * Logger Module
 * Centralized logging system with different log levels
 */

const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logLevels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            DEBUG: 3
        };

        this.currentLevel = this.logLevels.INFO;
        this.logToFile = false;
        this.logFile = path.join(__dirname, '../logs/app.log');

        this.ensureLogDirectory();
    }

    /**
     * Ensure log directory exists
     */
    ensureLogDirectory() {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    /**
     * Set the minimum log level
     */
    setLevel(level) {
        if (typeof level === 'string') {
            this.currentLevel = this.logLevels[level.toUpperCase()] ?? this.logLevels.INFO;
        } else {
            this.currentLevel = level;
        }
    }

    /**
     * Enable or disable file logging
     */
    setFileLogging(enabled, filePath = null) {
        this.logToFile = enabled;
        if (filePath) {
            this.logFile = filePath;
            this.ensureLogDirectory();
        }
    }

    /**
     * Format log message
     */
    formatMessage(level, message, metadata = {}) {
        const timestamp = new Date().toISOString();
        const pid = process.pid;

        let formatted = `[${timestamp}] [${pid}] [${level}] ${message}`;

        if (Object.keys(metadata).length > 0) {
            formatted += ` | ${JSON.stringify(metadata)}`;
        }

        return formatted;
    }

    /**
     * Write log to console and/or file
     */
    writeLog(level, levelValue, message, metadata) {
        if (levelValue > this.currentLevel) {
            return; // Skip if level is below current threshold
        }

        const formatted = this.formatMessage(level, message, metadata);

        // Console output with colors
        switch (level) {
            case 'ERROR':
                console.error('\x1b[31m%s\x1b[0m', formatted); // Red
                break;
            case 'WARN':
                console.warn('\x1b[33m%s\x1b[0m', formatted); // Yellow
                break;
            case 'INFO':
                console.info('\x1b[36m%s\x1b[0m', formatted); // Cyan
                break;
            case 'DEBUG':
                console.log('\x1b[90m%s\x1b[0m', formatted); // Gray
                break;
            default:
                console.log(formatted);
        }

        // File output
        if (this.logToFile) {
            try {
                fs.appendFileSync(this.logFile, formatted + '\n');
            } catch (error) {
                console.error('Failed to write to log file:', error.message);
            }
        }
    }

    /**
     * Log error message
     */
    error(message, metadata = {}) {
        this.writeLog('ERROR', this.logLevels.ERROR, message, metadata);
    }

    /**
     * Log warning message
     */
    warn(message, metadata = {}) {
        this.writeLog('WARN', this.logLevels.WARN, message, metadata);
    }

    /**
     * Log info message
     */
    info(message, metadata = {}) {
        this.writeLog('INFO', this.logLevels.INFO, message, metadata);
    }

    /**
     * Log debug message
     */
    debug(message, metadata = {}) {
        this.writeLog('DEBUG', this.logLevels.DEBUG, message, metadata);
    }

    /**
     * Log request/response for API calls
     */
    logRequest(method, path, statusCode, duration, metadata = {}) {
        const message = `${method} ${path} - ${statusCode} (${duration}ms)`;

        if (statusCode >= 500) {
            this.error(message, metadata);
        } else if (statusCode >= 400) {
            this.warn(message, metadata);
        } else {
            this.info(message, metadata);
        }
    }

    /**
     * Log performance metrics
     */
    logPerformance(operation, duration, metadata = {}) {
        const message = `Performance: ${operation} took ${duration}ms`;

        if (duration > 1000) {
            this.warn(message, metadata);
        } else {
            this.debug(message, metadata);
        }
    }

    /**
     * Create a child logger with additional context
     */
    child(context) {
        return {
            error: (message, metadata = {}) => this.error(message, { ...context, ...metadata }),
            warn: (message, metadata = {}) => this.warn(message, { ...context, ...metadata }),
            info: (message, metadata = {}) => this.info(message, { ...context, ...metadata }),
            debug: (message, metadata = {}) => this.debug(message, { ...context, ...metadata })
        };
    }

    /**
     * Get log file contents
     */
    getLogFile() {
        if (!this.logToFile || !fs.existsSync(this.logFile)) {
            return null;
        }

        try {
            return fs.readFileSync(this.logFile, 'utf8');
        } catch (error) {
            this.error('Failed to read log file', { error: error.message });
            return null;
        }
    }

    /**
     * Clear log file
     */
    clearLogFile() {
        if (this.logToFile && fs.existsSync(this.logFile)) {
            try {
                fs.writeFileSync(this.logFile, '');
                this.info('Log file cleared');
            } catch (error) {
                this.error('Failed to clear log file', { error: error.message });
            }
        }
    }

    /**
     * Get logger statistics
     */
    getStats() {
        const stats = {
            currentLevel: Object.keys(this.logLevels)[Object.values(this.logLevels).indexOf(this.currentLevel)],
            fileLogging: this.logToFile,
            logFile: this.logFile
        };

        if (this.logToFile && fs.existsSync(this.logFile)) {
            try {
                const fileStats = fs.statSync(this.logFile);
                stats.fileSize = fileStats.size;
                stats.lastModified = fileStats.mtime;
            } catch (error) {
                stats.fileError = error.message;
            }
        }

        return stats;
    }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;
