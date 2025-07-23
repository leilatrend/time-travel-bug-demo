const fs = require('fs').promises;
const path = require('path');
const Logger = require('./Logger');

class FileUploadHandler {
  constructor(uploadDir = './uploads', maxFileSize = 10 * 1024 * 1024) {
    this.uploadDir = uploadDir;
    this.maxFileSize = maxFileSize;
    this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/pdf'];
    this.ensureUploadDirectory();
  }

  async ensureUploadDirectory() {
    try {
      await fs.access(this.uploadDir);
    } catch (error) {
      await fs.mkdir(this.uploadDir, { recursive: true });
      Logger.info('Created upload directory', { path: this.uploadDir });
    }
  }

  generateFileName(originalName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = path.extname(originalName);
    return `${timestamp}_${random}${extension}`;
  }

  detectMimeType(fileData, fileName) {
    // Simple MIME type detection based on file extension
    const extension = path.extname(fileName).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.txt': 'text/plain',
      '.pdf': 'application/pdf'
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }

  isValidFileType(mimeType) {
    return this.allowedTypes.includes(mimeType);
  }

  /**
   * Fixed processUpload method in FileUploadHandler.js
   */
  async processUpload(fileData, metadata = {}) {
    try {
      Logger.info('Processing file upload', { 
        originalName: metadata.originalName,
        size: fileData ? fileData.length : 0
      });

      // Add null/undefined check for fileData
      if (!fileData || fileData.length === 0) {
        throw new Error('File data is empty or invalid');
      }

      // Validate file size
      if (fileData.length > this.maxFileSize) {
        throw new Error(`File size exceeds maximum limit of ${this.maxFileSize} bytes`);
      }

      // Detect file type (simple implementation)
      const mimeType = this.detectMimeType(fileData, metadata.originalName);
      
      if (!this.isValidFileType(mimeType)) {
        throw new Error(`File type ${mimeType} is not allowed`);
      }

      // Generate unique filename
      const fileName = this.generateFileName(metadata.originalName || 'upload');
      const filePath = path.join(this.uploadDir, fileName);

      // Ensure upload directory exists before writing
      await this.ensureUploadDirectory();

      // Fixed: Add proper validation before writing file
      await fs.writeFile(filePath, fileData);

      // Store file metadata
      const fileInfo = {
        originalName: metadata.originalName,
        fileName: fileName,
        filePath: filePath,
        size: fileData.length,
        mimeType: mimeType,
        uploadedAt: new Date().toISOString()
      };

      Logger.info('File uploaded successfully', fileInfo);

      return {
        success: true,
        file: fileInfo,
        message: 'File uploaded successfully'
      };

    } catch (error) {
      Logger.error('File upload failed', { 
        error: error.message,
        originalName: metadata.originalName 
      });
      
      return {
        success: false,
        error: error.message,
        message: 'File upload failed'
      };
    }
  }

  async deleteFile(fileName) {
    try {
      const filePath = path.join(this.uploadDir, fileName);
      await fs.unlink(filePath);
      Logger.info('File deleted successfully', { fileName });
      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      Logger.error('File deletion failed', { error: error.message, fileName });
      return { success: false, error: error.message };
    }
  }

  async listFiles() {
    try {
      const files = await fs.readdir(this.uploadDir);
      const fileDetails = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(this.uploadDir, file);
          const stats = await fs.stat(filePath);
          return {
            name: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        })
      );
      return { success: true, files: fileDetails };
    } catch (error) {
      Logger.error('Failed to list files', { error: error.message });
      return { success: false, error: error.message };
    }
  }
}

module.exports = FileUploadHandler;
