# 🧠 Time Travel Bug Demo

This repository demonstrates an AI-powered workflow for investigating which Git commit likely introduced a bug. The project simulates a real-world Node.js application with intentionally placed bugs across different commits to test debugging capabilities.

---

## 🔍 Project Overview

This demo contains a full-featured Node.js application with:

- **Form handling system** with validation and CRUD operations
- **User management** with authentication and sessions
- **File upload system** with validation and storage
- **API documentation generator** with interactive HTML output
- **Performance monitoring** with metrics and alerts
- **Advanced caching system** with LRU eviction and TTL
- **Security utilities** with input sanitization and rate limiting

**The catch**: Four subtle bugs are intentionally hidden in different commits to test AI-powered debugging workflows.

---

<<<<<<< HEAD
## 🏗️ Architecture

```text
time-travel-bug-demo/
├── server/
│   ├── FormHandler.js          # ✅ Historical bug fixed in b04b475
│   ├── UserManager.js          # 🐛 Contains hashPassword bug
│   ├── FileUploadHandler.js    # 🐛 Contains file processing bugs
│   ├── APIRouter.js            # 🐛 Contains fileData handling bug
│   ├── DatabaseManager.js      # In-memory database with CRUD
│   ├── Logger.js               # Multi-level logging system
│   ├── ConfigManager.js        # Configuration management
│   ├── Middleware.js           # HTTP middleware collection
│   ├── Server.js               # Main HTTP server
│   ├── APIDocumentationGenerator.js # Auto-generates API docs
│   ├── PerformanceMonitor.js   # Request/memory monitoring
│   ├── CacheManager.js         # LRU cache with TTL
│   ├── SecurityUtils.js        # Security & validation tools
│   └── DataValidator.js        # Comprehensive validation
├── config/
│   └── app.json                # Application configuration
├── app.js                      # Application entry point
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

---

=======
>>>>>>> 16fb4edca35dad333809584abee51709c46ee6ed
## � Quick Start

### Prerequisites

- Node.js 14+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/leilatrend/time-travel-bug-demo.git
cd time-travel-bug-demo

# Install dependencies
npm install

# Start the application
npm start
```

The server will start on `http://localhost:3000`

### Available Scripts

```bash
npm start          # Start the application
npm run dev        # Start in development mode
npm test           # Run tests (placeholder)
npm run docs       # Generate API documentation
```

---

## 📡 API Endpoints

### Form Management

- `POST /api/forms` - Create form
- `GET /api/forms/:id` - Get form by ID
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form

### User Management

- `POST /api/users/register` - Register user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### File Management  

- `POST /api/files/upload` - Upload file
- `GET /api/files/:id` - Get file info
- `GET /api/files/:id/download` - Download file
- `DELETE /api/files/:id` - Delete file

### System

- `GET /api/health` - Health check
- `GET /api/stats` - System statistics
- `GET /api/docs` - API documentation

---

## 🤖 AI Debugging Workflow

This repository is designed to test AI systems that can:

1. **Analyze error messages** and stack traces
2. **Correlate bugs with commit history**
3. **Identify the most likely problematic commit**
4. **Provide reasoning** for the analysis
5. **Suggest fixes** or investigation steps

---

## 🛠️ Development Notes

### Design Principles

- **Realistic complexity**: The application has real features, not just toy examples
- **Subtle bugs**: Errors that require actual investigation, not obvious typos
- **Layered architecture**: Multiple modules with proper separation of concerns
- **Production patterns**: Uses real-world patterns like middleware, validation, logging
- **Bug evolution**: Includes both active bugs and historical fixes for comprehensive analysis

---

## 📝 License

This project is for demonstration purposes. Feel free to use and modify.

---

## 🙋 Contributing

This is a demo project, but suggestions for more realistic bugs or improved architecture are welcome!

---

## Happy time-traveling! 🕰️🐛
