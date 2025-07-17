function handleSave(data) {
  if (!data.field) {
    console.error('Field is missing in data:', data);
    return;
  }
  console.log(data.field.length);
}

module.exports = { handleSave };
