function handleSave(data) {
  // Null check to prevent crash when data.field is undefined/null
  if (data && data.field && typeof data.field.length !== 'undefined') {
    console.log(data.field.length);
  } else {
    console.log('Field data is not available or invalid');
  }
}

module.exports = { handleSave };
