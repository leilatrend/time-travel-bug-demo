/**
 * API Router Module
 * Handles HTTP routing and API endpoints
 */

const FormHandler = require('./FormHandler');
const DatabaseManager = require('./DatabaseManager');
const Logger = require('./Logger');
const UserManager = require('./UserManager');
const FileUploadHandler = require('./FileUploadHandler');

class APIRouter {
    constructor() {
        this.routes = new Map();
        this.middleware = [];
        this.setupRoutes();
    }

    /**
     * Add middleware function
     */
    use(middleware) {
        this.middleware.push(middleware);
    }

    /**
     * Register a route
     */
    register(method, path, handler) {
        const key = `${method.toUpperCase()}:${path}`;
        this.routes.set(key, handler);
    }

    /**
     * Setup all API routes
     */
    setupRoutes() {
        // Form handling routes
        this.register('POST', '/api/forms', this.handleFormCreate.bind(this));
        this.register('GET', '/api/forms/:id', this.handleFormGet.bind(this));
        this.register('PUT', '/api/forms/:id', this.handleFormUpdate.bind(this));
        this.register('DELETE', '/api/forms/:id', this.handleFormDelete.bind(this));
        this.register('POST', '/api/forms/validate', this.handleFormValidate.bind(this));
        this.register('GET', '/api/forms', this.handleFormList.bind(this));

        // User management routes
        this.register('POST', '/api/users/register', this.handleUserRegister.bind(this));
        this.register('POST', '/api/users/login', this.handleUserLogin.bind(this));
        this.register('POST', '/api/users/logout', this.handleUserLogout.bind(this));
        this.register('GET', '/api/users/profile', this.handleUserProfile.bind(this));
        this.register('PUT', '/api/users/profile', this.handleUserProfileUpdate.bind(this));
        this.register('GET', '/api/users', this.handleUserList.bind(this));

        // File upload routes
        this.register('POST', '/api/files/upload', this.handleFileUpload.bind(this));
        this.register('GET', '/api/files/:id', this.handleFileGet.bind(this));
        this.register('GET', '/api/files/:id/download', this.handleFileDownload.bind(this));
        this.register('DELETE', '/api/files/:id', this.handleFileDelete.bind(this));
        this.register('GET', '/api/files', this.handleFileList.bind(this));

        // System routes
        this.register('GET', '/api/stats', this.handleStats.bind(this));
        this.register('GET', '/api/health', this.handleHealthCheck.bind(this));
    }

    /**
     * Apply middleware to request
     */
    async applyMiddleware(req, res) {
        for (const middleware of this.middleware) {
            await middleware(req, res);
        }
    }

    /**
     * Route handler for form creation
     */
    async handleFormCreate(req, res) {
        try {
            Logger.info('API: Creating new form', { body: req.body });

            const result = FormHandler.handleSave(req.body);

            if (result.success) {
                const dbRecord = DatabaseManager.create(result.data);
                Logger.info('API: Form created successfully', { id: dbRecord.id });

                return {
                    status: 201,
                    data: dbRecord,
                    message: 'Form created successfully'
                };
            } else {
                Logger.error('API: Form creation failed', { error: result.error });
                return {
                    status: 400,
                    error: result.error,
                    message: result.message
                };
            }
        } catch (error) {
            Logger.error('API: Unexpected error in form creation', { error: error.message });
            return {
                status: 500,
                error: 'Internal server error',
                message: 'An unexpected error occurred'
            };
        }
    }

    /**
     * Route handler for getting a form
     */
    async handleFormGet(req, res) {
        try {
            const id = parseInt(req.params.id);
            Logger.info('API: Getting form', { id });

            const record = DatabaseManager.read(id);

            if (record) {
                return {
                    status: 200,
                    data: record,
                    message: 'Form retrieved successfully'
                };
            } else {
                return {
                    status: 404,
                    error: 'Form not found',
                    message: `Form with ID ${id} does not exist`
                };
            }
        } catch (error) {
            Logger.error('API: Error getting form', { error: error.message });
            return {
                status: 500,
                error: 'Internal server error',
                message: 'Failed to retrieve form'
            };
        }
    }

