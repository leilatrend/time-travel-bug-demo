function handleSave(data) {
  // Add null safety checks to prevent crashes
  if (data && data.field && data.field.length !== undefined) {
    console.log(data.field.length);
  } else {
    console.log('Field data is invalid or missing');
  }
}

module.exports = { handleSave };
