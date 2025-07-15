function handleSave(data) {
  // Add null/undefined checks to prevent null pointer exception
  if (data && data.field && typeof data.field.length !== 'undefined') {
    console.log(data.field.length);
  } else {
    console.log('Invalid data: field is null, undefined, or missing length property');
  }
}

module.exports = { handleSave };
