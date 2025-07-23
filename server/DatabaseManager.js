/**
 * Database Manager Module
 * Handles database operations and data persistence
 */

class DatabaseManager {
  constructor() {
    this.data = new Map(); // In-memory storage for demo
    this.lastId = 0;
  }

  /**
   * Generate a new unique ID
   */
  generateId() {
    return ++this.lastId;
  }

  /**
   * Create a new record
   */
  create(data) {
    const id = this.generateId();
    const record = {
      id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.data.set(id, record);
    return record;
  }

  /**
   * Read a record by ID
   */
  read(id) {
    return this.data.get(id) || null;
  }

  /**
   * Update an existing record
   */
  update(id, data) {
    const existing = this.data.get(id);
    if (!existing) {
      throw new Error(`Record with ID ${id} not found`);
    }

    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.data.set(id, updated);
    return updated;
  }

  /**
   * Delete a record by ID
   */
  delete(id) {
    const existing = this.data.get(id);
    if (!existing) {
      throw new Error(`Record with ID ${id} not found`);
    }

    this.data.delete(id);
    return { ...existing, deletedAt: new Date().toISOString() };
  }

  /**
   * Get all records
   */
  getAll() {
    return Array.from(this.data.values());
  }

  /**
   * Find records by criteria
   */
  find(criteria) {
    const records = this.getAll();
    return records.filter(record => {
      return Object.entries(criteria).every(([key, value]) => {
        return record[key] === value;
      });
    });
  }

  /**
   * Count total records
   */
  count() {
    return this.data.size;
  }

  /**
   * Clear all data
   */
  clear() {
    this.data.clear();
    this.lastId = 0;
  }

  /**
   * Get database statistics
   */
  getStats() {
    return {
      totalRecords: this.count(),
      lastId: this.lastId,
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }
}

// Create singleton instance
const dbManager = new DatabaseManager();

module.exports = dbManager;
