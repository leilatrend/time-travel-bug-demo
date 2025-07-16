function handleSave(data) {
  if (data && Array.isArray(data.field)) {
    console.log(data.field.length);
  } else {
    console.warn("Warning: data.field is missing or not an array", data.field);
    console.log(0);
  }
}

module.exports = { handleSave };

