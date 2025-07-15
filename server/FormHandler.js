function handleSave(data) {
  // Add null/undefined checks before accessing nested properties
  if (data && data.field && typeof data.field.length !== 'undefined') {
    console.log(data.field.length);
  } else {
    console.log('No field data provided or field is not iterable');
  }
}

module.exports = { handleSave };
