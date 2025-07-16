function handleSave(data) {
  if (data && data.field) {
    console.log(data.field.length);
  } else {
    console.log("field is missing or null");
  }
}

module.exports = { handleSave };
