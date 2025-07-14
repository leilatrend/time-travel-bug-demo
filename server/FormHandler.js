function handleSave(data) {
  // Add null safety checks
  if (data && data.field && typeof data.field.length !== 'undefined') {
    console.log(data.field.length);
  } else {
    console.log('Invalid data: field is null or undefined');
  }
}

module.exports = { handleSave };