    /**
     * Route handler for updating a form
     */
    async handleFormUpdate(req, res) {
        try {
            const id = parseInt(req.params.id);
            Logger.info('API: Updating form', { id, body: req.body });

            const result = FormHandler.handleUpdate(id, req.body);

            if (result.success) {
                const dbRecord = DatabaseManager.update(id, result.data);
                Logger.info('API: Form updated successfully', { id });

                return {
                    status: 200,
                    data: dbRecord,
                    message: 'Form updated successfully'
                };
            } else {
                return {
                    status: 400,
                    error: result.error,
                    message: result.message
                };
            }
        } catch (error) {
            Logger.error('API: Error updating form', { error: error.message });
            return {
                status: error.message.includes('not found') ? 404 : 500,
                error: error.message,
                message: 'Failed to update form'
            };
        }
    }

    /**
     * Route handler for deleting a form
     */
    async handleFormDelete(req, res) {
        try {
            const id = parseInt(req.params.id);
            Logger.info('API: Deleting form', { id });

            const result = FormHandler.handleDelete(id);

            if (result.success) {
                const dbRecord = DatabaseManager.delete(id);
                Logger.info('API: Form deleted successfully', { id });

                return {
                    status: 200,
                    data: dbRecord,
                    message: 'Form deleted successfully'
                };
            } else {
                return {
                    status: 400,
                    error: result.error,
                    message: result.message
                };
            }
        } catch (error) {
            Logger.error('API: Error deleting form', { error: error.message });
            return {
                status: error.message.includes('not found') ? 404 : 500,
                error: error.message,
                message: 'Failed to delete form'
            };
        }
    }

    /**
     * Route handler for form validation
     */
    async handleFormValidate(req, res) {
        try {
            Logger.info('API: Validating form', { body: req.body });

            const result = FormHandler.handleValidation(req.body);

            return {
                status: result.success ? 200 : 400,
                data: result,
                message: result.message
            };
        } catch (error) {
            Logger.error('API: Error validating form', { error: error.message });
            return {
                status: 500,
                error: 'Internal server error',
                message: 'Failed to validate form'
            };
        }
    }

    /**
     * Route handler for listing forms
     */
    async handleFormList(req, res) {
        try {
            Logger.info('API: Listing forms');

            const forms = DatabaseManager.getAll();

            return {
                status: 200,
                data: {
                    forms,
                    total: forms.length
                },
                message: 'Forms retrieved successfully'
            };
        } catch (error) {
            Logger.error('API: Error listing forms', { error: error.message });
            return {
                status: 500,
                error: 'Internal server error',
                message: 'Failed to retrieve forms'
            };
        }
    }

    /**
     * Route handler for system statistics
     */
    async handleStats(req, res) {
        try {
            Logger.info('API: Getting system stats');

            const dbStats = DatabaseManager.getStats();
            const userStats = UserManager.getUserStats();
            const fileStats = FileUploadHandler.getUploadStats();

            const stats = {
                database: dbStats,
                users: userStats,
                files: fileStats,
                system: {
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    nodeVersion: process.version,
                    platform: process.platform
                }
            };

            return {
                status: 200,
                data: stats,
                message: 'Statistics retrieved successfully'
            };
        } catch (error) {
            Logger.error('API: Error getting stats', { error: error.message });
            return {
                status: 500,
                error: 'Internal server error',
                message: 'Failed to retrieve statistics'
            };
        }
    }

    // User Management Handlers

    /**
     * Route handler for user registration
     */
    async handleUserRegister(req, res) {
        try {
            Logger.info('API: User registration', { email: req.body.email });

            const result = await UserManager.registerUser(req.body);

            return {
                status: result.success ? 201 : 400,
                data: result.user || null,
                error: result.success ? null : result.error,
                message: result.message
            };
        } catch (error) {
            Logger.error('API: User registration error', { error: error.message });
            return {
                status: 500,
                error: 'Internal server error',
                message: 'Registration failed'
            };
        }
    }

