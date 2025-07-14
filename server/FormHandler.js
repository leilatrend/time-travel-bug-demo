function handleSave(data) {
  // Comprehensive null safety checks to prevent crashes
  try {
    if (!data) {
      console.error('Error: data parameter is null or undefined');
      return null;
    }
    
    if (!data.field) {
      console.warn('Warning: data.field is null or undefined');
      return 0;
    }
    
    // Additional type checking for robust error handling
    if (typeof data.field !== 'string' && !Array.isArray(data.field)) {
      console.warn('Warning: data.field is not a string or array');
      return 0;
    }
    
    // Safe access to field length with proper error handling
    const fieldLength = data.field.length;
    console.log('Field length:', fieldLength);
    return fieldLength;
    
  } catch (error) {
    console.error('Error in handleSave:', error.message);
    return null;
  }
}

module.exports = { handleSave };
