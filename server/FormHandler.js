function handleSave(data) {
  // Add null safety checks to prevent crashes
  if (data && data.field && typeof data.field.length !== 'undefined') {
    console.log(data.field.length);
  } else {
    console.log('Warning: Field data is missing or invalid');
  }
}

module.exports = { handleSave };
