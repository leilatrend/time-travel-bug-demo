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

## 🐛 Hidden Bugs for Testing

### Bug 1: UserManager hashPassword Null Pointer

- **Location**: `server/UserManager.js:36`
- **Commit**: `f329d1d`
- **Trigger**: Register user with `null` password
- **Error**: `Cannot read properties of null (reading 'toString')`

**Example User Report:**
> I'm seeing this error when trying to register a user:
> "Cannot read properties of null (reading 'toString')"
> Seems to happen when the password is null.
> Can you help me figure out which commit caused this?

**Complete Error Log:**

```text
[2025-07-23T10:30:45.123Z] [12345] [ERROR] User registration failed | {"error":"Cannot read properties of null (reading 'toString')","email":"user@example.com"}

TypeError: Cannot read properties of null (reading 'toString')
    at UserManager.hashPassword (/Users/leila_kao/dev/ai/time-travel-bug-demo/server/UserManager.js:32:48)
    at UserManager.registerUser (/Users/leila_kao/dev/ai/time-travel-bug-demo/server/UserManager.js:64:39)
```

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":null,"name":"Test User"}'
```

### Bug 2: APIRouter fileData Buffer Error

- **Location**: `server/APIRouter.js:515`
- **Commit**: `935d7fe`
- **Trigger**: Upload file without `fileData` field
- **Error**: `The first argument must be of type string...Received undefined`

**Example User Report:**
> We get this error when uploading a file without providing fileData:
> "The first argument must be of type string or an instance of Buffer [...] Received undefined"
> Can you investigate which commit might have introduced this bug?

**Complete Error Log:**

```text
[2025-07-23T10:35:12.456Z] [12345] [ERROR] API: File upload error | {"error":"The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object. Received undefined"}

TypeError: The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object. Received undefined
    at Function.from (buffer.js:330:9)
    at APIRouter.handleFileUpload (/Users/leila_kao/dev/ai/time-travel-bug-demo/server/APIRouter.js:412:42)
```

```bash
curl -X POST http://localhost:3000/api/files/upload \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.txt","description":"Test file"}'
```

### Bug 3: FileUploadHandler writeFile Edge Case

- **Location**: `server/FileUploadHandler.js:76`
- **Commit**: `eb1c426`
- **Trigger**: Pass `null` fileData in edge cases
- **Error**: File write errors or confusing error messages

**Example User Report:**
> When uploading a file, sometimes we get this:
> "ENOENT: no such file or directory"
> Looks like it's trying to write to a file that doesn't exist.
> Can you track down which commit may be responsible?

**Complete Error Log:**

```text
[2025-07-23T10:40:33.789Z] [12345] [ERROR] File upload failed | {"error":"ENOENT: no such file or directory, open '/Users/leila_kao/dev/ai/time-travel-bug-demo/uploads/1690191633789_abc123.txt'","originalName":"test.txt"}

Error: ENOENT: no such file or directory, open '/Users/leila_kao/dev/ai/time-travel-bug-demo/uploads/1690191633789_abc123.txt'
    at async FileUploadHandler.processUpload (/Users/leila_kao/dev/ai/time-travel-bug-demo/server/FileUploadHandler.js:89:7)
