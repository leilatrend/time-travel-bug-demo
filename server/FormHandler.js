function handleSave(data) {
  if (data.field && Array.isArray(data.field)) {
    console.log(data.field.length);
  } else {
    console.log('Field is missing or not an array');
  }
}

module.exports = { handleSave };
