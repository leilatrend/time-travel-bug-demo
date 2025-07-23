/**
 * Form Handler Module
 * Handles form data processing, validation, and saving
 */

// Validation utilities
function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw new Error(`${fieldName} is required`);
  }
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
}

function validateLength(value, fieldName, minLength = 0, maxLength = Infinity) {
  if (value && value.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} characters long`);
  }
  if (value && value.length > maxLength) {
    throw new Error(`${fieldName} must not exceed ${maxLength} characters`);
  }
}

// Data processing utilities
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  return input
    .trim()
    .replace(/[<>]/g, '') // Basic XSS protection
    .substring(0, 1000); // Limit length
}

function formatData(data) {
  const formatted = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      formatted[key] = sanitizeInput(value);
    } else {
      formatted[key] = value;
    }
  }

  return formatted;
}

// Logging utility
function logOperation(operation, data, success = true, error = null) {
  const timestamp = new Date().toISOString();
  const logLevel = success ? 'INFO' : 'ERROR';
  const message = success
    ? `${operation} completed successfully`
    : `${operation} failed: ${error?.message || 'Unknown error'}`;

  console.log(`[${timestamp}] [${logLevel}] ${message}`);

  if (success) {
    console.log('Data processed:', Object.keys(data).join(', '));
  }
}

// Main form handling functions
function validateFormData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data: must be an object');
  }

  // Check for field property and handle null pointer issue
  if (data.field !== undefined && data.field !== null) {
    validateLength(data.field, 'field', 1, 100);
    console.log(`Field length: ${data.field.length}`); // Fixed null pointer issue
  }

  // Validate email if present
  if (data.email) {
    validateEmail(data.email);
  }

  // Validate required fields based on form type
  if (data.name) {
    validateRequired(data.name, 'name');
    validateLength(data.name, 'name', 2, 50);
  }

  if (data.message) {
    validateLength(data.message, 'message', 0, 500);
  }
}

function handleSave(data) {
  try {
    logOperation('Form save operation started', data);

    // Validate input data
    validateFormData(data);

    // Format and sanitize data
    const formattedData = formatData(data);

    // Simulate save operation
    const savedData = {
      id: Date.now(),
      ...formattedData,
      createdAt: new Date().toISOString(),
      status: 'saved'
    };

    logOperation('Form save', savedData, true);

    return {
      success: true,
      data: savedData,
      message: 'Form data saved successfully'
    };

  } catch (error) {
    logOperation('Form save', data, false, error);

    return {
      success: false,
      error: error.message,
      message: 'Failed to save form data'
    };
  }
}

function handleUpdate(id, data) {
  try {
    logOperation('Form update operation started', { id, ...data });

    if (!id) {
      throw new Error('ID is required for update operation');
    }

    validateFormData(data);
    const formattedData = formatData(data);

    const updatedData = {
      id,
      ...formattedData,
      updatedAt: new Date().toISOString(),
      status: 'updated'
    };

    logOperation('Form update', updatedData, true);

    return {
      success: true,
      data: updatedData,
      message: 'Form data updated successfully'
    };

  } catch (error) {
    logOperation('Form update', { id, ...data }, false, error);

    return {
      success: false,
      error: error.message,
      message: 'Failed to update form data'
    };
  }
}

function handleDelete(id) {
  try {
    logOperation('Form delete operation started', { id });

    if (!id) {
      throw new Error('ID is required for delete operation');
    }

    // Simulate delete operation
    const result = {
      id,
      deletedAt: new Date().toISOString(),
      status: 'deleted'
    };

    logOperation('Form delete', result, true);

    return {
      success: true,
      data: result,
      message: 'Form data deleted successfully'
    };

  } catch (error) {
    logOperation('Form delete', { id }, false, error);

    return {
      success: false,
      error: error.message,
      message: 'Failed to delete form data'
    };
  }
}

function handleValidation(data) {
  try {
    validateFormData(data);

    return {
      success: true,
      message: 'Form data is valid',
      errors: []
    };

  } catch (error) {
    return {
      success: false,
      message: 'Form data validation failed',
      errors: [error.message]
    };
  }
}

module.exports = {
  handleSave,
  handleUpdate,
  handleDelete,
  handleValidation,
  validateFormData,
  formatData,
  sanitizeInput
};
