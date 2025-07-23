/**
 * Application Entry Point
 * Main file to start the Time Travel Bug Demo server
 */

const Server = require('./server/Server');
const Logger = require('./server/Logger');
const ConfigManager = require('./server/ConfigManager');

async function startApplication() {
    try {
        // Configure logging based on config
        const loggingConfig = ConfigManager.getLoggingConfig();
        Logger.setLevel(loggingConfig.level);
        Logger.setFileLogging(loggingConfig.fileLogging, loggingConfig.logFile);

        // Log startup information
        Logger.info('🚀 Starting Time Travel Bug Demo Application', {
            version: ConfigManager.get('app.version'),
            environment: ConfigManager.get('app.environment'),
            nodeVersion: process.version,
            platform: process.platform
        });

        // Validate configuration
        const validation = ConfigManager.validate();
        if (!validation.isValid) {
            Logger.error('Configuration validation failed', { errors: validation.errors });
            process.exit(1);
        }

        // Create and start server
        const server = new Server();

        const port = ConfigManager.get('app.port');
        const host = ConfigManager.get('app.host');

        await server.start(port, host);

        // Log successful startup
        Logger.info('✅ Application started successfully', {
            url: `http://${host}:${port}`,
            endpoints: [
                'GET /api/health - Health check',
                'POST /api/forms - Create form',
                'GET /api/forms/:id - Get form by ID',
                'PUT /api/forms/:id - Update form',
                'DELETE /api/forms/:id - Delete form',
                'GET /api/forms - List all forms',
                'POST /api/forms/validate - Validate form data',
                'GET /api/stats - System statistics'
            ]
        });

        // Log feature status
        const features = ConfigManager.getSection('features');
        Logger.info('Feature flags', features);

    } catch (error) {
        Logger.error('Failed to start application', {
            error: error.message,
            stack: error.stack
        });
        process.exit(1);
    }
}

// Handle command line arguments
const args = process.argv.slice(2);
const commands = {
    '--help': showHelp,
    '--version': showVersion,
    '--config': showConfig,
    '--test': runTests
};

function showHelp() {
    console.log(`
🧠 Time Travel Bug Demo - AI-powered bug investigation workflow

Usage: node app.js [options]

Options:
  --help      Show this help message
  --version   Show version information
  --config    Show current configuration
  --test      Run basic functionality tests

Environment Variables:
  NODE_ENV            Set environment (development, production)
  PORT                Server port (default: 3000)
  HOST                Server host (default: localhost)
  LOG_LEVEL           Logging level (ERROR, WARN, INFO, DEBUG)
  ENABLE_FILE_LOGGING Enable file logging (true/false)

Examples:
  node app.js                    # Start server with default config
  PORT=8080 node app.js         # Start server on port 8080
  LOG_LEVEL=DEBUG node app.js   # Start with debug logging
  `);
}

function showVersion() {
    console.log(`
Time Travel Bug Demo v${ConfigManager.get('app.version')}
Node.js ${process.version}
Platform: ${process.platform}
Environment: ${ConfigManager.get('app.environment')}
  `);
}

function showConfig() {
    console.log('Current Configuration:');
    console.log(JSON.stringify(ConfigManager.getAll(), null, 2));
}

async function runTests() {
    Logger.info('🧪 Running basic functionality tests...');

    try {
        const FormHandler = require('./server/FormHandler');
        const DatabaseManager = require('./server/DatabaseManager');

        // Test form validation
        const validationResult = FormHandler.handleValidation({
            name: 'Test User',
            email: 'test@example.com',
            field: 'test data',
            message: 'This is a test message'
        });

        console.log('✅ Form validation test:', validationResult.success ? 'PASSED' : 'FAILED');

        // Test form save
        const saveResult = FormHandler.handleSave({
            name: 'Test User',
            email: 'test@example.com',
            field: 'test data'
        });

        console.log('✅ Form save test:', saveResult.success ? 'PASSED' : 'FAILED');

        // Test database operations
        const record = DatabaseManager.create({ test: 'data' });
        const retrieved = DatabaseManager.read(record.id);
        const updated = DatabaseManager.update(record.id, { test: 'updated data' });
        DatabaseManager.delete(record.id);

        console.log('✅ Database CRUD test: PASSED');

        // Test config manager
        const config = ConfigManager.get('app.name');
        console.log('✅ Config manager test:', config ? 'PASSED' : 'FAILED');

        Logger.info('🎉 All tests completed successfully!');

    } catch (error) {
        Logger.error('❌ Tests failed', { error: error.message });
        process.exit(1);
    }
}

// Process command line arguments
if (args.length > 0) {
    const command = args[0];
    if (commands[command]) {
        commands[command]();
        if (command !== '--test') {
            process.exit(0);
        }
    } else {
        console.error(`Unknown command: ${command}`);
        console.error('Use --help for available options');
        process.exit(1);
    }
}

// Start the application if no specific command was run
if (args.length === 0 || args[0] === '--test') {
    startApplication();
}

module.exports = { startApplication };
