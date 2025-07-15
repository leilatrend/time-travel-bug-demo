function handleSave(data) {
  // Fix: Add null/undefined checking before accessing field properties
  if (data && data.field && data.field.length !== undefined) {
    console.log(data.field.length);
  } else {
    console.log('No field data provided or field is empty');
  }
}

module.exports = { handleSave };
