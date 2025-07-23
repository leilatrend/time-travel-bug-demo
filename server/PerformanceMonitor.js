/**
 * Performance Monitor
 * Tracks and analyzes application performance metrics
 */

const Logger = require('./Logger');

class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.activeRequests = new Map();
        this.systemMetrics = {
            startTime: Date.now(),
            requestCount: 0,
            errorCount: 0,
            averageResponseTime: 0,
            peakMemoryUsage: 0,
            slowestEndpoint: null,
            fastestEndpoint: null
        };

        this.thresholds = {
            slowRequest: 1000, // ms
            highMemory: 100 * 1024 * 1024, // 100MB
            errorRateWarning: 0.1 // 10%
        };

        this.startSystemMonitoring();
    }

    /**
     * Start monitoring system resources
     */
    startSystemMonitoring() {
        // Monitor memory usage every 30 seconds
        setInterval(() => {
            const memoryUsage = process.memoryUsage();
            this.updateMemoryMetrics(memoryUsage);

            // Log warning if memory usage is high
            if (memoryUsage.heapUsed > this.thresholds.highMemory) {
                Logger.warn('High memory usage detected', {
                    heapUsed: this.formatBytes(memoryUsage.heapUsed),
                    heapTotal: this.formatBytes(memoryUsage.heapTotal),
                    threshold: this.formatBytes(this.thresholds.highMemory)
                });
            }
        }, 30000);

        // Log performance summary every 5 minutes
        setInterval(() => {
            this.logPerformanceSummary();
        }, 300000);
    }

    /**
     * Start tracking a request
     */
    startRequest(requestId, method, path, userAgent = null) {
        const startTime = Date.now();
        const memoryBefore = process.memoryUsage();

        this.activeRequests.set(requestId, {
            method,
            path,
            startTime,
            memoryBefore,
            userAgent
        });

        this.systemMetrics.requestCount++;

        Logger.debug('Request started', {
            requestId,
            method,
            path,
            memoryBefore: this.formatBytes(memoryBefore.heapUsed)
        });
    }

    /**
     * End tracking a request
     */
    endRequest(requestId, statusCode, responseSize = 0) {
        const endTime = Date.now();
        const memoryAfter = process.memoryUsage();
        const requestData = this.activeRequests.get(requestId);

        if (!requestData) {
            Logger.warn('Request not found in active tracking', { requestId });
            return;
        }

        const duration = endTime - requestData.startTime;
        const memoryDiff = memoryAfter.heapUsed - requestData.memoryBefore.heapUsed;
        const endpoint = `${requestData.method} ${requestData.path}`;

        // Store metrics
        this.addMetric(endpoint, {
            duration,
            statusCode,
            responseSize,
            memoryDiff,
            timestamp: endTime,
            userAgent: requestData.userAgent
        });

        // Update system averages
        this.updateSystemMetrics(duration, statusCode, endpoint);

        // Remove from active requests
        this.activeRequests.delete(requestId);

        // Log slow requests
        if (duration > this.thresholds.slowRequest) {
            Logger.warn('Slow request detected', {
                requestId,
                endpoint,
                duration: `${duration}ms`,
                statusCode,
                memoryDiff: this.formatBytes(memoryDiff)
            });
        }

        Logger.debug('Request completed', {
            requestId,
            endpoint,
            duration: `${duration}ms`,
            statusCode,
            responseSize: this.formatBytes(responseSize)
        });
    }

    /**
     * Add performance metric
     */
    addMetric(endpoint, data) {
        if (!this.metrics.has(endpoint)) {
            this.metrics.set(endpoint, {
                totalRequests: 0,
                totalDuration: 0,
                averageDuration: 0,
                minDuration: Infinity,
                maxDuration: 0,
                errorCount: 0,
                successCount: 0,
                totalResponseSize: 0,
                memoryImpact: 0,
                recentRequests: []
            });
        }

        const metrics = this.metrics.get(endpoint);
        metrics.totalRequests++;
        metrics.totalDuration += data.duration;
        metrics.averageDuration = metrics.totalDuration / metrics.totalRequests;
        metrics.minDuration = Math.min(metrics.minDuration, data.duration);
        metrics.maxDuration = Math.max(metrics.maxDuration, data.duration);
        metrics.totalResponseSize += data.responseSize;
        metrics.memoryImpact += data.memoryDiff;

        if (data.statusCode >= 400) {
            metrics.errorCount++;
        } else {
            metrics.successCount++;
        }

        // Keep recent requests (last 100)
        metrics.recentRequests.push({
            duration: data.duration,
            statusCode: data.statusCode,
            timestamp: data.timestamp,
            userAgent: data.userAgent
        });

        if (metrics.recentRequests.length > 100) {
            metrics.recentRequests.shift();
        }
    }

    /**
     * Update system-wide metrics
     */
    updateSystemMetrics(duration, statusCode, endpoint) {
        // Update average response time
        const totalRequests = this.systemMetrics.requestCount;
        this.systemMetrics.averageResponseTime =
            (this.systemMetrics.averageResponseTime * (totalRequests - 1) + duration) / totalRequests;

        // Track errors
        if (statusCode >= 400) {
            this.systemMetrics.errorCount++;
        }

        // Update slowest/fastest endpoints
        const endpointMetrics = this.metrics.get(endpoint);
        if (endpointMetrics) {
            if (!this.systemMetrics.slowestEndpoint ||
                endpointMetrics.averageDuration > this.metrics.get(this.systemMetrics.slowestEndpoint)?.averageDuration) {
                this.systemMetrics.slowestEndpoint = endpoint;
            }

            if (!this.systemMetrics.fastestEndpoint ||
                endpointMetrics.averageDuration < this.metrics.get(this.systemMetrics.fastestEndpoint)?.averageDuration) {
                this.systemMetrics.fastestEndpoint = endpoint;
            }
        }
    }

    /**
     * Update memory metrics
     */
    updateMemoryMetrics(memoryUsage) {
        this.systemMetrics.peakMemoryUsage = Math.max(
            this.systemMetrics.peakMemoryUsage,
            memoryUsage.heapUsed
        );
    }

    /**
     * Get comprehensive performance report
     */
    getPerformanceReport() {
        const uptime = Date.now() - this.systemMetrics.startTime;
        const errorRate = this.systemMetrics.requestCount > 0
            ? this.systemMetrics.errorCount / this.systemMetrics.requestCount
            : 0;

        const endpointStats = [];
        for (const [endpoint, metrics] of this.metrics.entries()) {
            endpointStats.push({
                endpoint,
                totalRequests: metrics.totalRequests,
                averageResponseTime: Math.round(metrics.averageDuration),
                minResponseTime: metrics.minDuration === Infinity ? 0 : metrics.minDuration,
                maxResponseTime: metrics.maxDuration,
                errorRate: metrics.totalRequests > 0 ? metrics.errorCount / metrics.totalRequests : 0,
                averageResponseSize: metrics.totalRequests > 0
                    ? Math.round(metrics.totalResponseSize / metrics.totalRequests)
                    : 0,
                memoryImpact: this.formatBytes(metrics.memoryImpact)
            });
        }

        // Sort by total requests
        endpointStats.sort((a, b) => b.totalRequests - a.totalRequests);

        return {
            system: {
                uptime: this.formatDuration(uptime),
                totalRequests: this.systemMetrics.requestCount,
                totalErrors: this.systemMetrics.errorCount,
                errorRate: Math.round(errorRate * 100 * 100) / 100, // percentage with 2 decimals
                averageResponseTime: Math.round(this.systemMetrics.averageResponseTime),
                peakMemoryUsage: this.formatBytes(this.systemMetrics.peakMemoryUsage),
                currentMemoryUsage: this.formatBytes(process.memoryUsage().heapUsed),
                slowestEndpoint: this.systemMetrics.slowestEndpoint,
                fastestEndpoint: this.systemMetrics.fastestEndpoint
            },
            endpoints: endpointStats,
            activeRequests: this.activeRequests.size,
            warnings: this.generateWarnings(errorRate)
        };
    }

    /**
     * Generate performance warnings
     */
    generateWarnings(errorRate) {
        const warnings = [];
        const currentMemory = process.memoryUsage().heapUsed;

        if (errorRate > this.thresholds.errorRateWarning) {
            warnings.push({
                type: 'high_error_rate',
                message: `Error rate (${Math.round(errorRate * 100)}%) exceeds threshold (${this.thresholds.errorRateWarning * 100}%)`,
                severity: 'warning'
            });
        }

        if (currentMemory > this.thresholds.highMemory) {
            warnings.push({
                type: 'high_memory_usage',
                message: `Memory usage (${this.formatBytes(currentMemory)}) exceeds threshold (${this.formatBytes(this.thresholds.highMemory)})`,
                severity: 'warning'
            });
        }

        if (this.systemMetrics.averageResponseTime > this.thresholds.slowRequest) {
            warnings.push({
                type: 'slow_response_time',
                message: `Average response time (${Math.round(this.systemMetrics.averageResponseTime)}ms) exceeds threshold (${this.thresholds.slowRequest}ms)`,
                severity: 'warning'
            });
        }

        return warnings;
    }

    /**
     * Get endpoint-specific metrics
     */
    getEndpointMetrics(endpoint) {
        return this.metrics.get(endpoint) || null;
    }

    /**
     * Get top slow endpoints
     */
    getSlowEndpoints(limit = 10) {
        const endpoints = Array.from(this.metrics.entries())
            .map(([endpoint, metrics]) => ({
                endpoint,
                averageResponseTime: metrics.averageDuration,
                totalRequests: metrics.totalRequests,
                maxResponseTime: metrics.maxDuration
            }))
            .sort((a, b) => b.averageResponseTime - a.averageResponseTime)
            .slice(0, limit);

        return endpoints;
    }

    /**
     * Get recent performance trends
     */
    getPerformanceTrends(timeframeMs = 3600000) { // Last hour by default
        const cutoff = Date.now() - timeframeMs;
        const trends = {};

        for (const [endpoint, metrics] of this.metrics.entries()) {
            const recentRequests = metrics.recentRequests.filter(req => req.timestamp > cutoff);

            if (recentRequests.length > 0) {
                const avgDuration = recentRequests.reduce((sum, req) => sum + req.duration, 0) / recentRequests.length;
                const errorCount = recentRequests.filter(req => req.statusCode >= 400).length;

                trends[endpoint] = {
                    requestCount: recentRequests.length,
                    averageResponseTime: Math.round(avgDuration),
                    errorRate: recentRequests.length > 0 ? errorCount / recentRequests.length : 0,
                    timeframe: this.formatDuration(timeframeMs)
                };
            }
        }

        return trends;
    }

    /**
     * Reset all metrics
     */
    resetMetrics() {
        this.metrics.clear();
        this.activeRequests.clear();
        this.systemMetrics = {
            startTime: Date.now(),
            requestCount: 0,
            errorCount: 0,
            averageResponseTime: 0,
            peakMemoryUsage: process.memoryUsage().heapUsed,
            slowestEndpoint: null,
            fastestEndpoint: null
        };

        Logger.info('Performance metrics reset');
    }

    /**
     * Log performance summary
     */
    logPerformanceSummary() {
        const report = this.getPerformanceReport();

        Logger.info('Performance Summary', {
            uptime: report.system.uptime,
            totalRequests: report.system.totalRequests,
            averageResponseTime: `${report.system.averageResponseTime}ms`,
            errorRate: `${report.system.errorRate}%`,
            activeRequests: report.activeRequests,
            memoryUsage: report.system.currentMemoryUsage
        });

        // Log warnings if any
        if (report.warnings.length > 0) {
            report.warnings.forEach(warning => {
                Logger.warn('Performance Warning', warning);
            });
        }
    }

    /**
     * Format bytes to human readable format
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Format duration to human readable format
     */
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    /**
     * Export metrics to JSON
     */
    exportMetrics() {
        return {
            timestamp: new Date().toISOString(),
            systemMetrics: this.systemMetrics,
            endpointMetrics: Object.fromEntries(this.metrics),
            performanceReport: this.getPerformanceReport()
        };
    }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

module.exports = performanceMonitor;
