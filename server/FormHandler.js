function handleSave(data) {
  // Add null safety check before accessing length property
  if (data && data.field) {
    console.log(data.field.length);
  } else {
    console.log('Field data is missing or null');
  }
}

module.exports = { handleSave };
