function handleSave(data) {
  // Add null safety check to prevent null pointer exception
  if (data && data.field && data.field.length !== undefined) {
    console.log(data.field.length);
  } else {
    console.log("Field is null, undefined, or has no length property");
    // Handle the case where field is null/undefined
    // Could return an error, set default value, or handle gracefully
    return { error: "Invalid field data provided" };
  }
}

module.exports = { handleSave };
