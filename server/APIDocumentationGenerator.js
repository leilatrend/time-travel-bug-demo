/**
 * API Documentation Generator
 * Generates interactive API documentation for all endpoints
 */

const ConfigManager = require('./ConfigManager');

class APIDocumentationGenerator {
  constructor() {
    this.endpoints = new Map();
    this.setupEndpoints();
  }

  /**
   * Setup all API endpoint documentation
   */
  setupEndpoints() {
    // Form endpoints
    this.addEndpoint('POST', '/api/forms', {
      summary: 'Create a new form',
      description: 'Creates a new form with validation and stores it in the database',
      requestBody: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 50 },
          email: { type: 'string', format: 'email' },
          field: { type: 'string', maxLength: 100 },
          message: { type: 'string', maxLength: 500 }
        }
      },
      responses: {
        201: { description: 'Form created successfully' },
        400: { description: 'Validation error' },
        500: { description: 'Internal server error' }
      }
    });

    this.addEndpoint('GET', '/api/forms/{id}', {
      summary: 'Get form by ID',
      description: 'Retrieves a specific form by its ID',
      parameters: [
        { name: 'id', in: 'path', required: true, type: 'integer' }
      ],
      responses: {
        200: { description: 'Form retrieved successfully' },
        404: { description: 'Form not found' },
        500: { description: 'Internal server error' }
      }
    });

    this.addEndpoint('PUT', '/api/forms/{id}', {
      summary: 'Update form',
      description: 'Updates an existing form',
      parameters: [
        { name: 'id', in: 'path', required: true, type: 'integer' }
      ],
      requestBody: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 50 },
          email: { type: 'string', format: 'email' },
          field: { type: 'string', maxLength: 100 },
          message: { type: 'string', maxLength: 500 }
        }
      },
      responses: {
        200: { description: 'Form updated successfully' },
        400: { description: 'Validation error' },
        404: { description: 'Form not found' },
        500: { description: 'Internal server error' }
      }
    });

    // User endpoints
    this.addEndpoint('POST', '/api/users/register', {
      summary: 'Register new user',
      description: 'Creates a new user account with email validation',
      requestBody: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          name: { type: 'string', maxLength: 50 },
          role: { type: 'string', enum: ['user', 'admin'] }
        }
      },
      responses: {
        201: { description: 'User registered successfully' },
        400: { description: 'Validation error or user already exists' },
        500: { description: 'Internal server error' }
      }
    });

    this.addEndpoint('POST', '/api/users/login', {
      summary: 'User login',
      description: 'Authenticates user and returns session token',
      requestBody: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      },
      responses: {
        200: { description: 'Login successful, returns user and token' },
        401: { description: 'Invalid credentials' },
        500: { description: 'Internal server error' }
      }
    });

    // File endpoints
    this.addEndpoint('POST', '/api/files/upload', {
      summary: 'Upload file',
      description: 'Uploads a file with validation and metadata',
      headers: {
        'Authorization': { type: 'string', description: 'Bearer token (optional)' }
      },
      requestBody: {
        type: 'object',
        required: ['fileData', 'fileName'],
        properties: {
          fileData: { type: 'string', format: 'base64' },
          fileName: { type: 'string' },
          description: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          isPublic: { type: 'boolean' }
        }
      },
      responses: {
        201: { description: 'File uploaded successfully' },
        400: { description: 'Validation error or file too large' },
        500: { description: 'Internal server error' }
      }
    });

    // System endpoints
    this.addEndpoint('GET', '/api/health', {
      summary: 'Health check',
      description: 'Returns system health status',
      responses: {
        200: { description: 'System is healthy' }
      }
    });

    this.addEndpoint('GET', '/api/stats', {
      summary: 'System statistics',
      description: 'Returns comprehensive system statistics',
      responses: {
        200: { description: 'Statistics retrieved successfully' },
        500: { description: 'Internal server error' }
      }
    });
  }

  /**
   * Add endpoint documentation
   */
  addEndpoint(method, path, documentation) {
    const key = `${method.toUpperCase()}:${path}`;
    this.endpoints.set(key, {
      method: method.toUpperCase(),
      path,
      ...documentation
    });
  }

  /**
   * Generate HTML documentation
   */
  generateHTMLDocumentation() {
    const config = ConfigManager.getSection('app');
    const endpoints = Array.from(this.endpoints.values());

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.name} - API Documentation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .endpoint {
            background: white;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .endpoint-header {
            padding: 20px;
            border-bottom: 1px solid #eee;
        }
        .method {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 12px;
            margin-right: 10px;
        }
        .method.get { background: #28a745; color: white; }
        .method.post { background: #007bff; color: white; }
        .method.put { background: #ffc107; color: black; }
        .method.delete { background: #dc3545; color: white; }
        .path {
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 16px;
            font-weight: bold;
        }
        .summary {
            margin: 10px 0 5px 0;
            font-size: 18px;
            font-weight: 600;
        }
        .description {
            color: #666;
            margin-bottom: 10px;
        }
        .endpoint-body {
            padding: 20px;
        }
        .section {
            margin-bottom: 20px;
        }
        .section-title {
            font-weight: 600;
            margin-bottom: 10px;
            color: #495057;
        }
        .code {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 10px;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 14px;
            white-space: pre-wrap;
        }
        .response-code {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
            font-weight: bold;
            margin-right: 8px;
        }
        .response-200 { background: #d4edda; color: #155724; }
        .response-201 { background: #d4edda; color: #155724; }
        .response-400 { background: #f8d7da; color: #721c24; }
        .response-401 { background: #f8d7da; color: #721c24; }
        .response-404 { background: #f8d7da; color: #721c24; }
        .response-500 { background: #f8d7da; color: #721c24; }
        .property {
            margin: 5px 0;
            padding-left: 20px;
        }
        .property-name {
            font-family: monospace;
            font-weight: bold;
            color: #0056b3;
        }
        .property-type {
            color: #6f42c1;
            font-style: italic;
        }
        .required {
            color: #dc3545;
            font-weight: bold;
        }
        .toc {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .toc h3 {
            margin-top: 0;
        }
        .toc ul {
            list-style: none;
            padding-left: 0;
        }
        .toc li {
            margin: 5px 0;
        }
        .toc a {
            text-decoration: none;
            color: #007bff;
        }
        .toc a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${config.name}</h1>
        <p>API Documentation - Version ${config.version}</p>
        <p>Base URL: http://${config.host}:${config.port}</p>
    </div>

    <div class="toc">
        <h3>📚 Table of Contents</h3>
        <ul>
            ${endpoints.map(endpoint => 
                `<li><a href="#${this.generateAnchor(endpoint.method, endpoint.path)}">
                    <span class="method ${endpoint.method.toLowerCase()}">${endpoint.method}</span>
                    ${endpoint.path} - ${endpoint.summary}
                </a></li>`
            ).join('')}
        </ul>
    </div>

    ${endpoints.map(endpoint => this.generateEndpointHTML(endpoint)).join('')}

    <div style="margin-top: 40px; padding: 20px; background: white; border-radius: 8px; text-align: center;">
        <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
        <p>This documentation was automatically generated from the API router configuration.</p>
    </div>

    <script>
        // Add smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    </script>
</body>
</html>`;
  }

  /**
   * Generate HTML for a single endpoint
   */
  generateEndpointHTML(endpoint) {
    const anchor = this.generateAnchor(endpoint.method, endpoint.path);
    
    return `
    <div class="endpoint" id="${anchor}">
        <div class="endpoint-header">
            <div>
                <span class="method ${endpoint.method.toLowerCase()}">${endpoint.method}</span>
                <span class="path">${endpoint.path}</span>
            </div>
            <div class="summary">${endpoint.summary}</div>
            <div class="description">${endpoint.description}</div>
        </div>
        <div class="endpoint-body">
            ${endpoint.parameters ? this.generateParametersHTML(endpoint.parameters) : ''}
            ${endpoint.headers ? this.generateHeadersHTML(endpoint.headers) : ''}
            ${endpoint.requestBody ? this.generateRequestBodyHTML(endpoint.requestBody) : ''}
            ${endpoint.responses ? this.generateResponsesHTML(endpoint.responses) : ''}
        </div>
    </div>`;
  }

  /**
   * Generate parameters section
   */
  generateParametersHTML(parameters) {
    return `
    <div class="section">
        <div class="section-title">📝 Parameters</div>
        ${parameters.map(param => `
            <div class="property">
                <span class="property-name">${param.name}</span>
                <span class="property-type">(${param.type})</span>
                ${param.required ? '<span class="required">*required</span>' : ''}
                <div style="margin-left: 20px; color: #666;">
                    Location: ${param.in} ${param.description ? `- ${param.description}` : ''}
                </div>
            </div>
        `).join('')}
    </div>`;
  }

  /**
   * Generate headers section
   */
  generateHeadersHTML(headers) {
    return `
    <div class="section">
        <div class="section-title">📋 Headers</div>
        ${Object.entries(headers).map(([name, info]) => `
            <div class="property">
                <span class="property-name">${name}</span>
                <span class="property-type">(${info.type})</span>
                <div style="margin-left: 20px; color: #666;">
                    ${info.description || ''}
                </div>
            </div>
        `).join('')}
    </div>`;
  }

  /**
   * Generate request body section
   */
  generateRequestBodyHTML(requestBody) {
    return `
    <div class="section">
        <div class="section-title">📤 Request Body</div>
        <div class="code">${JSON.stringify(this.generateSchemaExample(requestBody), null, 2)}</div>
        <div style="margin-top: 10px;">
            <strong>Schema:</strong>
            ${this.generateSchemaHTML(requestBody)}
        </div>
    </div>`;
  }

  /**
   * Generate responses section
   */
  generateResponsesHTML(responses) {
    return `
    <div class="section">
        <div class="section-title">📥 Responses</div>
        ${Object.entries(responses).map(([code, info]) => `
            <div style="margin: 10px 0;">
                <span class="response-code response-${code}">${code}</span>
                ${info.description}
            </div>
        `).join('')}
    </div>`;
  }

  /**
   * Generate schema HTML
   */
  generateSchemaHTML(schema) {
    if (schema.type === 'object') {
      return `
        <div style="margin-left: 20px;">
            ${Object.entries(schema.properties || {}).map(([name, prop]) => `
                <div class="property">
                    <span class="property-name">${name}</span>
                    <span class="property-type">(${prop.type})</span>
                    ${schema.required && schema.required.includes(name) ? '<span class="required">*required</span>' : ''}
                    ${prop.minLength ? `<span style="color: #666;"> min: ${prop.minLength}</span>` : ''}
                    ${prop.maxLength ? `<span style="color: #666;"> max: ${prop.maxLength}</span>` : ''}
                    ${prop.format ? `<span style="color: #666;"> format: ${prop.format}</span>` : ''}
                    ${prop.enum ? `<span style="color: #666;"> enum: [${prop.enum.join(', ')}]</span>` : ''}
                </div>
            `).join('')}
        </div>`;
    }
    return '';
  }

  /**
   * Generate example from schema
   */
  generateSchemaExample(schema) {
    if (schema.type === 'object') {
      const example = {};
      for (const [name, prop] of Object.entries(schema.properties || {})) {
        if (prop.type === 'string') {
          if (prop.format === 'email') {
            example[name] = 'user@example.com';
          } else if (prop.format === 'base64') {
            example[name] = 'base64EncodedData...';
          } else {
            example[name] = `example ${name}`;
          }
        } else if (prop.type === 'number' || prop.type === 'integer') {
          example[name] = prop.minimum || 0;
        } else if (prop.type === 'boolean') {
          example[name] = false;
        } else if (prop.type === 'array') {
          example[name] = ['example item'];
        }
      }
      return example;
    }
    return {};
  }

  /**
   * Generate anchor for endpoint
   */
  generateAnchor(method, path) {
    return `${method.toLowerCase()}-${path.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-')}`;
  }

  /**
   * Generate JSON documentation
   */
  generateJSONDocumentation() {
    const config = ConfigManager.getSection('app');
    
    return {
      openapi: '3.0.0',
      info: {
        title: config.name,
        version: config.version,
        description: 'AI-powered workflow for investigating Git commits that introduced bugs'
      },
      servers: [
        {
          url: `http://${config.host}:${config.port}`,
          description: 'Development server'
        }
      ],
      paths: this.generateOpenAPIPaths(),
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer'
          }
        }
      }
    };
  }

  /**
   * Generate OpenAPI paths
   */
  generateOpenAPIPaths() {
    const paths = {};
    
    for (const endpoint of this.endpoints.values()) {
      const path = endpoint.path.replace(/{([^}]+)}/g, '{$1}');
      
      if (!paths[path]) {
        paths[path] = {};
      }
      
      paths[path][endpoint.method.toLowerCase()] = {
        summary: endpoint.summary,
        description: endpoint.description,
        parameters: endpoint.parameters,
        requestBody: endpoint.requestBody ? {
          required: true,
          content: {
            'application/json': {
              schema: endpoint.requestBody
            }
          }
        } : undefined,
        responses: Object.fromEntries(
          Object.entries(endpoint.responses || {}).map(([code, desc]) => [
            code,
            {
              description: typeof desc === 'string' ? desc : desc.description,
              content: {
                'application/json': {
                  schema: {
                    type: 'object'
                  }
                }
              }
            }
          ])
        )
      };
    }
    
    return paths;
  }

  /**
   * Get all endpoints
   */
  getAllEndpoints() {
    return Array.from(this.endpoints.values());
  }

  /**
   * Get endpoint by method and path
   */
  getEndpoint(method, path) {
    const key = `${method.toUpperCase()}:${path}`;
    return this.endpoints.get(key);
  }
}

// Create singleton instance
const apiDocGenerator = new APIDocumentationGenerator();

module.exports = apiDocGenerator;
