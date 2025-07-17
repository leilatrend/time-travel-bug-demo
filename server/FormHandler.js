function handleSave(data) {
  // Fix: check if data and field exist and field is an array or string
  if (data && data.field && typeof data.field.length === 'number') {
    console.log(data.field.length);
  } else {
    console.error("Error: 'field' is missing or invalid in data");
  }
}

module.exports = { handleSave };
