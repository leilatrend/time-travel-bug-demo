function handleSave(data) {
  // Add null checks to prevent crashes
  if (!data) {
    console.error('Error: No data provided');
    return;
  }
  
  if (!data.field) {
    console.error('Error: No field property in data');
    return;
  }
  
  console.log(data.field.length); // Now safe to access
}

module.exports = { handleSave };
