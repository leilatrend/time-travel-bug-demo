/**
 * Configuration Manager Module
 * Handles application configuration and environment variables
 */

const fs = require('fs');
const path = require('path');

class ConfigManager {
    constructor() {
        this.config = {};
        this.environment = process.env.NODE_ENV || 'development';
        this.configFile = path.join(__dirname, '../config/app.json');

        this.loadDefaultConfig();
        this.loadConfigFile();
        this.loadEnvironmentVariables();
    }

    /**
     * Load default configuration
     */
    loadDefaultConfig() {
        this.config = {
            app: {
                name: 'Time Travel Bug Demo',
                version: '1.0.0',
                environment: this.environment,
                port: 3000,
                host: 'localhost'
            },

            database: {
                type: 'memory',
                maxRecords: 10000,
                autoCleanup: true,
                cleanupInterval: 3600000 // 1 hour
            },

            logging: {
                level: 'INFO',
                fileLogging: false,
                logFile: './logs/app.log',
                maxFileSize: 10485760, // 10MB
                maxFiles: 5
            },

            validation: {
                maxFieldLength: 1000,
                maxNameLength: 50,
                maxMessageLength: 500,
                emailRequired: false,
                strictValidation: false
            },

            security: {
                enableXSSProtection: true,
                enableInputSanitization: true,
                maxRequestSize: 1048576, // 1MB
                rateLimitEnabled: false,
                rateLimitRequests: 100,
                rateLimitWindow: 900000 // 15 minutes
            },

            features: {
                enableMetrics: true,
                enableHealthCheck: true,
                enableDebugEndpoints: this.environment === 'development',
                enableCORS: true
            }
        };
    }

    /**
     * Load configuration from file
     */
    loadConfigFile() {
        try {
            if (fs.existsSync(this.configFile)) {
                const fileConfig = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
                this.config = this.mergeConfig(this.config, fileConfig);
            }
        } catch (error) {
            console.warn('Failed to load config file:', error.message);
        }
    }

    /**
     * Load configuration from environment variables
     */
    loadEnvironmentVariables() {
        const envMappings = {
            'PORT': 'app.port',
            'HOST': 'app.host',
            'LOG_LEVEL': 'logging.level',
            'ENABLE_FILE_LOGGING': 'logging.fileLogging',
            'LOG_FILE': 'logging.logFile',
            'MAX_FIELD_LENGTH': 'validation.maxFieldLength',
            'ENABLE_XSS_PROTECTION': 'security.enableXSSProtection',
            'RATE_LIMIT_ENABLED': 'security.rateLimitEnabled'
        };

        for (const [envVar, configPath] of Object.entries(envMappings)) {
            const value = process.env[envVar];
            if (value !== undefined) {
                this.setNestedValue(this.config, configPath, this.parseValue(value));
            }
        }
    }

    /**
     * Parse environment variable value to appropriate type
     */
    parseValue(value) {
        // Boolean values
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;

        // Number values
        if (/^\d+$/.test(value)) return parseInt(value, 10);
        if (/^\d+\.\d+$/.test(value)) return parseFloat(value);

        // String values
        return value;
    }

    /**
     * Deep merge two configuration objects
     */
    mergeConfig(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.mergeConfig(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }

        return result;
    }

    /**
     * Set nested configuration value using dot notation
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
    }

    /**
     * Get nested configuration value using dot notation
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Get configuration value
     */
    get(path) {
        return this.getNestedValue(this.config, path);
    }

    /**
     * Set configuration value
     */
    set(path, value) {
        this.setNestedValue(this.config, path, value);
    }

    /**
     * Get all configuration
     */
    getAll() {
        return { ...this.config };
    }

    /**
     * Get configuration for specific section
     */
    getSection(section) {
        return { ...this.config[section] };
    }

    /**
     * Check if feature is enabled
     */
    isFeatureEnabled(feature) {
        return this.get(`features.${feature}`) === true;
    }

    /**
     * Get database configuration
     */
    getDatabaseConfig() {
        return this.getSection('database');
    }

    /**
     * Get logging configuration
     */
    getLoggingConfig() {
        return this.getSection('logging');
    }

    /**
     * Get validation configuration
     */
    getValidationConfig() {
        return this.getSection('validation');
    }

    /**
     * Get security configuration
     */
    getSecurityConfig() {
        return this.getSection('security');
    }

    /**
     * Save current configuration to file
     */
    saveToFile(filePath = null) {
        const targetFile = filePath || this.configFile;

        try {
            const configDir = path.dirname(targetFile);
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }

            fs.writeFileSync(targetFile, JSON.stringify(this.config, null, 2));
            return true;
        } catch (error) {
            console.error('Failed to save config file:', error.message);
            return false;
        }
    }

    /**
     * Reload configuration
     */
    reload() {
        this.loadDefaultConfig();
        this.loadConfigFile();
        this.loadEnvironmentVariables();
    }

    /**
     * Validate configuration
     */
    validate() {
        const errors = [];

        // Validate required fields
        if (!this.get('app.name')) {
            errors.push('app.name is required');
        }

        if (!this.get('app.port') || this.get('app.port') <= 0) {
            errors.push('app.port must be a positive number');
        }

        // Validate logging configuration
        const logLevel = this.get('logging.level');
        if (!['ERROR', 'WARN', 'INFO', 'DEBUG'].includes(logLevel)) {
            errors.push('logging.level must be one of: ERROR, WARN, INFO, DEBUG');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Get configuration summary for debugging
     */
    getSummary() {
        return {
            environment: this.environment,
            configFile: this.configFile,
            configFileExists: fs.existsSync(this.configFile),
            validation: this.validate(),
            lastLoaded: new Date().toISOString()
        };
    }
}

// Create singleton instance
const configManager = new ConfigManager();

module.exports = configManager;
