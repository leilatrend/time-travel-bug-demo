/**
 * API Router Module
 * Handles HTTP routing and API endpoints
 */

const FormHandler = require('./FormHandler');
const DatabaseManager = require('./DatabaseManager');
const Logger = require('./Logger');

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
    
    // Database routes
    this.register('GET', '/api/forms', this.handleFormList.bind(this));
    this.register('GET', '/api/stats', this.handleStats.bind(this));
    
    // Health check
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
      
      const stats = DatabaseManager.getStats();
      
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
