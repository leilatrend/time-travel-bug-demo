function handleSave(data) {
  // Add null/undefined checks to prevent null pointer exception
  if (!data || !data.field) {
    console.log('Data or field is null/undefined, returning empty string');
    return '';
  }
  
  console.log(data.field.length); // Fixed: Now safe from null pointer exception
}

module.exports = { handleSave };
