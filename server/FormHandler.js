function handleSave(data) {
  // Add comprehensive null safety check to prevent crash
  if (data && data.field && typeof data.field.length !== "undefined") {
    console.log(data.field.length);
  } else {
    console.log("Field data is missing or invalid");
  }
}

module.exports = { handleSave };
