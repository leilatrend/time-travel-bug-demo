function handleSave(data) {
  if (data && data.field) {
    console.log(data.field.length);
  } else {
    console.error("Field data is missing or null", data);
  }
}

module.exports = { handleSave };
