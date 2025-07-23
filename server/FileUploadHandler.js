/**
 * File Upload Handler Module
 * Handles file upload, validation, and storage operations
 */

const fs = require('fs');
const path = require('path');
const Logger = require('./Logger');
const ConfigManager = require('./ConfigManager');

class FileUploadHandler {
    constructor() {
        this.uploadDir = path.join(__dirname, '../uploads');
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/pdf'];
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.uploadedFiles = new Map();

        this.ensureUploadDirectory();
    }

    /**
     * Ensure upload directory exists
     */
    ensureUploadDirectory() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
            Logger.info('Upload directory created', { dir: this.uploadDir });
        }
    }

    /**
     * Generate unique filename
     */
    generateFileName(originalName) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        const extension = path.extname(originalName);
        return `${timestamp}_${random}${extension}`;
    }

    /**
     * Validate file type
     */
    isValidFileType(mimeType) {
        return this.allowedTypes.includes(mimeType);
    }

    /**
     * Process file upload from multipart data
     */
    async processUpload(fileData, metadata = {}) {
        try {
            Logger.info('Processing file upload', {
                originalName: metadata.originalName,
                size: fileData.length
            });

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
        // FIX: Ensure upload directory exists before writing
        this.ensureUploadDirectory();

            // 🐛 HIDDEN BUG: This will crash when fileData is null/undefined in some edge cases
            // The error message will be confusing and won't point to the real issue
            await fs.promises.writeFile(filePath, fileData);

            // Store file metadata
            const fileRecord = {
                id: this.generateFileId(),
                originalName: metadata.originalName,
                fileName: fileName,
                filePath: filePath,
                mimeType: mimeType,
                size: fileData.length,
                uploadedAt: new Date().toISOString(),
                uploadedBy: metadata.userId || 'anonymous',
                tags: metadata.tags || [],
                description: metadata.description || '',
                isPublic: metadata.isPublic || false
            };

            this.uploadedFiles.set(fileRecord.id, fileRecord);

            Logger.info('File uploaded successfully', {
                fileId: fileRecord.id,
                fileName: fileName,
                size: fileData.length
            });

            return {
                success: true,
                file: fileRecord,
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

    /**
     * Simple MIME type detection
     */
    detectMimeType(fileData, filename) {
        // Check file signature (magic numbers)
        if (fileData.length >= 4) {
            const header = fileData.slice(0, 4);

            // JPEG
            if (header[0] === 0xFF && header[1] === 0xD8) {
                return 'image/jpeg';
            }

            // PNG
            if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
                return 'image/png';
            }

            // PDF
            if (header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46) {
                return 'application/pdf';
            }
        }

        // Fall back to file extension
        const ext = path.extname(filename || '').toLowerCase();
        const extensionMap = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.txt': 'text/plain',
            '.pdf': 'application/pdf'
        };

        return extensionMap[ext] || 'application/octet-stream';
    }

    /**
     * Generate file ID
     */
    generateFileId() {
        return Date.now().toString() + Math.random().toString(36).substring(2);
    }

    /**
     * Get file information
     */
    getFileInfo(fileId) {
        const file = this.uploadedFiles.get(fileId);

        if (!file) {
            return {
                success: false,
                error: 'File not found',
                message: 'The requested file does not exist'
            };
        }

        // Check if file still exists on disk
        if (!fs.existsSync(file.filePath)) {
            Logger.warn('File metadata exists but file missing from disk', { fileId });
            return {
                success: false,
                error: 'File not found on disk',
                message: 'The file metadata exists but the actual file is missing'
            };
        }

        return {
            success: true,
            file: file,
            message: 'File information retrieved successfully'
        };
    }

    /**
     * Download file
     */
    async downloadFile(fileId) {
        try {
            const fileInfo = this.getFileInfo(fileId);

            if (!fileInfo.success) {
                return fileInfo;
            }

            const file = fileInfo.file;
            const fileData = await fs.promises.readFile(file.filePath);

            Logger.info('File downloaded', { fileId, fileName: file.fileName });

            return {
                success: true,
                fileData: fileData,
                mimeType: file.mimeType,
                fileName: file.originalName,
                message: 'File downloaded successfully'
            };

        } catch (error) {
            Logger.error('File download failed', { error: error.message, fileId });

            return {
                success: false,
                error: error.message,
                message: 'File download failed'
            };
        }
    }

    /**
     * Delete file
     */
    async deleteFile(fileId) {
        try {
            const file = this.uploadedFiles.get(fileId);

            if (!file) {
                return {
                    success: false,
                    error: 'File not found',
                    message: 'The requested file does not exist'
                };
            }

            // Delete from disk
            if (fs.existsSync(file.filePath)) {
                await fs.promises.unlink(file.filePath);
            }

            // Remove from memory
            this.uploadedFiles.delete(fileId);

            Logger.info('File deleted successfully', { fileId, fileName: file.fileName });

            return {
                success: true,
                message: 'File deleted successfully'
            };

        } catch (error) {
            Logger.error('File deletion failed', { error: error.message, fileId });

            return {
                success: false,
                error: error.message,
                message: 'File deletion failed'
            };
        }
    }

    /**
     * List all uploaded files
     */
    listFiles(userId = null, isPublic = null) {
        let files = Array.from(this.uploadedFiles.values());

        // Filter by user if specified
        if (userId) {
            files = files.filter(file => file.uploadedBy === userId);
        }

        // Filter by public status if specified
        if (isPublic !== null) {
            files = files.filter(file => file.isPublic === isPublic);
        }

        return {
            success: true,
            files: files,
            total: files.length,
            message: 'Files listed successfully'
        };
    }

    /**
     * Get upload statistics
     */
    getUploadStats() {
        const files = Array.from(this.uploadedFiles.values());
        const totalFiles = files.length;
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);

        const typeStats = {};
        files.forEach(file => {
            typeStats[file.mimeType] = (typeStats[file.mimeType] || 0) + 1;
        });

        return {
            totalFiles,
            totalSize,
            averageSize: totalFiles > 0 ? Math.round(totalSize / totalFiles) : 0,
            typeDistribution: typeStats,
            allowedTypes: this.allowedTypes,
            maxFileSize: this.maxFileSize
        };
    }

    /**
     * Clean up old files (utility function)
     */
    async cleanupOldFiles(maxAgeHours = 24) {
        try {
            const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
            let cleanedCount = 0;

            for (const [fileId, file] of this.uploadedFiles.entries()) {
                if (new Date(file.uploadedAt) < cutoffTime) {
                    const deleteResult = await this.deleteFile(fileId);
                    if (deleteResult.success) {
                        cleanedCount++;
                    }
                }
            }

            Logger.info('File cleanup completed', { cleanedCount, maxAgeHours });

            return {
                success: true,
                cleanedCount,
                message: `Cleaned up ${cleanedCount} old files`
            };

        } catch (error) {
            Logger.error('File cleanup failed', { error: error.message });

            return {
                success: false,
                error: error.message,
                message: 'File cleanup failed'
            };
        }
    }
}

// Create singleton instance
const fileUploadHandler = new FileUploadHandler();

module.exports = fileUploadHandler;
