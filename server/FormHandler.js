function handleSave(data) {
  console.log(data && data.field ? data.field.length : 0); // Fixed null pointer exception
}

module.exports = { handleSave };
