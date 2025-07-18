function handleSave(data) {
  // Add null checks to prevent crashes
  if (data && data.field && data.field.length !== undefined) {
    console.log(data.field.length);
  } else {
    console.log('Data or field is null/undefined');
  }
}

module.exports = { handleSave };
