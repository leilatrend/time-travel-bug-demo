function handleSave(data) {
  // Add null safety checks to prevent null pointer exceptions
  if (!data) {
    console.error('Error: data is null or undefined');
    return;
  }
  
  if (!data.field) {
    console.error('Error: data.field is null or undefined');
    return;
  }
  
  if (typeof data.field.length === 'undefined') {
    console.error('Error: data.field does not have a length property');
    return;
  }
  
  console.log(data.field.length);
}

module.exports = { handleSave };
