function handleSave(data) {
  // Enhanced null/undefined checks with better error handling
  if (!data) {
    console.error('Error: data parameter is null or undefined');
    return null;
  }
  
  if (!data.field) {
    console.warn('Warning: data.field is null or undefined');
    return 0;
  }
  
  // Safe access to field length
  const fieldLength = data.field.length;
  console.log('Field length:', fieldLength);
  return fieldLength;
}

module.exports = { handleSave };
