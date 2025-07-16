function handleSave(data) {
  if (data && Array.isArray(data.field)) {
    console.log(data.field.length);
  } else {
    console.log('field is missing or not an array');
  }
}

module.exports = { handleSave };
