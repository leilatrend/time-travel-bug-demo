function handleSave(data) {
  // Add null checks to prevent null pointer exception
  if (data && data.field && data.field.length !== undefined) {
    console.log(data.field.length);
  } else {
    console.log('Invalid data provided - field is missing or null');
  }
}

module.exports = { handleSave };
