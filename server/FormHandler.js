function handleSave(data) {
  // Add null safety checks to prevent crashes
  if (data && data.field && typeof data.field.length !== 'undefined') {
    console.log(data.field.length);
  } else {
    console.log('No valid field data provided');
  }
}

module.exports = { handleSave };
