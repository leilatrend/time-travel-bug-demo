function handleSave(data) {
  // Add null/undefined checks to prevent crashes
  if (data && data.field && typeof data.field.length !== 'undefined') {
    console.log(data.field.length);
  } else {
    console.log('Invalid data or field is null/undefined');
  }
}

module.exports = { handleSave };
