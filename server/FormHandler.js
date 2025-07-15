function handleSave(data) {
  if (!data || !data.field) {
    console.error("Missing field data");
    return;
  }
  console.log(data.field.length);
}

module.exports = { handleSave };
