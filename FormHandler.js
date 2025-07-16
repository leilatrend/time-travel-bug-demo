function handleSave(data) {
  // Add null/undefined checks to prevent crashes
  if (!data) {
    console.error('Error: No data provided to handleSave');
    return;
  }
  
  if (!data.field) {
    console.error('Error: No field property in data');
    return;
  }
  
  console.log(data.field.length); // Now safe to access
}

module.exports = { handleSave };
