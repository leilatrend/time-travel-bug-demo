function handleSave(data) {
  if (!data || !data.field) {
    console.error("Invalid form data:", data);
    return;
  }
  console.log(data.field.length);
}

module.exports = { handleSave };