```

### Bug 4: FormHandler Null Pointer (Historical Bug)

- **Location**: `server/FormHandler.js:77`
- **Commit**: `f28f553` (original bug) → Fixed in `b04b475`
- **Status**: ✅ Already fixed but useful for historical analysis
- **Original Error**: `Cannot read properties of null (reading 'length')`

**Example User Report:**
> can you fix the issue
> "Clicking the Save button crashes the app.
> The console shows a null pointer exception on line 102 of FormHandler.js."
> and create the pr to the repo

```bash
# This would have triggered the bug in commit f28f553:
curl -X POST http://localhost:3000/api/forms \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","field":null}'
```

---

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

- `POST /api/users/register` - Register user (🐛 **Bug 1 here**)
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### File Management  

- `POST /api/files/upload` - Upload file (🐛 **Bug 2 & 3 here**)
- `GET /api/files/:id` - Get file info
- `GET /api/files/:id/download` - Download file
- `DELETE /api/files/:id` - Delete file

### System

- `GET /api/health` - Health check
- `GET /api/stats` - System statistics
- `GET /api/docs` - API documentation

---

## 🔬 Testing the Bugs

### Manual Testing

Each bug can be triggered with specific API calls. Use the curl commands provided in the bug descriptions above.

### Expected Error Messages

The bugs produce realistic error messages that require investigation:

1. **Null pointer exceptions** that don't immediately point to the root cause
2. **Buffer type errors** with confusing stack traces
3. **File system errors** that mask the real validation issue
4. **Historical bugs** that demonstrate the evolution of code quality

---

## 🕰️ Git Commit History

The bugs are strategically placed in different commits:

```bash
git log --oneline
# 5335543 (HEAD) docs: Update README with comprehensive bug descriptions
# 7ed85ca feat: Add comprehensive security utilities
# 9cadd12 feat: Add advanced cache management system
# 9467c3e feat: Add comprehensive performance monitoring
# cd39a8e feat: Add comprehensive API documentation generator
# d1f7f77 feat: Add comprehensive data validation utilities
# 935d7fe feat: Integrate user and file APIs (🐛 Bug 2)
# eb1c426 feat: Add file upload system (🐛 Bug 3)
# f329d1d feat: Add user management (🐛 Bug 1)
# 3372278 feat: Add application entry point
# 0c81708 feat: Add HTTP server architecture
# 12def10 feat: Add core infrastructure modules
# b04b475 feat: Enhanced FormHandler (✅ Fixed Bug 4)
# f28f553 feat: Save form data without null check (🐛 Bug 4 - Original)
```

### Bug Timeline Summary

- **Bug 4 (FormHandler)**: Introduced in `f28f553` → Fixed in `b04b475`
- **Bug 1 (UserManager)**: Introduced in `f329d1d` → Still present
- **Bug 3 (FileUploadHandler)**: Introduced in `eb1c426` → Still present
- **Bug 2 (APIRouter)**: Introduced in `935d7fe` → Still present

---

## 🤖 AI Debugging Workflow

This repository is designed to test AI systems that can:

1. **Analyze error messages** and stack traces
2. **Correlate bugs with commit history**
3. **Identify the most likely problematic commit**
4. **Provide reasoning** for the analysis
5. **Suggest fixes** or investigation steps

### Example Workflow

1. User reports: *"File upload fails with Buffer type error"*
2. AI analyzes recent commits involving file handling
3. AI identifies commit `935d7fe` as most likely culprit
4. AI suggests checking `APIRouter.js` line 515 for `fileData` handling
5. Developer can time-travel to that commit for investigation

### Historical Bug Analysis Example

1. User reports: *"FormHandler null pointer error"*
2. AI searches commit history for form-related changes
3. AI finds bug was introduced in `f28f553` and fixed in `b04b475`
4. AI provides timeline of the bug lifecycle
5. Developer can study both the introduction and fix for learning

---

## 🛠️ Development Notes

### Design Principles

- **Realistic complexity**: The application has real features, not just toy examples
- **Subtle bugs**: Errors that require actual investigation, not obvious typos
- **Layered architecture**: Multiple modules with proper separation of concerns
- **Production patterns**: Uses real-world patterns like middleware, validation, logging
- **Bug evolution**: Includes both active bugs and historical fixes for comprehensive analysis

### Adding New Bugs

To add more test bugs:

1. Create a new feature in a separate commit
2. Introduce a subtle bug with a `🐛` comment
3. Add several more commits after it
4. Document the bug in this README

---

## 📝 License

This project is for demonstration purposes. Feel free to use and modify.

---

## 🙋 Contributing

This is a demo project, but suggestions for more realistic bugs or improved architecture are welcome!

---

## Happy time-traveling! 🕰️🐛
