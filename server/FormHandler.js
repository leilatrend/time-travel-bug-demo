function handleSave(data) {
  // Fix: Add null/undefined checks to prevent crash
  if (data && data.field && typeof data.field.length !== 'undefined') {
    console.log(data.field.length);
  } else {
    console.log('No field data provided or field has no length property');
  }
}

module.exports = { handleSave };
