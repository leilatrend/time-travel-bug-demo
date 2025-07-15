function handleSave(data) {
  // Add null checks to prevent crashes
  if (data && data.field && typeof data.field.length !== 'undefined') {
    console.log(data.field.length);
  } else {
    console.log('Invalid or missing field data');
  }
}

module.exports = { handleSave };
