/**
 * Cache Manager
 * Advanced caching system with TTL, LRU eviction, and memory management
 */

const Logger = require('./Logger');

class CacheManager {
    constructor(options = {}) {
        this.maxSize = options.maxSize || 1000; // Maximum number of entries
        this.maxMemory = options.maxMemory || 50 * 1024 * 1024; // 50MB default
        this.defaultTTL = options.defaultTTL || 3600000; // 1 hour default TTL
        this.cleanupInterval = options.cleanupInterval || 300000; // 5 minutes

        this.cache = new Map();
        this.accessOrder = new Map(); // For LRU tracking
        this.timers = new Map(); // TTL timers
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0,
            memoryUsage: 0,
            startTime: Date.now()
        };

        this.startCleanupTimer();
        Logger.info('Cache Manager initialized', {
            maxSize: this.maxSize,
            maxMemory: this.formatBytes(this.maxMemory),
            defaultTTL: `${this.defaultTTL}ms`
        });
    }

    /**
     * Set a value in cache with optional TTL
     */
    set(key, value, ttl = null) {
        const actualTTL = ttl || this.defaultTTL;
        const now = Date.now();
        const expiresAt = actualTTL > 0 ? now + actualTTL : null;

        // Calculate memory size
        const size = this.calculateSize(key, value);

        // Remove existing entry if it exists
        if (this.cache.has(key)) {
            this.delete(key, false); // Don't count as user deletion
        }

        // Check memory limit before adding
        if (this.stats.memoryUsage + size > this.maxMemory) {
            this.evictMemory(size);
        }

        // Check size limit and evict LRU if necessary
        if (this.cache.size >= this.maxSize) {
            this.evictLRU();
        }

        // Store the entry
        const entry = {
            value,
            createdAt: now,
            expiresAt,
            lastAccessed: now,
            accessCount: 0,
            size
        };

        this.cache.set(key, entry);
        this.accessOrder.set(key, now);
        this.stats.memoryUsage += size;
        this.stats.sets++;

        // Set TTL timer if applicable
        if (expiresAt) {
            const timer = setTimeout(() => {
                this.delete(key, false);
                Logger.debug('Cache entry expired', { key, ttl: actualTTL });
            }, actualTTL);

            // Timer reference stored but never cleared on manual deletion
            this.timers.set(key, timer);
        }

        Logger.debug('Cache entry set', {
            key,
            size: this.formatBytes(size),
            ttl: actualTTL > 0 ? `${actualTTL}ms` : 'no expiry',
            totalEntries: this.cache.size,
            memoryUsage: this.formatBytes(this.stats.memoryUsage)
        });
    }

    /**
     * Get a value from cache
     */
    get(key) {
        const entry = this.cache.get(key);

        if (!entry) {
            this.stats.misses++;
            Logger.debug('Cache miss', { key });
            return null;
        }

        // Check if expired
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.delete(key, false);
            this.stats.misses++;
            Logger.debug('Cache entry expired on access', { key });
            return null;
        }

        // Update access tracking
        const now = Date.now();
        entry.lastAccessed = now;
        entry.accessCount++;
        this.accessOrder.set(key, now);
        this.stats.hits++;

        Logger.debug('Cache hit', {
            key,
            accessCount: entry.accessCount,
            age: now - entry.createdAt
        });

        return entry.value;
    }

    /**
     * Check if key exists in cache
     */
    has(key) {
        const entry = this.cache.get(key);

        if (!entry) {
            return false;
        }

        // Check if expired
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.delete(key, false);
            return false;
        }

        return true;
    }

    /**
     * Delete a key from cache
     */
    delete(key, userDeletion = true) {
        const entry = this.cache.get(key);

        if (!entry) {
            return false;
        }

        // Clean up timer
        const timer = this.timers.get(key);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(key);
        }

        // Remove from cache
        this.cache.delete(key);
        this.accessOrder.delete(key);
        this.stats.memoryUsage -= entry.size;

        if (userDeletion) {
            this.stats.deletes++;
            Logger.debug('Cache entry deleted by user', {
                key,
                size: this.formatBytes(entry.size)
            });
        }

        return true;
    }

    /**
     * Clear all cache entries
     */
    clear() {
        const entriesCount = this.cache.size;
        const memoryUsage = this.stats.memoryUsage;

        // Clear all timers
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }

        this.cache.clear();
        this.accessOrder.clear();
        this.timers.clear();
        this.stats.memoryUsage = 0;

        Logger.info('Cache cleared', {
            entriesRemoved: entriesCount,
            memoryFreed: this.formatBytes(memoryUsage)
        });
    }

    /**
     * Get or set a value (cache-aside pattern)
     */
    async getOrSet(key, asyncFunction, ttl = null) {
        const cached = this.get(key);

        if (cached !== null) {
            return cached;
        }

        try {
            const value = await asyncFunction();
            this.set(key, value, ttl);
            return value;
        } catch (error) {
            Logger.error('Error in getOrSet async function', { key, error: error.message });
            throw error;
        }
    }

    /**
     * Evict least recently used entries
     */
    evictLRU() {
        if (this.cache.size === 0) return;

        // Find the least recently used key
        let oldestKey = null;
        let oldestTime = Infinity;

        for (const [key, time] of this.accessOrder.entries()) {
            if (time < oldestTime) {
                oldestTime = time;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            const entry = this.cache.get(oldestKey);
            this.delete(oldestKey, false);
            this.stats.evictions++;

            Logger.debug('LRU eviction', {
                key: oldestKey,
                age: Date.now() - (entry?.createdAt || 0),
                size: this.formatBytes(entry?.size || 0)
            });
        }
    }

    /**
     * Evict entries to free memory
     */
    evictMemory(requiredSize) {
        const targetSize = this.stats.memoryUsage + requiredSize - this.maxMemory;
        let freedSize = 0;

        // Sort by access time (oldest first)
        const sortedEntries = Array.from(this.accessOrder.entries())
            .sort((a, b) => a[1] - b[1]);

        for (const [key] of sortedEntries) {
            if (freedSize >= targetSize) break;

            const entry = this.cache.get(key);
            if (entry) {
                freedSize += entry.size;
                this.delete(key, false);
                this.stats.evictions++;
            }
        }

        Logger.info('Memory eviction completed', {
            targetSize: this.formatBytes(targetSize),
            freedSize: this.formatBytes(freedSize),
            entriesEvicted: sortedEntries.length
        });
    }

    /**
     * Calculate memory size of cache entry
     */
    calculateSize(key, value) {
        const keySize = new Blob([key]).size;
        let valueSize = 0;

        if (typeof value === 'string') {
            valueSize = new Blob([value]).size;
        } else if (typeof value === 'object' && value !== null) {
            try {
                valueSize = new Blob([JSON.stringify(value)]).size;
            } catch (e) {
                // Fallback for non-serializable objects
                valueSize = 1024; // Estimate 1KB
            }
        } else {
            valueSize = 64; // Estimate for primitives
        }

        return keySize + valueSize + 200; // Add overhead for metadata
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const uptime = Date.now() - this.stats.startTime;
        const hitRate = this.stats.hits + this.stats.misses > 0
            ? this.stats.hits / (this.stats.hits + this.stats.misses)
            : 0;

        return {
            entries: this.cache.size,
            memoryUsage: this.formatBytes(this.stats.memoryUsage),
            memoryUsageBytes: this.stats.memoryUsage,
            maxMemory: this.formatBytes(this.maxMemory),
            memoryUtilization: (this.stats.memoryUsage / this.maxMemory * 100).toFixed(2) + '%',
            hits: this.stats.hits,
            misses: this.stats.misses,
            hitRate: (hitRate * 100).toFixed(2) + '%',
            sets: this.stats.sets,
            deletes: this.stats.deletes,
            evictions: this.stats.evictions,
            uptime: this.formatDuration(uptime)
        };
    }

    /**
     * Get detailed cache information
     */
    getDetailedInfo() {
        const entries = [];
        const now = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            entries.push({
                key,
                size: this.formatBytes(entry.size),
                age: this.formatDuration(now - entry.createdAt),
                lastAccessed: this.formatDuration(now - entry.lastAccessed),
                accessCount: entry.accessCount,
                expiresIn: entry.expiresAt ? this.formatDuration(entry.expiresAt - now) : 'no expiry',
                expired: entry.expiresAt ? now > entry.expiresAt : false
            });
        }

        // Sort by access count (most accessed first)
        entries.sort((a, b) => b.accessCount - a.accessCount);

        return {
            stats: this.getStats(),
            entries: entries.slice(0, 50), // Return top 50 entries
            totalEntries: entries.length
        };
    }

    /**
     * Get top accessed entries
     */
    getTopEntries(limit = 10) {
        const entries = Array.from(this.cache.entries())
            .map(([key, entry]) => ({
                key,
                accessCount: entry.accessCount,
                size: this.formatBytes(entry.size),
                age: this.formatDuration(Date.now() - entry.createdAt)
            }))
            .sort((a, b) => b.accessCount - a.accessCount)
            .slice(0, limit);

        return entries;
    }

    /**
     * Cleanup expired entries
     */
    cleanup() {
        const now = Date.now();
        let removedCount = 0;
        let freedMemory = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.expiresAt && now > entry.expiresAt) {
                freedMemory += entry.size;
                this.delete(key, false);
                removedCount++;
            }
        }

        if (removedCount > 0) {
            Logger.info('Cache cleanup completed', {
                removedEntries: removedCount,
                freedMemory: this.formatBytes(freedMemory),
                remainingEntries: this.cache.size
            });
        }
    }

    /**
     * Start automatic cleanup timer
     */
    startCleanupTimer() {
        setInterval(() => {
            this.cleanup();
        }, this.cleanupInterval);

        Logger.debug('Cache cleanup timer started', {
            interval: this.formatDuration(this.cleanupInterval)
        });
    }

    /**
     * Preload cache with data
     */
    preload(data, defaultTTL = null) {
        let loadedCount = 0;

        for (const [key, value] of Object.entries(data)) {
            this.set(key, value, defaultTTL);
            loadedCount++;
        }

        Logger.info('Cache preloaded', {
            entriesLoaded: loadedCount,
            memoryUsage: this.formatBytes(this.stats.memoryUsage)
        });
    }

    /**
     * Export cache data
     */
    export() {
        const data = {};

        for (const [key, entry] of this.cache.entries()) {
            // Only export non-expired entries
            if (!entry.expiresAt || Date.now() < entry.expiresAt) {
                data[key] = {
                    value: entry.value,
                    createdAt: entry.createdAt,
                    expiresAt: entry.expiresAt
                };
            }
        }

        return data;
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
        if (ms < 0) return 'expired';

        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }
}

// Create singleton instance
const cacheManager = new CacheManager();

module.exports = { CacheManager, cacheManager };
