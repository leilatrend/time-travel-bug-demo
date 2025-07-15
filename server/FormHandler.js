function handleSave(data) {
  // Add null safety checks to prevent crashes
  if (!data) {
    console.log('Error: No data provided');
    return;
  }
  
  if (!data.field) {
    console.log('Error: No field data provided');
    return;
  }
  
  console.log(data.field.length); // Now safe from null pointer exceptions
}

module.exports = { handleSave };