    /**
     * Route handler for user login
     */
    async handleUserLogin(req, res) {
        try {
            Logger.info('API: User login', { email: req.body.email });

            const result = await UserManager.loginUser(req.body.email, req.body.password);

            return {
                status: result.success ? 200 : 401,
                data: result.success ? { user: result.user, token: result.sessionToken } : null,
                error: result.success ? null : result.error,
                message: result.message
            };
        } catch (error) {
            Logger.error('API: User login error', { error: error.message });
            return {
                status: 500,
                error: 'Internal server error',
                message: 'Login failed'
            };
        }
    }

    /**
     * Route handler for user logout
     */
    async handleUserLogout(req, res) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return {
                    status: 401,
                    error: 'Authorization token required',
                    message: 'Please provide a valid session token'
                };
            }

            const result = UserManager.logoutUser(token);

            return {
                status: result.success ? 200 : 400,
                error: result.success ? null : result.error,
                message: result.message
            };
        } catch (error) {
            Logger.error('API: User logout error', { error: error.message });
            return {
                status: 500,
                error: 'Internal server error',
                message: 'Logout failed'
            };
        }
    }

    /**
     * Route handler for getting user profile
     */
    async handleUserProfile(req, res) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return {
                    status: 401,
                    error: 'Authorization token required',
                    message: 'Please provide a valid session token'
                };
            }

            const sessionResult = UserManager.validateSession(token);
            if (!sessionResult.valid) {
                return {
                    status: 401,
                    error: sessionResult.error,
                    message: 'Invalid or expired session'
                };
            }

            const result = UserManager.getUserProfile(sessionResult.user.id);

            return {
                status: result.success ? 200 : 404,
                data: result.user || null,
                error: result.success ? null : result.error,
                message: result.message
            };
        } catch (error) {
            Logger.error('API: Get user profile error', { error: error.message });
            return {
                status: 500,
                error: 'Internal server error',
                message: 'Failed to get user profile'
            };
        }
    }

    /**
     * Route handler for updating user profile
     */
    async handleUserProfileUpdate(req, res) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return {
                    status: 401,
                    error: 'Authorization token required',
                    message: 'Please provide a valid session token'
                };
            }

            const sessionResult = UserManager.validateSession(token);
            if (!sessionResult.valid) {
                return {
                    status: 401,
                    error: sessionResult.error,
                    message: 'Invalid or expired session'
                };
            }

            const result = UserManager.updateUserProfile(sessionResult.user.id, req.body);

            return {
                status: result.success ? 200 : 400,
                data: result.user || null,
                error: result.success ? null : result.error,
                message: result.message
            };
        } catch (error) {
            Logger.error('API: Update user profile error', { error: error.message });
            return {
                status: 500,
                error: 'Internal server error',
                message: 'Failed to update user profile'
            };
        }
    }

    /**
     * Route handler for listing users
     */
    async handleUserList(req, res) {
        try {
            // This could be restricted to admin users in a real app
            const result = UserManager.getAllUsers();

            return {
                status: 200,
                data: result,
                message: result.message
            };
        } catch (error) {
            Logger.error('API: List users error', { error: error.message });
            return {
                status: 500,
                error: 'Internal server error',
                message: 'Failed to list users'
            };
        }
    }

    // File Upload Handlers

    /**
     * Route handler for file upload
     */
    async handleFileUpload(req, res) {
        try {
            Logger.info('API: File upload request');

            // Extract user info from token if available
            let userId = 'anonymous';
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (token) {
                const sessionResult = UserManager.validateSession(token);
                if (sessionResult.valid) {
                    userId = sessionResult.user.id;
                }
            }

            const fileData = Buffer.from(req.body.fileData, 'base64');

            const metadata = {
                originalName: req.body.fileName || 'upload',
                userId: userId,
                description: req.body.description,
                tags: req.body.tags || [],
                isPublic: req.body.isPublic || false
            };

            const result = await FileUploadHandler.processUpload(fileData, metadata);

            return {
                status: result.success ? 201 : 400,
                data: result.file || null,
                error: result.success ? null : result.error,
                message: result.message
            };
        } catch (error) {
            Logger.error('API: File upload error', { error: error.message });
            return {
                status: 500,
                error: 'Internal server error',
                message: 'File upload failed'
            };
        }
    }

    /**
     * Route handler for getting file info
     */
    async handleFileGet(req, res) {
        try {
            const fileId = req.params.id;
            Logger.info('API: Getting file info', { fileId });

            const result = FileUploadHandler.getFileInfo(fileId);

            return {
                status: result.success ? 200 : 404,
                data: result.file || null,
                error: result.success ? null : result.error,
                message: result.message
            };
        } catch (error) {
            Logger.error('API: Get file info error', { error: error.message });
            return {
                status: 500,
                error: 'Internal server error',
                message: 'Failed to get file information'
            };
        }
    }

    /**
     * Route handler for file download
     */
    async handleFileDownload(req, res) {
        try {
            const fileId = req.params.id;
            Logger.info('API: File download', { fileId });

            const result = await FileUploadHandler.downloadFile(fileId);

            if (result.success) {
                // Set appropriate headers for file download
                res.setHeader('Content-Type', result.mimeType);
                res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);

                return {
                    status: 200,
                    data: result.fileData,
                    headers: {
                        'Content-Type': result.mimeType,
                        'Content-Disposition': `attachment; filename="${result.fileName}"`
                    },
                    message: result.message
                };
            } else {
                return {
                    status: 404,
                    error: result.error,
                    message: result.message
                };
            }
        } catch (error) {
            Logger.error('API: File download error', { error: error.message });
            return {
                status: 500,
                error: 'Internal server error',
                message: 'File download failed'
            };
        }
    }

    /**
     * Route handler for file deletion
     */
    async handleFileDelete(req, res) {
        try {
            const fileId = req.params.id;
            Logger.info('API: File deletion', { fileId });

            const result = await FileUploadHandler.deleteFile(fileId);

            return {
                status: result.success ? 200 : 404,
                error: result.success ? null : result.error,
                message: result.message
            };
        } catch (error) {
            Logger.error('API: File deletion error', { error: error.message });
            return {
                status: 500,
                error: 'Internal server error',
                message: 'File deletion failed'
            };
        }
    }

    /**
     * Route handler for listing files
     */
    async handleFileList(req, res) {
        try {
            Logger.info('API: Listing files');

            const userId = req.query.userId;
            const isPublic = req.query.public === 'true' ? true : req.query.public === 'false' ? false : null;

            const result = FileUploadHandler.listFiles(userId, isPublic);

            return {
                status: 200,
                data: result,
                message: result.message
            };
        } catch (error) {
            Logger.error('API: List files error', { error: error.message });
            return {
                status: 500,
                error: 'Internal server error',
                message: 'Failed to list files'
            };
        }
    }

    /**
     * Route handler for health check
     */
    async handleHealthCheck(req, res) {
        return {
            status: 200,
            data: {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                version: '1.0.0'
            },
            message: 'Service is healthy'
        };
    }

    /**
     * Handle incoming requests
     */
    async handleRequest(method, path, req, res) {
        try {
            await this.applyMiddleware(req, res);

            const key = `${method.toUpperCase()}:${path}`;
            const handler = this.routes.get(key);

            if (handler) {
                return await handler(req, res);
            } else {
                return {
                    status: 404,
                    error: 'Route not found',
                    message: `${method} ${path} is not a valid endpoint`
                };
            }
        } catch (error) {
            Logger.error('API: Unhandled error', { error: error.message });
            return {
                status: 500,
                error: 'Internal server error',
                message: 'An unexpected error occurred'
            };
        }
    }
}

module.exports = new APIRouter();
