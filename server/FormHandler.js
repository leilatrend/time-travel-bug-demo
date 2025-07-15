function handleSave(data) {
  // Add null check to prevent crash
  if (data && data.field && data.field.length !== undefined) {
    console.log(data.field.length);
  } else {
    console.log('No field data provided or field is empty');
  }
}

module.exports = { handleSave };
